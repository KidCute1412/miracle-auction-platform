import { createComponentLogger, runWithLogContext, type LogContext } from "@/infrastructure/observability/logger.ts";

const log = createComponentLogger("notification-consumer.worker");

import { createHash } from "node:crypto";
import { Prisma } from "@prisma/client";
import type { EachBatchPayload, KafkaMessage } from "kafkajs";
import { kafka } from "@/config/kafka.config.ts";
import { kafkaTopics } from "@/config/kafka-topics.config.ts";
import { addOutboxEvent } from "@/infrastructure/events/outbox.repository.ts";
import { parseEventEnvelope, type EventEnvelope } from "@/infrastructure/events/event-envelope.ts";
import { prisma } from "@/infrastructure/database/prisma.client.ts";
import { enqueueNotificationEvent } from "./notification.service.ts";
import { mapWithConcurrency } from "@/infrastructure/concurrency/bounded-map.ts";

const groupId = process.env.NOTIFICATION_KAFKA_GROUP_ID || "notification-intake-v1";
const retryLimit = Number(process.env.NOTIFICATION_RETRY_LIMIT ?? 5);
const batchConcurrency = Number(process.env.NOTIFICATION_BATCH_CONCURRENCY ?? 8);
let consumer: ReturnType<typeof kafka.consumer> | undefined;
let stopping = false;

const notificationEventTypes = new Set([
  "auction.closed.v1",
  "auction.buy_now_completed.v1",
  "product.question_created.v1",
  "product.question_answered.v1",
  "product.description_changed.v1",
  "seller.approved.v1",
  "seller.rejected.v1",
]);

/**
 * The notification group consumes shared domain topics to receive a small set
 * of email-worthy events. Most bid updates are dashboard concerns, not email
 * notifications; recording a PostgreSQL receipt for each one turns normal
 * bidding traffic into avoidable downstream database contention.
 */
export function requiresNotification(eventType: string): boolean {
  return notificationEventTypes.has(eventType);
}

