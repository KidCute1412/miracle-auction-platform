import { Prisma } from "@prisma/client";
import { redisClient } from "@/config/redis.config.ts";
import { prisma } from "@/infrastructure/database/prisma.client.ts";
import { emitBidUpdate } from "@/socket.ts";
import { redisAuctionKeys } from "./redis-auction.keys.ts";
import type { AuctionStreamEvent } from "./redis-auction.types.ts";

const GROUP = process.env.BID_PROJECTOR_GROUP ?? "postgres-projector-v1";
let blockingRedisClient: ReturnType<typeof redisClient.duplicate> | undefined;
const blockingClient = (): ReturnType<typeof redisClient.duplicate> => {
  if (!blockingRedisClient) {
    blockingRedisClient = redisClient.duplicate();
    blockingRedisClient.on("error", (error: Error) => {
      console.error("[REDIS PROJECTOR] Connection error:", error.message);
    });
  }
  return blockingRedisClient;
};
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const DECIMAL = /^(0|[1-9]\d{0,18})$/;
const eventTypes = new Set([
  "BID_ACCEPTED",
  "BUY_NOW_COMPLETED",
  "BIDDER_BANNED",
  "AUCTION_CLOSED",
  "AUCTION_CANCELLED",
]);

export class ProjectionGapError extends Error {}
export class InvalidAuctionEventError extends Error {}

export interface RedisStreamEntry {
  id: string;
  payload: string;
}

function parseEvent(payload: string): AuctionStreamEvent {
  let value: unknown;
  try {
    value = JSON.parse(payload);
  } catch {
    throw new InvalidAuctionEventError("Stream payload is not JSON");
  }
  if (!value || typeof value !== "object") throw new InvalidAuctionEventError("Stream payload is not an object");
  const event = value as Partial<AuctionStreamEvent>;
  const decimals = [
    event.productId, event.currentPriceVnd, event.endAtMs, event.sequence,
    event.version, event.occurredAtMs,
  ];
  if (!event.eventId || !UUID.test(event.eventId) || !event.type || !eventTypes.has(event.type) ||
      !event.actorId || !DECIMAL.test(event.actorId) || decimals.some((item) => !item || !DECIMAL.test(item)) ||
      event.schemaVersion !== 1) {
    throw new InvalidAuctionEventError("Stream event contract is invalid");
  }
  if (event.orderId && !UUID.test(event.orderId)) throw new InvalidAuctionEventError("Order UUID is invalid");
  return event as AuctionStreamEvent;
}

const jsonPayload = (event: AuctionStreamEvent): Prisma.InputJsonObject => ({
  eventId: event.eventId,
  correlationId: event.correlationId,
  idempotencyKey: event.idempotencyKey,
  schemaVersion: event.schemaVersion,
  type: event.type,
  productId: event.productId,
  actorId: event.actorId,
  requestedMaxPriceVnd: event.requestedMaxPriceVnd ?? null,
  targetUserId: event.targetUserId ?? null,
  currentPriceVnd: event.currentPriceVnd,
  leaderId: event.leaderId ?? null,
  leaderMaxPriceVnd: event.leaderMaxPriceVnd ?? null,
  endAtMs: event.endAtMs,
  status: event.status,
  sequence: event.sequence,
  version: event.version,
  occurredAtMs: event.occurredAtMs,
  orderId: event.orderId ?? null,
  reason: event.reason ?? null,
});

export async function projectAuctionEntry(entry: RedisStreamEntry): Promise<"applied" | "duplicate"> {
  const event = parseEvent(entry.payload);
  const productId = BigInt(event.productId);
  const sequence = BigInt(event.sequence);
  const version = BigInt(event.version);
  const leaderId = event.leaderId ? BigInt(event.leaderId) : null;
  const payload = jsonPayload(event);

  const result = await prisma.$transaction(async (tx) => {
    const duplicate = await tx.auction_processed_events.findUnique({ where: { event_id: event.eventId } });
    if (duplicate) return "duplicate" as const;
    const sequenceOwner = await tx.auction_processed_events.findUnique({
      where: { product_id_sequence: { product_id: productId, sequence } },
    });
    if (sequenceOwner) {
      throw new InvalidAuctionEventError(`Sequence ${event.sequence} belongs to another event`);
    }

    const product = await tx.products.findUnique({
      where: { product_id: productId },
      select: { auction_sequence: true, auction_version: true },
    });
    if (!product) throw new InvalidAuctionEventError(`Auction ${event.productId} does not exist`);
    if (sequence !== product.auction_sequence + 1n || version <= product.auction_version) {
      throw new ProjectionGapError(
        `Projection fence rejected auction=${event.productId} sequence=${event.sequence} version=${event.version}`,
      );
    }

    await tx.auction_transitions.create({
      data: {
        event_id: event.eventId,
        product_id: productId,
        event_type: event.type,
        sequence,
        version,
        payload,
      },
    });

    if (event.type === "BID_ACCEPTED") {
      if (!event.requestedMaxPriceVnd) throw new InvalidAuctionEventError("Accepted bid has no maximum");
      await tx.bidding_history.create({
        data: {
          event_id: event.eventId,
          product_id: productId,
          user_id: Number(event.actorId),
          max_price: BigInt(event.requestedMaxPriceVnd),
          product_price: BigInt(event.currentPriceVnd),
          price_owner_id: leaderId,
          sequence,
          version,
        },
      });
    } else if (event.type === "BIDDER_BANNED" && event.targetUserId) {
      await tx.bidding_ban_user.createMany({
        data: [{
          product_id: productId,
          user_id: Number(event.targetUserId),
          reason: event.reason,
        }],
        skipDuplicates: true,
      });
      await tx.bidding_history.updateMany({
        where: { product_id: productId, user_id: Number(event.targetUserId), status: null },
        data: { status: "BANNED" },
      });
    }

    if (event.orderId && leaderId !== null &&
        (event.type === "BUY_NOW_COMPLETED" || event.type === "AUCTION_CLOSED")) {
      await tx.orders.create({
        data: {
          public_order_id: event.orderId,
          product_id: productId,
          user_id: Number(leaderId),
          auction_sequence: sequence,
        },
      });
    }

    const updated = await tx.products.updateMany({
      where: { product_id: productId, auction_version: { lt: version } },
      data: {
        current_price: BigInt(event.currentPriceVnd),
        price_owner_id: leaderId,
        end_time: new Date(Number(event.endAtMs)),
        auction_status: event.status,
        is_removed: event.status === "CANCELLED",
        auction_sequence: sequence,
        auction_version: version,
      },
    });
    if (updated.count !== 1) throw new ProjectionGapError("Projection version fence rejected the snapshot update");

    await tx.auction_processed_events.create({
      data: {
        event_id: event.eventId,
        redis_entry_id: entry.id,
        product_id: productId,
        sequence,
        version,
      },
    });
    await tx.auction_outbox.create({
      data: {
        event_id: event.eventId,
        event_type: event.type.toLowerCase().replaceAll("_", "."),
        event_version: 1,
        aggregate_id: event.productId,
        payload,
      },
    });
    return "applied" as const;
  });

  if (result === "applied") {
    emitBidUpdate(Number(event.productId), {
      data: {
        event_id: event.eventId,
        product_id: event.productId,
        current_price: event.currentPriceVnd,
        leader_id: event.leaderId ?? null,
        end_time_ms: event.endAtMs,
        sequence: event.sequence,
        version: event.version,
        order_id: event.orderId ?? null,
      },
    });
  }
  return result;
}

