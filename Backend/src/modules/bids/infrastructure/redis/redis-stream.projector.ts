import { createComponentLogger, runWithLogContext, type LogContext } from "@/infrastructure/observability/logger.ts";

const log = createComponentLogger("redis-stream.projector");

import { Prisma } from "@prisma/client";
import type { BidSocketEvent } from "api-contracts";
import { getAuctionRedisClients, redisClient } from "@/config/redis.config.ts";
import { prisma } from "@/infrastructure/database/prisma.client.ts";
import { canonicalAuctionEventType } from "@/infrastructure/events/auction-event-contract.ts";
import { redisAuctionKeys } from "./redis-auction.keys.ts";
import type { AuctionStreamEvent } from "./redis-auction.types.ts";
import { expireTerminalAuctionState, isTerminalAuctionStatus } from "./redis-auction.cleanup.ts";

const GROUP = process.env.BID_PROJECTOR_GROUP ?? "postgres-projector-v1";
const COMMITTED_CHANNEL = "auction:committed:v1";
const RECLAIM_INTERVAL_MS = Number(process.env.BID_PROJECTOR_RECLAIM_INTERVAL_MS ?? 30_000);
const READ_COUNT = Number(process.env.BID_PROJECTOR_READ_COUNT ?? 200);
const CONCURRENCY = Math.max(1, Number(process.env.BID_PROJECTOR_CONCURRENCY ?? 8));
const blockingRedisClients = new Map<number, ReturnType<typeof redisClient.duplicate>>();
let projectorGroupReady = false;
let lastReclaimAt = 0;
const blockingClient = (shard: number): ReturnType<typeof redisClient.duplicate> => {
  let client = blockingRedisClients.get(shard);
  if (!client) {
    client = getAuctionRedisClients()[shard]!.duplicate();
    client.on("error", (error: Error) => {
      log.error("[REDIS PROJECTOR] Connection error:", error.message);
    });
    blockingRedisClients.set(shard, client);
  }
  return client;
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
const isMissingGroup = (error: unknown): boolean => error instanceof Error && error.message.includes("NOGROUP");

export class ProjectionGapError extends Error {}
export class InvalidAuctionEventError extends Error {}

export interface RedisStreamEntry {
  id: string;
  payload: string;
  shard?: number;
}

/** Redis stream IDs are only unique inside a Redis instance. Persist the
 * shard alongside the ID so receipts from independent shards cannot collide. */
export function streamReceiptId(entry: Pick<RedisStreamEntry, "id" | "shard">): string {
  return `shard:${entry.shard ?? 0}:${entry.id}`;
}

export async function runKeyedLanes<T>(
  items: readonly T[],
  keyOf: (item: T) => string,
  handler: (item: T) => Promise<void>,
  concurrency: number,
): Promise<void> {
  const lanes = new Map<string, T[]>();
  for (const item of items) {
    const key = keyOf(item);
    const lane = lanes.get(key) ?? [];
    lane.push(item);
    lanes.set(key, lane);
  }
  const pendingLanes = [...lanes.values()];
  let cursor = 0;
  await Promise.all(Array.from({ length: Math.min(Math.max(1, concurrency), pendingLanes.length) }, async () => {
    while (cursor < pendingLanes.length) {
      const lane = pendingLanes[cursor++];
      if (!lane) continue;
      for (const item of lane) await handler(item);
    }
  }));
}

export interface ProjectorRuntimeStats {
  processed: number;
  failed: number;
  batches: number;
  lastBatchSize: number;
  transactionLatencyMs: number[];
}

const runtimeStats: ProjectorRuntimeStats = {
  processed: 0,
  failed: 0,
  batches: 0,
  lastBatchSize: 0,
  transactionLatencyMs: [],
};

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
    event.productId,
    event.currentPriceVnd,
    event.endAtMs,
    event.sequence,
    event.version,
    event.occurredAtMs,
  ];
  if (
    !event.eventId ||
    !UUID.test(event.eventId) ||
    !event.type ||
    !eventTypes.has(event.type) ||
    !event.actorId ||
    !DECIMAL.test(event.actorId) ||
    decimals.some((item) => !item || !DECIMAL.test(item)) ||
    event.schemaVersion !== 1
  ) {
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
  const startedAt = performance.now();
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
        data: [
          {
            product_id: productId,
            user_id: Number(event.targetUserId),
            reason: event.reason,
          },
        ],
        skipDuplicates: true,
      });
      await tx.bidding_history.updateMany({
        where: { product_id: productId, user_id: Number(event.targetUserId), status: null },
        data: { status: "BANNED" },
      });
    }

    if (event.orderId && leaderId !== null && (event.type === "BUY_NOW_COMPLETED" || event.type === "AUCTION_CLOSED")) {
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
        redis_entry_id: streamReceiptId(entry),
        product_id: productId,
        sequence,
        version,
      },
    });
    await tx.auction_outbox.create({
      data: {
        event_id: event.eventId,
        event_type: canonicalAuctionEventType(event.type),
        event_version: 1,
        aggregate_id: event.productId,
        payload,
      },
    });
    return "applied" as const;
  });

  if (result === "applied") {
    log.info("[BID_PROJECTOR] Projected event", {
      type: event.type,
      productId: event.productId,
      currentPriceVnd: event.currentPriceVnd,
      sequence: event.sequence,
      version: event.version,
    });
    const notification: BidSocketEvent = {
      eventId: event.eventId,
      productId: event.productId,
      currentPriceVnd: event.currentPriceVnd,
      leaderId: event.leaderId ?? null,
      endTimeMs: event.endAtMs,
      sequence: event.sequence,
      version: event.version,
      orderId: event.orderId ?? null,
      status: event.status,
    };
    await redisClient.publish(COMMITTED_CHANNEL, JSON.stringify(notification)).catch((error: unknown) => {
      log.warn("[BID_PROJECTOR] Post-commit socket notification unavailable", {
        eventId: event.eventId,
        productId: event.productId,
        message: error instanceof Error ? error.message : "unknown",
      });
    });
  }
  runtimeStats.transactionLatencyMs.push(performance.now() - startedAt);
  if (runtimeStats.transactionLatencyMs.length > 1_000) runtimeStats.transactionLatencyMs.shift();
  return result;
}

