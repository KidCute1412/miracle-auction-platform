import type { Prisma } from "@prisma/client";
import { BidDomainError } from "../domain/bid.errors.ts";
import { kafkaTopics } from "@/config/kafka.config.ts";
import { addOutboxEvent } from "@/infrastructure/events/outbox.repository.ts";

export async function addBidOutboxEvent(
  tx: Prisma.TransactionClient,
  eventType: string,
  aggregateId: number,
  payload: object,
): Promise<void> {
  await addOutboxEvent(tx, {
    topic: kafkaTopics.bidding,
    eventType,
    aggregateId: String(aggregateId),
    payload,
  });
}

export async function findIdempotentResponse(
  tx: Prisma.TransactionClient,
  operation: string,
  userId: number,
  key: string | undefined,
  fingerprint: string,
): Promise<object | undefined> {
  if (!key) return undefined;
  const row = await tx.bid_idempotency.findUnique({
    where: { operation_user_id_idempotency_key: { operation, user_id: userId, idempotency_key: key } },
  });
  if (row && row.request_fingerprint !== fingerprint)
    throw new BidDomainError("Idempotency key was already used for a different request");
  return row?.response_body as object | undefined;
}

export async function saveIdempotentResponse(
  tx: Prisma.TransactionClient,
  operation: string,
  userId: number,
  key: string | undefined,
  fingerprint: string,
  response: object,
): Promise<void> {
  if (key)
    await tx.bid_idempotency.create({
      data: {
        operation,
        user_id: userId,
        idempotency_key: key,
        request_fingerprint: fingerprint,
        response_body: response,
      },
    });
}