function syntheticEventId(topic: string, partition: number, offset: string): string {
  const hash = createHash("sha256").update(`${topic}:${partition}:${offset}`).digest("hex");
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-4${hash.slice(13, 16)}-a${hash.slice(17, 20)}-${hash.slice(20, 32)}`;
}

async function terminalReceipt(input: {
  event: EventEnvelope;
  topic: string;
  partition: number;
  offset: string;
  attempts: number;
  error: unknown;
}): Promise<void> {
  const message = input.error instanceof Error ? input.error.message : "Unknown notification error";
  await prisma.$transaction(async (tx) => {
    await tx.notification_event_receipts.upsert({
      where: { event_id: input.event.eventId },
      create: {
        event_id: input.event.eventId,
        topic: input.topic,
        event_type: input.event.eventType,
        event_version: input.event.eventVersion,
        aggregate_id: input.event.aggregateId,
        correlation_id: input.event.correlationId,
        payload: input.event.payload as Prisma.InputJsonObject,
        status: "terminal",
        attempts: input.attempts,
        last_error: message.slice(0, 2_000),
        partition: input.partition,
        offset: input.offset,
        terminal_at: new Date(),
      },
      update: {
        status: "terminal",
        attempts: input.attempts,
        last_error: message.slice(0, 2_000),
        terminal_at: new Date(),
        updated_at: new Date(),
      },
    });
    await addOutboxEvent(tx, {
      topic: kafkaTopics.asyncDlq,
      eventType: "notification.consumer_failed.v1",
      aggregateId: input.event.aggregateId,
      causationId: input.event.eventId,
      correlationId: input.event.correlationId,
      payload: {
        consumer: groupId,
        sourceTopic: input.topic,
        partition: input.partition,
        offset: input.offset,
        event: input.event,
        attempt: input.attempts,
        error: message.slice(0, 500),
      },
    });
  });
}

async function processKafkaMessage(topic: string, partition: number, message: KafkaMessage): Promise<void> {
  let event: EventEnvelope;
  try {
    if (!message.value) throw new Error("Kafka event has no value");
    event = parseEventEnvelope(message.value.toString());
  } catch (error) {
    const eventId = syntheticEventId(topic, partition, message.offset);
    await terminalReceipt({
      event: {
        eventId,
        eventType: "notification.invalid_event.v1",
        eventVersion: 1,
        aggregateId: "invalid",
        occurredAt: new Date().toISOString(),
        correlationId: eventId,
        payload: {},
      },
      topic,
      partition,
      offset: message.offset,
      attempts: retryLimit,
      error,
    });
    return;
  }

  if (!requiresNotification(event.eventType)) return;

  try {
    await enqueueNotificationEvent(event, { topic, partition, offset: message.offset });
  } catch (error) {
    const receipt = await prisma.notification_event_receipts.upsert({
      where: { event_id: event.eventId },
      create: {
        event_id: event.eventId,
        topic,
        event_type: event.eventType,
        event_version: event.eventVersion,
        aggregate_id: event.aggregateId,
        correlation_id: event.correlationId,
        payload: event.payload as Prisma.InputJsonObject,
        status: "retrying",
        attempts: 1,
        last_error: error instanceof Error ? error.message.slice(0, 2_000) : "unknown",
        partition,
        offset: message.offset,
      },
      update: {
        status: "retrying",
        attempts: { increment: 1 },
        last_error: error instanceof Error ? error.message.slice(0, 2_000) : "unknown",
        updated_at: new Date(),
      },
      select: { attempts: true },
    });
    if (receipt.attempts >= retryLimit) {
      await terminalReceipt({
        event,
        topic,
        partition,
        offset: message.offset,
        attempts: receipt.attempts,
        error,
      });
      return;
    }
    throw error;
  }
}

async function eachBatch({ batch, resolveOffset, heartbeat, isRunning, isStale }: EachBatchPayload): Promise<void> {
  const heartbeatTimer = setInterval(() => void heartbeat().catch(() => undefined), 3_000);
  try {
    await mapWithConcurrency(batch.messages, batchConcurrency, async (message) => {
      if (stopping || !isRunning() || isStale()) return;
      let context: LogContext = {
        topic: batch.topic,
        partition: batch.partition,
        offset: message.offset,
        consumerGroup: groupId,
      };
      try {
        if (message.value) {
          const event = parseEventEnvelope(message.value.toString());
          context = {
            ...context,
            eventId: event.eventId,
            correlationId: event.correlationId,
            causationId: event.causationId,
          };
        }
      } catch {
        const eventId = syntheticEventId(batch.topic, batch.partition, message.offset);
        context = { ...context, eventId, correlationId: eventId };
      }
      await runWithLogContext(context, () => processKafkaMessage(batch.topic, batch.partition, message));
    });

    const lastMessage = batch.messages.at(-1);
    if (!lastMessage) return;
    resolveOffset(lastMessage.offset);
    await consumer?.commitOffsets([{
      topic: batch.topic,
      partition: batch.partition,
      offset: (BigInt(lastMessage.offset) + 1n).toString(),
    }]);
    await heartbeat();
  } finally {
    clearInterval(heartbeatTimer);
  }
}

export async function startNotificationConsumer(): Promise<void> {
  if (consumer) return;
  stopping = false;
  consumer = kafka.consumer({ groupId, allowAutoTopicCreation: false });
  await consumer.connect();
  await consumer.subscribe({
    topics: [kafkaTopics.bidding, kafkaTopics.domain, kafkaTopics.dashboard],
    // The compatibility dashboard subscription intentionally drains legacy seller-event backlog.
    fromBeginning: true,
  });
  void consumer
    .run({
      autoCommit: false,
      eachBatchAutoResolve: false,
      partitionsConsumedConcurrently: Math.max(1, Number(process.env.NOTIFICATION_PARTITIONS_CONCURRENTLY || 1)),
      eachBatch,
    })
    .catch((error) =>
      log.error("[NOTIFICATION_CONSUMER] Consumer stopped", {
        message: error instanceof Error ? error.message : "unknown",
      }),
    );
}

export async function stopNotificationConsumer(): Promise<void> {
  stopping = true;
  if (!consumer) return;
  await consumer.stop().catch(() => undefined);
  await consumer.disconnect().catch(() => undefined);
  consumer = undefined;
}
