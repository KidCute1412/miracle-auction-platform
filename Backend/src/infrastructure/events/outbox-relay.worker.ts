import { createComponentLogger, runWithLogContext } from "@/infrastructure/observability/logger.ts";

const log = createComponentLogger("outbox-relay.worker");

import { Prisma, type auction_outbox } from "@prisma/client";
import { publishEventBatchesStrict } from "@/config/kafka.config.ts";
import { relayTopics } from "@/config/kafka-topics.config.ts";
import { redisClient } from "@/config/redis.config.ts";
import { prisma } from "@/infrastructure/database/prisma.client.ts";
import { createEventEnvelope } from "./event-envelope.ts";

type RelayRow = Pick<
  auction_outbox,
  | "id"
  | "event_id"
  | "event_type"
  | "event_version"
  | "aggregate_id"
  | "payload"
  | "topic"
  | "correlation_id"
  | "causation_id"
  | "occurred_at"
  | "attempts"
>;

const EVENT_TYPE = /^[a-z][a-z0-9_]*(?:\.[a-z0-9_]+)*\.v[1-9]\d*$/;
const DEFAULT_LEASE_MS = 30_000;

export function outboxRetryDelayMs(attempt: number, maxBackoffMs: number): number {
  return Math.min(maxBackoffMs, 1_000 * 2 ** Math.min(Math.max(0, attempt - 1), 16));
}

export function validateRelayRow(row: RelayRow): string | undefined {
  if (!relayTopics.has(row.topic)) return `Unsupported outbox topic: ${row.topic}`;
  if (!EVENT_TYPE.test(row.event_type)) return `Invalid event type: ${row.event_type}`;
  if (row.event_version < 1) return "Invalid event version";
  if (!row.aggregate_id || !row.correlation_id || !row.event_id) return "Invalid event envelope";
  if (!row.payload || typeof row.payload !== "object" || Array.isArray(row.payload)) return "Invalid event payload";
  return undefined;
}

export async function claimOutboxRows(limit: number, leaseMs = DEFAULT_LEASE_MS): Promise<RelayRow[]> {
  return prisma.$transaction(async (tx) => {
    const rows = await tx.$queryRaw<RelayRow[]>(Prisma.sql`
      SELECT id, event_id, event_type, event_version, aggregate_id, payload,
             topic, correlation_id, causation_id, occurred_at, attempts
      FROM auction_outbox
      WHERE delivered_at IS NULL
        AND terminal_at IS NULL
        AND available_at <= NOW()
      ORDER BY id
      LIMIT ${limit}
      FOR UPDATE SKIP LOCKED
    `);
    if (rows.length > 0) {
      await tx.auction_outbox.updateMany({
        where: { id: { in: rows.map((row) => row.id) }, delivered_at: null, terminal_at: null },
        data: {
          attempts: { increment: 1 },
          available_at: new Date(Date.now() + leaseMs),
        },
      });
    }
    return rows;
  });
}

async function markTerminal(row: RelayRow, reason: string): Promise<void> {
  await runWithLogContext(
    {
      eventId: row.event_id,
      correlationId: row.correlation_id,
      causationId: row.causation_id ?? undefined,
      topic: row.topic,
      jobId: String(row.id),
    },
    async () => {
      await prisma.auction_outbox.updateMany({
        where: { id: row.id, delivered_at: null },
        data: {
          terminal_at: new Date(),
          last_error: reason.slice(0, 2_000),
        },
      });
      log.error("Outbox event marked terminal", { reason });
    },
  );
}

