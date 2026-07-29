import { randomUUID } from "node:crypto";
import { Prisma } from "@prisma/client";
import type {
  AuditLog,
  DashboardDlqItem,
  DashboardOperations,
  DashboardRange,
  DashboardSummary,
} from "api-contracts";
import { kafka, kafkaTopics, measureKafkaLatency } from "@/config/kafka.config.ts";
import { redisClient } from "@/config/redis.config.ts";
import { prisma } from "@/infrastructure/database/prisma.client.ts";
import { addOutboxEvent } from "@/infrastructure/events/outbox.repository.ts";
import * as DashboardRepository from "../infrastructure/dashboard.repository.ts";

export const dashboardRanges: DashboardRange[] = ["7d", "30d", "3m", "6m", "1y"];
const staleThresholdMs = Number(process.env.DASHBOARD_STALE_THRESHOLD_MS || 120_000);

interface StoredSnapshot {
  ranges: Record<DashboardRange, Omit<DashboardSummary, "range" | "metadata" | "recentActivity">>;
  recentActivity: DashboardSummary["recentActivity"];
}

export interface ReceiptContext {
  eventId: string;
  topic: string;
  eventType: string;
  eventVersion: number;
  aggregateId: string;
  correlationId: string;
  payload: object;
  partition: number;
  offset: string;
  attempts: number;
}

export interface SnapshotResult {
  version: number;
  updatedAt: string;
  reason: string;
  correlationId: string;
}

function parseSnapshot(value: Prisma.JsonValue): StoredSnapshot {
  return JSON.parse(JSON.stringify(value)) as StoredSnapshot;
}

async function calculateSnapshot(): Promise<StoredSnapshot> {
  const [rangeEntries, recentActivity] = await Promise.all([
    Promise.all(dashboardRanges.map(async (range) => [range, await DashboardRepository.aggregateRange(range)] as const)),
    DashboardRepository.getDashboardActivities(),
  ]);
  return {
    ranges: Object.fromEntries(rangeEntries) as StoredSnapshot["ranges"],
    recentActivity,
  };
}

export async function refreshDashboardSnapshot(input: {
  reason: string;
  correlationId?: string;
  sourceEventCount?: number;
  receipt?: ReceiptContext;
}): Promise<SnapshotResult> {
  const startedAt = performance.now();
  const correlationId = input.correlationId ?? randomUUID();
  const snapshot = await calculateSnapshot();
  const durationMs = Math.round(performance.now() - startedAt);
  const value = JSON.parse(JSON.stringify(snapshot)) as Prisma.InputJsonValue;
  const result = await prisma.$transaction(async (tx) => {
    const rows = await tx.$queryRaw<Array<{ version: bigint; updated_at: Date }>>(Prisma.sql`
      INSERT INTO dashboard_stats(key, value, updated_at, version, refresh_duration_ms, source_event_count, reason)
      VALUES ('summary', ${value}, now(), 1, ${durationMs}, ${input.sourceEventCount ?? 0}, ${input.reason})
      ON CONFLICT (key) DO UPDATE SET
        value = EXCLUDED.value,
        updated_at = now(),
        version = dashboard_stats.version + 1,
        refresh_duration_ms = EXCLUDED.refresh_duration_ms,
        source_event_count = EXCLUDED.source_event_count,
        reason = EXCLUDED.reason
      RETURNING version, updated_at`);
    if (input.receipt) {
      const receipt = input.receipt;
      await tx.dashboard_event_receipts.upsert({
        where: { event_id: receipt.eventId },
        create: {
          event_id: receipt.eventId,
          topic: receipt.topic,
          event_type: receipt.eventType,
          event_version: receipt.eventVersion,
          aggregate_id: receipt.aggregateId,
          correlation_id: receipt.correlationId,
          payload: receipt.payload,
          status: "processed",
          attempts: receipt.attempts,
          partition: receipt.partition,
          offset: receipt.offset,
          processed_at: new Date(),
        },
        update: {
          status: "processed",
          attempts: receipt.attempts,
          partition: receipt.partition,
          offset: receipt.offset,
          processed_at: new Date(),
          last_error: null,
          updated_at: new Date(),
        },
      });
    }
    return rows[0];
  });
  const notification = {
    version: Number(result.version),
    updatedAt: result.updated_at.toISOString(),
    reason: input.reason,
    correlationId,
  };
  try {
    await redisClient.publish("dashboard:updated:v1", JSON.stringify(notification));
  } catch (error) {
    console.warn("[DASHBOARD] Snapshot committed but Redis notification failed", error);
  }
  return notification;
}