type ParsedLaneEntry = { entry: RedisStreamEntry; event: AuctionStreamEvent };

async function publishCommittedEvent(event: AuctionStreamEvent): Promise<void> {
  const notification: BidSocketEvent = {
    eventId: event.eventId,
    productId: event.productId,
    currentPriceVnd: event.currentPriceVnd,
    leaderId: event.leaderId ?? null,
    endTimeMs: event.endAtMs,
    sequence: event.sequence,
    version: event.version,
    orderId: event.orderId ?? null,
    status: event.status,
  };
  await redisClient.publish(COMMITTED_CHANNEL, JSON.stringify(notification)).catch((error: unknown) => {
    log.warn("[BID_PROJECTOR] Post-commit socket notification unavailable", {
      eventId: event.eventId,
      productId: event.productId,
      message: error instanceof Error ? error.message : "unknown",
    });
  });
}

/** Projects one product lane in one transaction. Redis Stream order is retained
 * by validating a rolling sequence/version fence before any bulk write. */
export async function projectAuctionLane(entries: readonly RedisStreamEntry[]): Promise<Map<string, "applied" | "duplicate">> {
  if (entries.length === 0) return new Map();
  const startedAt = performance.now();
  const parsed: ParsedLaneEntry[] = entries.map((entry) => ({ entry, event: parseEvent(entry.payload) }));
  const productId = BigInt(parsed[0]!.event.productId);
  if (parsed.some(({ event }) => BigInt(event.productId) !== productId)) {
    throw new InvalidAuctionEventError("A projector lane contains more than one auction");
  }

  const outcomes = new Map<string, "applied" | "duplicate">();
  const applied = await prisma.$transaction(async (tx) => {
    const eventIds = parsed.map(({ event }) => event.eventId);
    const sequences = parsed.map(({ event }) => BigInt(event.sequence));
    const [processed, sequenceOwners, product] = await Promise.all([
      tx.auction_processed_events.findMany({ where: { event_id: { in: eventIds } }, select: { event_id: true } }),
      tx.auction_processed_events.findMany({
        where: { product_id: productId, sequence: { in: sequences } },
        select: { event_id: true, sequence: true },
      }),
      tx.products.findUnique({
        where: { product_id: productId },
        select: { auction_sequence: true, auction_version: true },
      }),
    ]);
    if (!product) throw new InvalidAuctionEventError(`Auction ${productId} does not exist`);

    const processedIds = new Set(processed.map((row) => row.event_id));
    const sequenceOwnerBySequence = new Map(sequenceOwners.map((row) => [row.sequence.toString(), row.event_id]));
    let rollingSequence = product.auction_sequence;
    let rollingVersion = product.auction_version;
    let finalEvent: AuctionStreamEvent | undefined;
    const appliedEntries: ParsedLaneEntry[] = [];
    const transitions: Prisma.auction_transitionsCreateManyInput[] = [];
    const histories: Prisma.bidding_historyCreateManyInput[] = [];
    const receipts: Prisma.auction_processed_eventsCreateManyInput[] = [];
    const outbox: Prisma.auction_outboxCreateManyInput[] = [];
    const orders: Prisma.ordersCreateManyInput[] = [];
    const bans: Prisma.bidding_ban_userCreateManyInput[] = [];

    for (const item of parsed) {
      const { entry, event } = item;
      if (processedIds.has(event.eventId)) {
        outcomes.set(entry.id, "duplicate");
        continue;
      }
      const sequence = BigInt(event.sequence);
      const version = BigInt(event.version);
      const owner = sequenceOwnerBySequence.get(event.sequence);
      if (owner && owner !== event.eventId) {
        throw new InvalidAuctionEventError(`Sequence ${event.sequence} belongs to another event`);
      }
      if (sequence !== rollingSequence + 1n || version <= rollingVersion) {
        throw new ProjectionGapError(
          `Projection fence rejected auction=${event.productId} sequence=${event.sequence} version=${event.version}`,
        );
      }
      const leaderId = event.leaderId ? BigInt(event.leaderId) : null;
      const payload = jsonPayload(event);
      transitions.push({ event_id: event.eventId, product_id: productId, event_type: event.type, sequence, version, payload });
      if (event.type === "BID_ACCEPTED") {
        if (!event.requestedMaxPriceVnd) throw new InvalidAuctionEventError("Accepted bid has no maximum");
        histories.push({
          event_id: event.eventId,
          product_id: productId,
          user_id: Number(event.actorId),
          max_price: BigInt(event.requestedMaxPriceVnd),
          product_price: BigInt(event.currentPriceVnd),
          price_owner_id: leaderId,
          sequence,
          version,
        });
      } else if (event.type === "BIDDER_BANNED" && event.targetUserId) {
        const bannedUserId = Number(event.targetUserId);
        bans.push({ product_id: productId, user_id: bannedUserId, reason: event.reason });
        for (const history of histories) {
          if (history.user_id === bannedUserId && history.status == null) history.status = "BANNED";
        }
        await tx.bidding_history.updateMany({
          where: { product_id: productId, user_id: bannedUserId, status: null },
          data: { status: "BANNED" },
        });
      }
      if (event.orderId && leaderId !== null && (event.type === "BUY_NOW_COMPLETED" || event.type === "AUCTION_CLOSED")) {
        orders.push({ public_order_id: event.orderId, product_id: productId, user_id: Number(leaderId), auction_sequence: sequence });
      }
      receipts.push({ event_id: event.eventId, redis_entry_id: streamReceiptId(entry), product_id: productId, sequence, version });
      outbox.push({
        event_id: event.eventId,
        event_type: canonicalAuctionEventType(event.type),
        event_version: 1,
        aggregate_id: event.productId,
        payload,
      });
      rollingSequence = sequence;
      rollingVersion = version;
      finalEvent = event;
      appliedEntries.push(item);
      outcomes.set(entry.id, "applied");
    }

    if (!finalEvent) return appliedEntries;
    if (transitions.length) await tx.auction_transitions.createMany({ data: transitions });
    if (histories.length) await tx.bidding_history.createMany({ data: histories });
    if (bans.length) await tx.bidding_ban_user.createMany({ data: bans, skipDuplicates: true });
    if (orders.length) await tx.orders.createMany({ data: orders });
    if (receipts.length) await tx.auction_processed_events.createMany({ data: receipts });
    if (outbox.length) await tx.auction_outbox.createMany({ data: outbox });
    const finalLeaderId = finalEvent.leaderId ? BigInt(finalEvent.leaderId) : null;
    const updated = await tx.products.updateMany({
      where: { product_id: productId, auction_version: { lt: rollingVersion } },
      data: {
        current_price: BigInt(finalEvent.currentPriceVnd),
        price_owner_id: finalLeaderId,
        end_time: new Date(Number(finalEvent.endAtMs)),
        auction_status: finalEvent.status,
        is_removed: finalEvent.status === "CANCELLED",
        auction_sequence: rollingSequence,
        auction_version: rollingVersion,
      },
    });
    if (updated.count !== 1) throw new ProjectionGapError("Projection version fence rejected the snapshot update");
    return appliedEntries;
  }, { maxWait: 10_000, timeout: 30_000 });

  for (const { event } of applied) await publishCommittedEvent(event);
  runtimeStats.transactionLatencyMs.push(performance.now() - startedAt);
  if (runtimeStats.transactionLatencyMs.length > 1_000) runtimeStats.transactionLatencyMs.shift();
  return outcomes;
}

