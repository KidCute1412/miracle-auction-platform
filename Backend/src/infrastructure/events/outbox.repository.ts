import { randomUUID } from "node:crypto";
import type { Prisma } from "@prisma/client";

export interface AddOutboxEventInput {
  topic: string;
  eventType: string;
  aggregateId: string;
  payload: object;
  correlationId?: string;
  causationId?: string;
}

export async function addOutboxEvent(
  tx: Prisma.TransactionClient,
  input: AddOutboxEventInput,
): Promise<{ eventId: string; correlationId: string; occurredAt: Date }> {
  const eventId = randomUUID();
  const correlationId = input.correlationId ?? randomUUID();
  const occurredAt = new Date();
  await tx.auction_outbox.create({
    data: {
      event_id: eventId,
      event_type: input.eventType,
      event_version: 1,
      aggregate_id: input.aggregateId,
      payload: input.payload,
      topic: input.topic,
      correlation_id: correlationId,
      causation_id: input.causationId,
      occurred_at: occurredAt,
    },
  });
  return { eventId, correlationId, occurredAt };
}