export async function completeDashboardReceipt(receipt: ReceiptContext): Promise<void> {
  await prisma.$transaction(async (tx) => {
    await tx.dashboard_stats.updateMany({
      where: { key: "summary" },
      data: { source_event_count: { increment: 1 } },
    });
    await tx.dashboard_event_receipts.upsert({
      where: { event_id: receipt.eventId },
      create: {
        event_id: receipt.eventId,
        topic: receipt.topic,
        event_type: receipt.eventType,
        event_version: receipt.eventVersion,
        aggregate_id: receipt.aggregateId,
        correlation_id: receipt.correlationId,
        payload: receipt.payload,
        status: "processed",
        attempts: receipt.attempts,
        partition: receipt.partition,
        offset: receipt.offset,
        processed_at: new Date(),
      },
      update: {
        status: "processed",
        attempts: receipt.attempts,
        partition: receipt.partition,
        offset: receipt.offset,
        processed_at: new Date(),
        last_error: null,
        updated_at: new Date(),
      },
    });
  });
}

export async function getDashboardSummary(range: DashboardRange = "6m"): Promise<DashboardSummary> {
  let row = await prisma.dashboard_stats.findUnique({ where: { key: "summary" } });
  const hasCurrentShape = row && typeof row.value === "object" && row.value !== null && !Array.isArray(row.value)
    && "ranges" in row.value;
  if (!hasCurrentShape) {
    await refreshDashboardSnapshot({ reason: "live_fallback" });
    row = await prisma.dashboard_stats.findUniqueOrThrow({ where: { key: "summary" } });
  }
  if (!row) throw new Error("Dashboard snapshot is unavailable");
  const snapshot = parseSnapshot(row.value);
  const updatedAt = (row.updated_at ?? new Date(0)).toISOString();
  const freshnessMs = Math.max(0, Date.now() - new Date(updatedAt).getTime());
  return {
    range,
    ...snapshot.ranges[range],
    recentActivity: snapshot.recentActivity,
    metadata: {
      version: Number(row.version),
      updatedAt,
      freshnessMs,
      state: freshnessMs <= staleThresholdMs ? "fresh" : "stale",
      refreshDurationMs: row.refresh_duration_ms,
      sourceEventCount: row.source_event_count,
      reason: row.reason,
    },
  };
}

export async function requestDashboardRecalculation(correlationId?: string) {
  return prisma.$transaction(async (tx) => {
    const snapshot = await tx.dashboard_stats.findUnique({ where: { key: "summary" }, select: { version: true } });
    const event = await addOutboxEvent(tx, {
      topic: kafkaTopics.dashboard,
      eventType: "dashboard.refresh_requested.v1",
      aggregateId: "dashboard",
      correlationId,
      payload: { requestedAt: new Date().toISOString() },
    });
    return {
      eventId: event.eventId,
      baselineVersion: Number(snapshot?.version ?? 0),
      requestedAt: event.occurredAt.toISOString(),
    };
  });
}

async function measure<T>(operation: () => Promise<T>): Promise<{ available: boolean; latencyMs: number | null; detail?: string }> {
  const startedAt = performance.now();
  try {
    await operation();
    return { available: true, latencyMs: Math.round((performance.now() - startedAt) * 10) / 10 };
  } catch (error) {
    return { available: false, latencyMs: null, detail: error instanceof Error ? error.message.slice(0, 120) : "unavailable" };
  }
}