export async function ensureProjectorGroup(): Promise<void> {
  if (projectorGroupReady) return;
  for (const redis of getAuctionRedisClients()) {
    try {
      await redis.xgroup("CREATE", redisAuctionKeys.results, GROUP, "0", "MKSTREAM");
    } catch (error) {
      if (!(error instanceof Error) || !error.message.includes("BUSYGROUP")) throw error;
    }
  }
  projectorGroupReady = true;
}

function entriesFromRead(raw: unknown, shard = 0): RedisStreamEntry[] {
  if (!Array.isArray(raw)) return [];
  const result: RedisStreamEntry[] = [];
  for (const stream of raw) {
    if (!Array.isArray(stream) || !Array.isArray(stream[1])) continue;
    for (const item of stream[1]) {
      if (!Array.isArray(item) || typeof item[0] !== "string" || !Array.isArray(item[1])) continue;
      const fieldIndex = item[1].indexOf("event");
      if (fieldIndex >= 0 && typeof item[1][fieldIndex + 1] === "string") {
        result.push({ id: item[0], payload: item[1][fieldIndex + 1], shard });
      }
    }
  }
  return result;
}

export async function readNewProjectorEntries(consumer: string, count = 50): Promise<RedisStreamEntry[]> {
  const reads = getAuctionRedisClients().map(async (_redis, shard) => {
    let raw: unknown;
    try {
      raw = await blockingClient(shard).xreadgroup(
      "GROUP",
      GROUP,
      consumer,
      "COUNT",
      count,
      "BLOCK",
      1_000,
      "STREAMS",
      redisAuctionKeys.results,
      ">",
    );
    } catch (error) {
      if (!isMissingGroup(error)) throw error;
      projectorGroupReady = false;
      await ensureProjectorGroup();
      raw = await blockingClient(shard).xreadgroup(
      "GROUP",
      GROUP,
      consumer,
      "COUNT",
      count,
      "BLOCK",
      1_000,
      "STREAMS",
      redisAuctionKeys.results,
      ">",
      );
    }
    return entriesFromRead(raw, shard);
  });
  return (await Promise.all(reads)).flat();
}

