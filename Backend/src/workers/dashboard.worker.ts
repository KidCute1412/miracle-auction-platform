import type { EachBatchPayload, KafkaMessage } from "kafkajs";
import { createHash } from "node:crypto";
import { kafka, kafkaTopics } from "@/config/kafka.config.ts";
import { redisClient } from "@/config/redis.config.ts";
import { prisma } from "@/infrastructure/database/prisma.client.ts";
import { Prisma } from "@prisma/client";
import { parseEventEnvelope, type EventEnvelope } from "@/infrastructure/events/event-envelope.ts";
import { addOutboxEvent } from "@/infrastructure/events/outbox.repository.ts";
import {
  completeDashboardReceipt,
  refreshDashboardSnapshot,
} from "@/modules/dashboard/application/dashboard-summary.use-case.ts";

const groupId = process.env.DASHBOARD_KAFKA_GROUP_ID || "dashboard-analytics-v1";
const retryLimit = Number(process.env.DASHBOARD_RETRY_LIMIT || 5);
const debounceMs = Number(process.env.DASHBOARD_DEBOUNCE_MS || 15_000);
const recoveryMs = Number(process.env.DASHBOARD_RECOVERY_INTERVAL_MS || 60_000);
const heartbeatTtlSeconds = 90;

let dashboardConsumer: ReturnType<typeof kafka.consumer> | undefined;
let recoveryTimer: NodeJS.Timeout | undefined;
let heartbeatTimer: NodeJS.Timeout | undefined;
let stopping = false;
let refreshFlight: Promise<unknown> | undefined;

const wait = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));
export const calculateRetryDelayMs = (attempt: number): number =>
  Math.min(30_000, Math.max(1_000, 1_000 * 2 ** Math.max(0, attempt - 1)));

async function singleFlightRefresh(input: Parameters<typeof refreshDashboardSnapshot>[0]) {
  if (!refreshFlight) {
    refreshFlight = refreshDashboardSnapshot(input).finally(() => {
      refreshFlight = undefined;
    });
  }
  return refreshFlight;
}

async function writeHeartbeat(): Promise<void> {
  await redisClient.set("dashboard:worker:heartbeat", new Date().toISOString(), "EX", heartbeatTtlSeconds).catch((error) => {
    console.warn("[DASHBOARD_WORKER] Redis heartbeat unavailable", error);
  });
}

async function receiptAttempts(event: EventEnvelope, topic: string, partition: number, offset: string): Promise<number> {
  const row = await prisma.dashboard_event_receipts.upsert({
    where: { event_id: event.eventId },
    create: {
      event_id: event.eventId,
      topic,
      event_type: event.eventType,
      event_version: event.eventVersion,
      aggregate_id: event.aggregateId,
      correlation_id: event.correlationId,
      payload: event.payload as Prisma.InputJsonValue,
      status: "retrying",
      attempts: 1,
      partition,
      offset,
    },
    update: {
      attempts: { increment: 1 },
      partition,
      offset,
      status: "retrying",
      updated_at: new Date(),
    },
    select: { attempts: true },
  });
  return row.attempts;
}

export async function recordDashboardTerminal(
  event: EventEnvelope,
  topic: string,
  partition: number,
  offset: string,
  attempts: number,
  error: unknown,
): Promise<void> {
  const lastError = error instanceof Error ? error.message.slice(0, 2_000) : "Unknown analytics error";
  await prisma.$transaction(async (tx) => {
    await tx.dashboard_event_receipts.upsert({
      where: { event_id: event.eventId },
      create: {
        event_id: event.eventId,
        topic,
        event_type: event.eventType,
        event_version: event.eventVersion,
        aggregate_id: event.aggregateId,
        correlation_id: event.correlationId,
        payload: event.payload as Prisma.InputJsonValue,
        status: "terminal",
        attempts,
        last_error: lastError,
        partition,
        offset,
        terminal_at: new Date(),
      },
      update: { status: "terminal", attempts, last_error: lastError, terminal_at: new Date(), updated_at: new Date() },
    });
    const existingDlq = await tx.auction_outbox.findFirst({
      where: {
        topic: kafkaTopics.asyncDlq,
        causation_id: event.eventId,
        event_type: "async.consumer_terminal.v1",
      },
      select: { id: true },
    });
    if (existingDlq) return;
    await addOutboxEvent(tx, {
      topic: kafkaTopics.asyncDlq,
      eventType: "async.consumer_terminal.v1",
      aggregateId: event.aggregateId,
      correlationId: event.correlationId,
      causationId: event.eventId,
      payload: {
        consumer: groupId,
        source: { topic, partition, offset },
        envelope: event,
        attempt: attempts,
        error: { message: lastError },
      },
    });
  });
}

