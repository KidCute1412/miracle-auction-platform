import { Prisma } from "@prisma/client";
import { publishBidEventStrict } from "@/config/kafka.config.ts";
import { prisma } from "@/infrastructure/database/prisma.client.ts";
import { emitBidUpdate } from "@/socket.ts";

type OutboxRow = { id: bigint; event_type: string; aggregate_id: string; payload: object };
const socketEventTypes = new Set(["bid.accepted", "auction.buy_now_completed", "bidder.banned"]);

/** Claims committed events with SKIP LOCKED; a failed delivery remains retryable. */
export async function dispatchBidOutbox(limit = 25): Promise<number> {
  const claimed = await prisma.$transaction(async (tx) => {
    const rows = await tx.$queryRaw<OutboxRow[]>(Prisma.sql`
      SELECT id, event_type, aggregate_id, payload FROM auction_outbox
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
      const productId = Number(event.aggregate_id);
      if (socketEventTypes.has(event.event_type)) {
        const product = await prisma.products.findUnique({ where: { product_id: BigInt(productId) } });
        emitBidUpdate(productId, { data: product });
      }
      await publishBidEventStrict(event.aggregate_id, {
        id: Number(event.id),
        type: event.event_type,
        version: 1,
        aggregateId: event.aggregate_id,
        payload: event.payload,
        timestamp: new Date().toISOString(),
      });
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