export async function closeProjectorRedisConnection(): Promise<void> {
  await Promise.all([...blockingRedisClients.values()].map(async (client) => {
    if (client.status !== "end") await client.quit();
  }));
  blockingRedisClients.clear();
  projectorGroupReady = false;
  lastReclaimAt = 0;
}

export async function autoClaimProjectorEntries(
  consumer: string,
  minIdleMs = 30_000,
  count = 50,
): Promise<RedisStreamEntry[]> {
  const claimed = await Promise.all(getAuctionRedisClients().map(async (redis, shard) => {
    try {
      const raw = await redis.xautoclaim(redisAuctionKeys.results, GROUP, consumer, minIdleMs, "0-0", "COUNT", count);
      return Array.isArray(raw) && Array.isArray(raw[1]) ? entriesFromRead([[redisAuctionKeys.results, raw[1]]], shard) : [];
    } catch (error) {
      if (!isMissingGroup(error)) throw error;
      projectorGroupReady = false;
      await ensureProjectorGroup();
      return [];
    }
  }));
  return claimed.flat();
}

export async function acknowledgeProjectedEntry(entryId: string, shard = 0): Promise<void> {
  const redis = getAuctionRedisClients()[shard]!;
  const acknowledged = await redis.xack(redisAuctionKeys.results, GROUP, entryId);
  if (acknowledged > 0) await redis.xdel(redisAuctionKeys.results, entryId);
  await redis.hdel(redisAuctionKeys.projectorRetries, entryId);
}