export async function getOperations(adminSocketCount: number): Promise<DashboardOperations> {
  const [
    postgres,
    redis,
    kafkaHealth,
    auctionHeartbeat,
    outboxHeartbeat,
    asyncHeartbeat,
    projectionLagValue,
    snapshot,
    outboxPending,
    outboxRetrying,
    outboxTerminal,
    oldestOutbox,
    emailPending,
    emailRetrying,
    emailTerminal,
    dashboardDlqCount,
    notificationDlqCount,
  ] = await Promise.all([
    measure(() => prisma.$queryRaw`SELECT 1`),
    measure(() => redisClient.ping()),
    measure(() => measureKafkaLatency()),
    redisClient.get("auction:worker:heartbeat").catch(() => null),
    redisClient.get("outbox:relay:heartbeat").catch(() => null),
    redisClient.get("async:worker:heartbeat").catch(() => null),
    redisClient.get("auction:worker:projection-lag").catch(() => null),
    prisma.dashboard_stats.findUnique({ where: { key: "summary" }, select: { updated_at: true } }),
    prisma.auction_outbox.count({ where: { delivered_at: null, terminal_at: null } }),
    prisma.auction_outbox.count({ where: { delivered_at: null, terminal_at: null, attempts: { gt: 0 } } }),
    prisma.auction_outbox.count({ where: { terminal_at: { not: null } } }),
    prisma.auction_outbox.aggregate({
      where: { delivered_at: null, terminal_at: null },
      _min: { created_at: true },
    }),
    prisma.email_deliveries.count({ where: { status: { in: ["pending", "leased"] } } }),
    prisma.email_deliveries.count({ where: { status: { in: ["pending", "leased"] }, attempts: { gt: 0 } } }),
    prisma.email_deliveries.count({ where: { status: "terminal" } }),
    prisma.dashboard_event_receipts.count({ where: { status: "terminal" } }),
    prisma.notification_event_receipts.count({ where: { status: "terminal" } }),
  ]);
  let consumerLag: number | null = null;
  try {
    const admin = kafka.admin();
    await admin.connect();
    try {
      const [topicOffsets, groupOffsets] = await Promise.all([
        admin.fetchTopicOffsets(kafkaTopics.dashboard),
        admin.fetchOffsets({ groupId: process.env.DASHBOARD_KAFKA_GROUP_ID || "dashboard-analytics-v1", topics: [kafkaTopics.dashboard] }),
      ]);
      const group = groupOffsets[0]?.partitions ?? [];
      consumerLag = topicOffsets.reduce((total, topicOffset) => {
        const current = group.find((item) => item.partition === topicOffset.partition)?.offset ?? "0";
        return total + Math.max(0, Number(topicOffset.high) - Number(current));
      }, 0);
    } finally {
      await admin.disconnect();
    }
  } catch {
    consumerLag = null;
  }
  const heartbeat = (value: string | null): { available: boolean; ageMs: number | null } => {
    const timestamp = value ? Date.parse(value) : Number.NaN;
    const ageMs = Number.isFinite(timestamp) ? Math.max(0, Date.now() - timestamp) : null;
    return { available: ageMs !== null && ageMs < 90_000, ageMs };
  };
  const workers = {
    auctionWorker: heartbeat(auctionHeartbeat),
    outboxRelay: heartbeat(outboxHeartbeat),
    asyncWorker: heartbeat(asyncHeartbeat),
  };
  return {
    postgres,
    redis,
    kafka: kafkaHealth,
    workers,
    workerHeartbeat: workers.asyncWorker,
    refreshAgeMs: snapshot?.updated_at ? Math.max(0, Date.now() - snapshot.updated_at.getTime()) : null,
    outboxPending,
    outboxRetrying,
    outboxTerminal,
    oldestOutboxAgeMs: oldestOutbox._min.created_at
      ? Math.max(0, Date.now() - oldestOutbox._min.created_at.getTime())
      : null,
    projectionLag: projectionLagValue === null ? null : Number(projectionLagValue),
    emailPending,
    emailRetrying,
    emailTerminal,
    consumerLag,
    dlqCount: dashboardDlqCount + notificationDlqCount + outboxTerminal + emailTerminal,
    adminSocketCount,
  };
}