export async function ensureProjectorGroup(): Promise<void> {
  try {
    await redisClient.xgroup("CREATE", redisAuctionKeys.results, GROUP, "0", "MKSTREAM");
  } catch (error) {
    if (!(error instanceof Error) || !error.message.includes("BUSYGROUP")) throw error;
  }
}

function entriesFromRead(raw: unknown): RedisStreamEntry[] {
  if (!Array.isArray(raw)) return [];
  const result: RedisStreamEntry[] = [];
  for (const stream of raw) {
    if (!Array.isArray(stream) || !Array.isArray(stream[1])) continue;
    for (const item of stream[1]) {
      if (!Array.isArray(item) || typeof item[0] !== "string" || !Array.isArray(item[1])) continue;
      const fieldIndex = item[1].indexOf("event");
      if (fieldIndex >= 0 && typeof item[1][fieldIndex + 1] === "string") {
        result.push({ id: item[0], payload: item[1][fieldIndex + 1] });
      }
    }
  }
  return result;
}

export async function readNewProjectorEntries(consumer: string, count = 50): Promise<RedisStreamEntry[]> {
  const raw = await blockingClient().xreadgroup(
    "GROUP", GROUP, consumer, "COUNT", count, "BLOCK", 1_000,
    "STREAMS", redisAuctionKeys.results, ">",
  );
  return entriesFromRead(raw);
}

export async function closeProjectorRedisConnection(): Promise<void> {
  if (blockingRedisClient && blockingRedisClient.status !== "end") await blockingRedisClient.quit();
  blockingRedisClient = undefined;
}

export async function autoClaimProjectorEntries(
  consumer: string,
  minIdleMs = 30_000,
  count = 50,
): Promise<RedisStreamEntry[]> {
  const raw = await redisClient.xautoclaim(
    redisAuctionKeys.results,
    GROUP,
    consumer,
    minIdleMs,
    "0-0",
    "COUNT",
    count,
  );
  if (!Array.isArray(raw) || !Array.isArray(raw[1])) return [];
  return entriesFromRead([[redisAuctionKeys.results, raw[1]]]);
}

export async function acknowledgeProjectedEntry(entryId: string): Promise<void> {
  await redisClient.xack(redisAuctionKeys.results, GROUP, entryId);
  await redisClient.hdel(redisAuctionKeys.projectorRetries, entryId);
}

export async function recordProjectionFailure(entry: RedisStreamEntry, error: unknown): Promise<"retry" | "dlq"> {
  const attempts = await redisClient.hincrby(redisAuctionKeys.projectorRetries, entry.id, 1);
  const maxAttempts = Number(process.env.BID_PROJECTOR_MAX_ATTEMPTS ?? 10);
  if (attempts < maxAttempts) return "retry";
  const message = error instanceof Error ? error.message : "Unknown projection error";
  await redisClient.xadd(
    redisAuctionKeys.dlq,
    "*",
    "sourceEntryId", entry.id,
    "attempts", attempts.toString(),
    "error", message.slice(0, 2_000),
    "event", entry.payload,
  );
  await acknowledgeProjectedEntry(entry.id);
  return "dlq";
}

export async function runProjectorBatch(consumer: string): Promise<number> {
  await ensureProjectorGroup();
  const claimed = await autoClaimProjectorEntries(consumer);
  const fresh = await readNewProjectorEntries(consumer);
  const entries = [...claimed, ...fresh.filter((entry) => !claimed.some((item) => item.id === entry.id))];
  for (const entry of entries) {
    try {
      await projectAuctionEntry(entry);
      await acknowledgeProjectedEntry(entry.id);
    } catch (error) {
      await recordProjectionFailure(entry, error);
    }
  }
  return entries.length;
}