async function finalizeProjectedEntry(entry: RedisStreamEntry): Promise<void> {
  const event = parseEvent(entry.payload);
  if (isTerminalAuctionStatus(event.status)) {
    await expireTerminalAuctionState(Number(event.productId));
  }
  await acknowledgeProjectedEntry(entry.id, entry.shard);
}

export async function compactAcknowledgedProjectorEntries(): Promise<number> {
  await ensureProjectorGroup();
  let trimmed = 0;
  for (const redis of getAuctionRedisClients()) {
    const pending = await redis.xpending(redisAuctionKeys.results, GROUP, "-", "+", 1) as unknown;
    let threshold: string | undefined;
    if (Array.isArray(pending) && Array.isArray(pending[0]) && typeof pending[0][0] === "string") {
      threshold = pending[0][0];
    } else {
      const groups = await redis.xinfo("GROUPS", redisAuctionKeys.results);
      if (Array.isArray(groups)) {
        for (const raw of groups) {
          if (!Array.isArray(raw)) continue;
          const nameIndex = raw.indexOf("name");
          const deliveredIndex = raw.indexOf("last-delivered-id");
          if (raw[nameIndex + 1] === GROUP && typeof raw[deliveredIndex + 1] === "string") {
            threshold = raw[deliveredIndex + 1] as string;
            break;
          }
        }
      }
    }
    if (threshold && threshold !== "0-0") {
      trimmed += await redis.xtrim(redisAuctionKeys.results, "MINID", threshold);
    }
  }
  return trimmed;
}

export async function recordProjectionFailure(entry: RedisStreamEntry, error: unknown): Promise<"retry" | "dlq"> {
  const redis = getAuctionRedisClients()[entry.shard ?? 0]!;
  const attempts = await redis.hincrby(redisAuctionKeys.projectorRetries, entry.id, 1);
  const maxAttempts = Number(process.env.BID_PROJECTOR_MAX_ATTEMPTS ?? 10);
  if (attempts < maxAttempts) return "retry";
  const message = error instanceof Error ? error.message : "Unknown projection error";
  await redis.xadd(
    redisAuctionKeys.dlq,
    "MAXLEN",
    "~",
    Number(process.env.BID_PROJECTOR_DLQ_MAXLEN ?? 10_000),
    "*",
    "sourceEntryId",
    entry.id,
    "attempts",
    attempts.toString(),
    "error",
    message.slice(0, 2_000),
    "event",
    entry.payload,
  );
  await acknowledgeProjectedEntry(entry.id, entry.shard);
  return "dlq";
}