export interface AuditFilters {
  page: number;
  limit: number;
  actorId?: number;
  action?: string;
  resourceType?: string;
  result?: string;
  from?: Date;
  to?: Date;
}

export async function getAuditLogs(filters: AuditFilters): Promise<{ data: AuditLog[]; total: number }> {
  const where: Prisma.admin_audit_logsWhereInput = {
    ...(filters.actorId ? { actor_id: filters.actorId } : {}),
    ...(filters.action ? { action: filters.action } : {}),
    ...(filters.resourceType ? { resource_type: filters.resourceType } : {}),
    ...(filters.result ? { result: filters.result } : {}),
    ...(filters.from || filters.to ? { created_at: { gte: filters.from, lte: filters.to } } : {}),
  };
  const [rows, total] = await prisma.$transaction([
    prisma.admin_audit_logs.findMany({
      where, orderBy: [{ created_at: "desc" }, { id: "desc" }],
      skip: (filters.page - 1) * filters.limit, take: filters.limit,
    }),
    prisma.admin_audit_logs.count({ where }),
  ]);
  return {
    total,
    data: rows.map((row) => ({
      id: row.id.toString(),
      actorId: row.actor_id,
      action: row.action,
      resourceType: row.resource_type,
      resourceId: row.resource_id,
      result: row.result as AuditLog["result"],
      errorCode: row.error_code,
      correlationId: row.correlation_id,
      createdAt: row.created_at.toISOString(),
    })),
  };
}

export async function getDlq(page: number, limit: number): Promise<{ data: DashboardDlqItem[]; total: number }> {
  const where = { status: "terminal" };
  const [rows, total] = await prisma.$transaction([
    prisma.dashboard_event_receipts.findMany({
      where, orderBy: { terminal_at: "desc" }, skip: (page - 1) * limit, take: limit,
    }),
    prisma.dashboard_event_receipts.count({ where }),
  ]);
  return {
    total,
    data: rows.map((row) => ({
      eventId: row.event_id,
      eventType: row.event_type,
      attempts: row.attempts,
      lastError: row.last_error,
      correlationId: row.correlation_id,
      terminalAt: row.terminal_at?.toISOString() ?? null,
    })),
  };
}

export async function retryDlq(eventId: string, actorId: number, correlationId: string) {
  return prisma.$transaction(async (tx) => {
    const receipt = await tx.dashboard_event_receipts.findUnique({ where: { event_id: eventId } });
    if (!receipt || receipt.status !== "terminal") throw new Error("DLQ event was not found");
    const existing = await tx.auction_outbox.findFirst({ where: { causation_id: eventId } });
    const event = existing
      ? { eventId: existing.event_id, occurredAt: existing.occurred_at }
      : await addOutboxEvent(tx, {
        topic: kafkaTopics.dashboard,
        eventType: "dashboard.dlq_retry_requested.v1",
        aggregateId: "dashboard",
        correlationId,
        causationId: eventId,
        payload: { failedEventId: eventId },
      });
    await tx.admin_audit_logs.create({
      data: {
        actor_id: actorId,
        action: "dashboard.dlq.retry",
        resource_type: "dashboard_event",
        resource_id: eventId,
        result: "success",
        correlation_id: correlationId,
        metadata: { retryEventId: event.eventId },
      },
    });
    return { eventId: event.eventId, requestedAt: event.occurredAt.toISOString() };
  });
}

export function escapeCsvCell(value: unknown): string {
  let text = value === null || value === undefined ? "" : String(value);
  if (/^[=+\-@]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}