async function processMessage(
  topic: string,
  partition: number,
  message: KafkaMessage,
  heartbeat: () => Promise<void>,
  refreshRequired: boolean,
): Promise<boolean> {
  if (!message.value) throw new Error("Kafka event has no value");
  let event: EventEnvelope;
  try {
    event = parseEventEnvelope(message.value.toString());
  } catch (error) {
    const hash = createHash("sha256").update(`${topic}:${partition}:${message.offset}`).digest("hex");
    const eventId = `${hash.slice(0, 8)}-${hash.slice(8, 12)}-4${hash.slice(13, 16)}-a${hash.slice(17, 20)}-${hash.slice(20, 32)}`;
    event = {
      eventId,
      eventType: "dashboard.invalid_event.v1",
      eventVersion: 1,
      aggregateId: "invalid",
      occurredAt: new Date().toISOString(),
      correlationId: eventId,
      payload: { raw: message.value.toString().slice(0, 4_000) },
    };
    await recordDashboardTerminal(event, topic, partition, message.offset, retryLimit, error);
    return false;
  }
  const existing = await prisma.dashboard_event_receipts.findUnique({
    where: { event_id: event.eventId },
    select: { status: true },
  });
  if (existing?.status === "processed" || existing?.status === "terminal") return false;

  let attempts = await receiptAttempts(event, topic, partition, message.offset);
  while (!stopping) {
    try {
      const receipt = {
          eventId: event.eventId,
          topic,
          eventType: event.eventType,
          eventVersion: event.eventVersion,
          aggregateId: event.aggregateId,
          correlationId: event.correlationId,
          payload: event.payload,
          partition,
          offset: message.offset,
          attempts,
      };
      if (refreshRequired) {
        if (refreshFlight) await refreshFlight;
        await singleFlightRefresh({
          reason: event.eventType,
          correlationId: event.correlationId,
          sourceEventCount: 1,
          receipt,
        });
      } else {
        await completeDashboardReceipt(receipt);
      }
      return refreshRequired;
    } catch (error) {
      await prisma.dashboard_event_receipts.update({
        where: { event_id: event.eventId },
        data: {
          last_error: error instanceof Error ? error.message.slice(0, 2_000) : "Unknown analytics error",
          updated_at: new Date(),
        },
      });
      if (attempts >= retryLimit) {
        await recordDashboardTerminal(event, topic, partition, message.offset, attempts, error);
        return false;
      }
      await wait(calculateRetryDelayMs(attempts));
      await heartbeat();
      attempts = await receiptAttempts(event, topic, partition, message.offset);
    }
  }
  throw new Error("Dashboard worker is stopping");
}

async function eachBatch({ batch, resolveOffset, heartbeat, isRunning, isStale }: EachBatchPayload): Promise<void> {
  if (stopping || !isRunning() || isStale()) return;
  if (debounceMs > 0) {
    const waitUntil = Date.now() + Math.min(debounceMs, 30_000);
    while (Date.now() < waitUntil && !stopping) {
      await wait(Math.min(3_000, waitUntil - Date.now()));
      await heartbeat();
    }
  }
  let refreshed = false;
  for (const message of batch.messages) {
    if (stopping || !isRunning() || isStale()) return;
    refreshed = (await processMessage(batch.topic, batch.partition, message, heartbeat, !refreshed)) || refreshed;
    resolveOffset(message.offset);
    await dashboardConsumer?.commitOffsets([{
      topic: batch.topic,
      partition: batch.partition,
      offset: (BigInt(message.offset) + 1n).toString(),
    }]);
    await heartbeat();
  }
}

export async function startDashboardConsumer(): Promise<void> {
  stopping = false;
  await singleFlightRefresh({ reason: "worker_startup" }).catch((error) =>
    console.error("[DASHBOARD_WORKER] Startup refresh failed; scheduled recovery remains active", error));
  recoveryTimer = setInterval(() => {
    void singleFlightRefresh({ reason: "scheduled_recovery" }).catch((error) =>
      console.error("[DASHBOARD_WORKER] Scheduled refresh failed", error));
  }, recoveryMs);
  recoveryTimer.unref();
  heartbeatTimer = setInterval(() => void writeHeartbeat(), 30_000);
  heartbeatTimer.unref();
  await writeHeartbeat();

  dashboardConsumer = kafka.consumer({ groupId, allowAutoTopicCreation: false });
  dashboardConsumer.on(dashboardConsumer.events.CRASH, ({ payload }) => {
    console.error("[DASHBOARD_WORKER] Kafka consumer crashed", payload.error);
  });
  dashboardConsumer.on(dashboardConsumer.events.DISCONNECT, () => {
    console.warn("[DASHBOARD_WORKER] Kafka consumer disconnected; scheduled recovery remains active");
  });
  dashboardConsumer.on(dashboardConsumer.events.GROUP_JOIN, ({ payload }) => {
    console.log("[DASHBOARD_WORKER] Kafka group joined", {
      groupId: payload.groupId,
      memberId: payload.memberId,
    });
  });
  try {
    console.log("[DASHBOARD_WORKER] Connecting Kafka consumer", { groupId });
    await dashboardConsumer.connect();
    await dashboardConsumer.subscribe({
      topics: [kafkaTopics.bidding, kafkaTopics.domain, kafkaTopics.dashboard],
      fromBeginning: false,
    });
    console.log("[DASHBOARD_WORKER] Kafka consumer subscribed", {
      groupId,
      topics: [kafkaTopics.bidding, kafkaTopics.domain, kafkaTopics.dashboard],
    });
    void dashboardConsumer.run({
      autoCommit: false,
      eachBatchAutoResolve: false,
      partitionsConsumedConcurrently: 1,
      eachBatch,
    }).catch((error) => console.error("[DASHBOARD_WORKER] Consumer stopped unexpectedly", error));
  } catch (error) {
    console.error("[DASHBOARD_WORKER] Kafka unavailable; scheduled PostgreSQL refresh remains active", error);
  }
}

export async function stopDashboardConsumer(): Promise<void> {
  stopping = true;
  if (recoveryTimer) clearInterval(recoveryTimer);
  if (heartbeatTimer) clearInterval(heartbeatTimer);
  recoveryTimer = undefined;
  heartbeatTimer = undefined;
  if (dashboardConsumer) {
    await dashboardConsumer.stop().catch(() => undefined);
    await refreshFlight?.catch(() => undefined);
    await dashboardConsumer.disconnect().catch(() => undefined);
    dashboardConsumer = undefined;
  }
}