export async function runProjectorBatch(consumer: string): Promise<number> {
  await ensureProjectorGroup();
  const now = Date.now();
  const shouldReclaim = now - lastReclaimAt >= RECLAIM_INTERVAL_MS;
  const claimed = shouldReclaim ? await autoClaimProjectorEntries(consumer, 30_000, READ_COUNT) : [];
  if (shouldReclaim) lastReclaimAt = now;
  const fresh = await readNewProjectorEntries(consumer, READ_COUNT);
  const entries = [...claimed, ...fresh.filter((entry) => !claimed.some((item) => item.id === entry.id && item.shard === entry.shard))];
  const entryKey = (entry: RedisStreamEntry): string => {
    let key = `invalid:${entry.id}`;
    try {
      key = parseEvent(entry.payload).productId;
    } catch {
      // Malformed entries receive an isolated lane and follow retry/DLQ handling.
    }
    return key;
  };

  async function processEntry(entry: RedisStreamEntry): Promise<void> {
    let context: LogContext = { jobId: entry.id, consumerGroup: GROUP };
    try {
      const event = parseEvent(entry.payload);
      context = {
        ...context,
        eventId: event.eventId,
        correlationId: event.correlationId,
        productId: event.productId,
      };
    } catch {
      // The projector records malformed payloads through its normal retry/DLQ path.
    }
    await runWithLogContext(context, async () => {
      try {
        await projectAuctionEntry(entry);
        await finalizeProjectedEntry(entry);
        runtimeStats.processed += 1;
      } catch (error) {
        const outcome = await recordProjectionFailure(entry, error);
        runtimeStats.failed += 1;
        log.error("Projection failed", { error, outcome });
      }
    });
  }

  const lanes = new Map<string, RedisStreamEntry[]>();
  for (const entry of entries) {
    const key = entryKey(entry);
    const lane = lanes.get(key) ?? [];
    lane.push(entry);
    lanes.set(key, lane);
  }
  const laneList = [...lanes.entries()].map(([key, lane]) => ({ key, lane }));
  await runKeyedLanes(
    laneList,
    ({ key }) => key,
    async ({ lane }) => {
      try {
        await projectAuctionLane(lane);
        for (const entry of lane) {
          await finalizeProjectedEntry(entry);
          runtimeStats.processed += 1;
        }
      } catch (error) {
        // Isolate the failing entry without sacrificing the fast batch path for
        // healthy lanes. Each fallback keeps its own retry/DLQ semantics.
        log.warn("Projector lane batch failed; isolating entries", {
          error,
          entries: lane.length,
          productId: entryKey(lane[0]!),
        });
        for (const entry of lane) await processEntry(entry);
      }
    },
    CONCURRENCY,
  );
  runtimeStats.batches += 1;
  runtimeStats.lastBatchSize = entries.length;
  return entries.length;
}

export function getProjectorRuntimeStats(): ProjectorRuntimeStats & { transactionP95Ms: number } {
  const samples = [...runtimeStats.transactionLatencyMs].sort((left, right) => left - right);
  const index = Math.max(0, Math.ceil(samples.length * 0.95) - 1);
  return { ...runtimeStats, transactionLatencyMs: samples, transactionP95Ms: samples[index] ?? 0 };
}

export interface ProjectorStreamHealth {
  pending: number;
  lag: number | null;
}

export async function getProjectorStreamHealth(): Promise<ProjectorStreamHealth> {
  await ensureProjectorGroup();
  const health = await Promise.all(getAuctionRedisClients().map(async (redis) => {
  const groups = await redis.xinfo("GROUPS", redisAuctionKeys.results);
  if (!Array.isArray(groups)) return { pending: 0, lag: null };
  for (const raw of groups) {
    if (!Array.isArray(raw)) continue;
    const record = new Map<string, unknown>();
    for (let index = 0; index < raw.length; index += 2) {
      if (typeof raw[index] === "string") record.set(raw[index] as string, raw[index + 1]);
    }
    if (record.get("name") === GROUP) {
      const pending = Number(record.get("pending") ?? 0);
      const lagValue = record.get("lag");
      return { pending, lag: lagValue === null || lagValue === undefined ? null : Number(lagValue) };
    }
  }
  return { pending: 0, lag: null };
  }));
  return {
    pending: health.reduce((total, item) => total + item.pending, 0),
    lag: health.some((item) => item.lag === null) ? null : health.reduce((total, item) => total + (item.lag ?? 0), 0),
  };
}