async function markRetry(rows: RelayRow[], error: unknown, maxBackoffMs: number): Promise<void> {
  const message = error instanceof Error ? error.message : "Unknown Kafka publish error";
  await Promise.all(
    rows.map((row) =>
      runWithLogContext(
        {
          eventId: row.event_id,
          correlationId: row.correlation_id,
          causationId: row.causation_id ?? undefined,
          topic: row.topic,
          jobId: String(row.id),
          attempt: row.attempts + 1,
        },
        async () => {
          await prisma.auction_outbox.updateMany({
            where: { id: row.id, delivered_at: null, terminal_at: null },
            data: {
              available_at: new Date(Date.now() + outboxRetryDelayMs(row.attempts + 1, maxBackoffMs)),
              last_error: message.slice(0, 2_000),
            },
          });
          log.warn("Outbox publication scheduled for retry", { error });
        },
      ),
    ),
  );
}

export async function relayOutboxBatch(options?: {
  batchSize?: number;
  leaseMs?: number;
  maxBackoffMs?: number;
}): Promise<number> {
  const batchSize = options?.batchSize ?? Number(process.env.OUTBOX_BATCH_SIZE ?? 100);
  const maxBackoffMs = options?.maxBackoffMs ?? Number(process.env.OUTBOX_MAX_BACKOFF_MS ?? 300_000);
  const claimed = await claimOutboxRows(batchSize, options?.leaseMs);
  const valid: RelayRow[] = [];
  for (const row of claimed) {
    const invalidReason = validateRelayRow(row);
    if (invalidReason) await markTerminal(row, invalidReason);
    else valid.push(row);
  }

  const groups = new Map<string, RelayRow[]>();
  for (const row of valid) groups.set(row.topic, [...(groups.get(row.topic) ?? []), row]);
  if (valid.length > 0) {
    try {
      await publishEventBatchesStrict(
        [...groups].map(([topic, rows]) => ({
          topic,
          messages: rows.map((row) => ({
            key: row.aggregate_id,
            value: JSON.stringify(
              createEventEnvelope({
                eventId: row.event_id,
                eventType: row.event_type,
                eventVersion: row.event_version,
                aggregateId: row.aggregate_id,
                occurredAt: row.occurred_at,
                correlationId: row.correlation_id,
                causationId: row.causation_id ?? undefined,
                payload: row.payload as Prisma.InputJsonObject,
              }),
            ),
          })),
        })),
      );
      await prisma.auction_outbox.updateMany({
        where: { id: { in: valid.map((row) => row.id) }, delivered_at: null, terminal_at: null },
        data: { delivered_at: new Date(), last_error: null },
      });
    } catch (error) {
      await markRetry(valid, error, maxBackoffMs);
    }
  }
  return claimed.length;
}

let running = false;
let relayLoop: Promise<void> | undefined;
let heartbeatTimer: NodeJS.Timeout | undefined;

async function writeHeartbeat(): Promise<void> {
  const ttl = Number(process.env.OUTBOX_RELAY_HEARTBEAT_TTL_SECONDS ?? 90);
  await redisClient.set("outbox:relay:heartbeat", new Date().toISOString(), "EX", ttl).catch((error) => {
    log.warn("[OUTBOX_RELAY] Redis heartbeat unavailable; relay continues", {
      message: error instanceof Error ? error.message : "unknown",
    });
  });
}

export function startOutboxRelay(): void {
  if (running) return;
  running = true;
  const idleMs = Number(process.env.OUTBOX_IDLE_POLL_MS ?? 500);
  heartbeatTimer = setInterval(() => void writeHeartbeat(), 30_000);
  heartbeatTimer.unref();
  void writeHeartbeat();
  relayLoop = (async () => {
    while (running) {
      try {
        const count = await relayOutboxBatch();
        if (count === 0) await new Promise((resolve) => setTimeout(resolve, idleMs));
      } catch (error) {
        log.error("[OUTBOX_RELAY] Poll failed", {
          message: error instanceof Error ? error.message : "unknown",
        });
        await new Promise((resolve) => setTimeout(resolve, idleMs));
      }
    }
  })();
}

export async function stopOutboxRelay(): Promise<void> {
  running = false;
  if (heartbeatTimer) clearInterval(heartbeatTimer);
  heartbeatTimer = undefined;
  await relayLoop;
  relayLoop = undefined;
}
