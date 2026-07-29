import { Prisma } from "@prisma/client";
import { publishEventStrict } from "@/config/kafka.config.ts";
import { prisma } from "@/infrastructure/database/prisma.client.ts";
import { createEventEnvelope } from "@/infrastructure/events/event-envelope.ts";

type OutboxRow = {
  id: bigint;
  event_id: string;
  event_type: string;
  event_version: number;
  aggregate_id: string;
  payload: object;
  topic: string;
  correlation_id: string;
  causation_id: string | null;
  occurred_at: Date;
};

/** Claims committed events with SKIP LOCKED; a failed delivery remains retryable. */
export async function dispatchBidOutbox(limit = 25): Promise<number> {
  const claimed = await prisma.$transaction(async (tx) => {
    const rows = await tx.$queryRaw<OutboxRow[]>(Prisma.sql`
      SELECT id, event_id, event_type, event_version, aggregate_id, payload,
             topic, correlation_id, causation_id, occurred_at
      FROM auction_outbox
      WHERE delivered_at IS NULL AND available_at <= NOW() ORDER BY id LIMIT ${limit} FOR UPDATE SKIP LOCKED`);
    if (rows.length) {
      await tx.auction_outbox.updateMany({
        where: { id: { in: rows.map((row) => row.id) } },
        data: { attempts: { increment: 1 }, available_at: new Date(Date.now() + 30_000) },
      });
    }
    return rows;
  });
  for (const event of claimed) {
    try {
      await publishEventStrict(event.topic, event.aggregate_id, createEventEnvelope({
        eventId: event.event_id,
        eventType: event.event_type,
        eventVersion: event.event_version,
        aggregateId: event.aggregate_id,
        occurredAt: event.occurred_at,
        correlationId: event.correlation_id,
        causationId: event.causation_id ?? undefined,
        payload: event.payload,
      }));
      await prisma.auction_outbox.updateMany({
        where: { id: event.id, delivered_at: null },
        data: { delivered_at: new Date(), last_error: null },
      });
    } catch (error) {
      const last_error = error instanceof Error ? error.message.slice(0, 1000) : "Unknown dispatch error";
      await prisma.auction_outbox.update({ where: { id: event.id }, data: { last_error } });
    }
  }
  return claimed.length;
}
