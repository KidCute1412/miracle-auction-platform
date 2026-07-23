import { randomUUID } from "node:crypto";
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

vi.unmock("@/config/redis.config.ts");

import { redisClient } from "../../src/config/redis.config.ts";
import { prisma } from "../../src/infrastructure/database/prisma.client.ts";
import { redisAuctionAuthority } from "../../src/modules/bids/infrastructure/redis/redis-auction.authority.ts";
import { bootstrapRedisAuction } from "../../src/modules/bids/infrastructure/redis/redis-auction.bootstrap.ts";
import { redisAuctionKeys } from "../../src/modules/bids/infrastructure/redis/redis-auction.keys.ts";
import {
  acknowledgeProjectedEntry,
  autoClaimProjectorEntries,
  closeProjectorRedisConnection,
  ensureProjectorGroup,
  projectAuctionEntry,
  readNewProjectorEntries,
  recordProjectionFailure,
  runProjectorBatch,
} from "../../src/modules/bids/infrastructure/redis/redis-stream.projector.ts";
import { reconcileAuctionProjection } from "../../src/modules/bids/infrastructure/redis/redis-projection.reconciliation.ts";
import { createAuction, createUser } from "../support/fixtures.ts";
import { useIsolatedDatabase } from "../support/database.ts";

useIsolatedDatabase();
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

beforeEach(async () => {
  await redisClient.flushdb();
});
afterAll(async () => closeProjectorRedisConnection());

describe("Redis-authoritative bidding integration", () => {
  it("mutates once, safely replays, projects, and creates one public buy-now order", async () => {
    const seller = await createUser({ role: "seller" });
    const bidder = await createUser();
    const auction = await createAuction(seller.user_id, { buy_now_price: 300 });
    const productId = Number(auction.product_id);
    await bootstrapRedisAuction(productId);

    const bid = await redisAuctionAuthority.mutate({
      operation: "BID",
      productId,
      actorId: bidder.user_id,
      actorRole: "user",
      amountVnd: "120",
      idempotencyKey: "bid-once",
      correlationId: randomUUID(),
    });
    const replay = await redisAuctionAuthority.mutate({
      operation: "BID",
      productId,
      actorId: bidder.user_id,
      actorRole: "user",
      amountVnd: "120",
      idempotencyKey: "bid-once",
      correlationId: randomUUID(),
    });
    expect(replay.data.event_id).toBe(bid.data.event_id);
    await runProjectorBatch("integration-1");

    await expect(reconcileAuctionProjection(productId)).resolves.toMatchObject({ status: "converged" });
    const projectedBid = await prisma.bidding_history.findMany({ where: { product_id: auction.product_id } });
    expect(projectedBid).toHaveLength(1);
    expect(projectedBid[0]?.max_price).toBe(120n);

    const buyNow = await redisAuctionAuthority.mutate({
      operation: "BUY_NOW",
      productId,
      actorId: bidder.user_id,
      actorRole: "user",
      amountVnd: "300",
      idempotencyKey: "buy-once",
      correlationId: randomUUID(),
    });
    await runProjectorBatch("integration-1");
    const orders = await prisma.orders.findMany({ where: { product_id: auction.product_id } });
    expect(orders).toHaveLength(1);
    expect(orders[0]?.public_order_id).toBe(buyNow.data.order_id);
    await expect(reconcileAuctionProjection(productId)).resolves.toMatchObject({ status: "converged" });

    const entries = await redisClient.xrange(redisAuctionKeys.results, "-", "+");
    const first = entries[0];
    expect(first).toBeDefined();
    const payloadIndex = first![1].indexOf("event");
    await expect(projectAuctionEntry({ id: first![0], payload: first![1][payloadIndex + 1]! }))
      .resolves.toBe("duplicate");
  });

  it("serializes concurrent maxima with monotonic sequence and projects both exactly once", async () => {
    const seller = await createUser({ role: "seller" });
    const first = await createUser();
    const second = await createUser();
    const auction = await createAuction(seller.user_id);
    const productId = Number(auction.product_id);
    await bootstrapRedisAuction(productId);

    const results = await Promise.all([
      redisAuctionAuthority.mutate({
        operation: "BID", productId, actorId: first.user_id, actorRole: "user",
        amountVnd: "150", idempotencyKey: "concurrent-1", correlationId: randomUUID(),
      }),
      redisAuctionAuthority.mutate({
        operation: "BID", productId, actorId: second.user_id, actorRole: "user",
        amountVnd: "170", idempotencyKey: "concurrent-2", correlationId: randomUUID(),
      }),
    ]);
    expect(results.map((result) => BigInt(result.data.sequence)).sort()).toEqual([1n, 2n]);
    await runProjectorBatch("integration-2");

    const product = await prisma.products.findUniqueOrThrow({ where: { product_id: auction.product_id } });
    expect(product.auction_sequence).toBe(2n);
    expect(product.auction_version).toBe(2n);
    await expect(prisma.auction_processed_events.count({ where: { product_id: auction.product_id } }))
      .resolves.toBe(2);
    await expect(prisma.auction_transitions.count({ where: { product_id: auction.product_id } }))
      .resolves.toBe(2);
  });

  it("recovers a crashed consumer pending entry and dead-letters a terminal failure", async () => {
    const seller = await createUser({ role: "seller" });
    const bidder = await createUser();
    const auction = await createAuction(seller.user_id);
    const productId = Number(auction.product_id);
    await bootstrapRedisAuction(productId);
    await redisAuctionAuthority.mutate({
      operation: "BID", productId, actorId: bidder.user_id, actorRole: "user",
      amountVnd: "120", idempotencyKey: "pending-recovery", correlationId: randomUUID(),
    });

    await ensureProjectorGroup();
    const abandoned = await readNewProjectorEntries("crashed-consumer");
    expect(abandoned).toHaveLength(1);
    const recovered = await autoClaimProjectorEntries("replacement-consumer", 0);
    expect(recovered.map((entry) => entry.id)).toContain(abandoned[0]!.id);
    await projectAuctionEntry(recovered[0]!);
    await acknowledgeProjectedEntry(recovered[0]!.id);

    const previousMaxAttempts = process.env.BID_PROJECTOR_MAX_ATTEMPTS;
    process.env.BID_PROJECTOR_MAX_ATTEMPTS = "1";
    try {
      const outcome = await recordProjectionFailure(
        { id: "9999999999999-0", payload: "{\"invalid\":true}" },
        new Error("terminal schema error"),
      );
      expect(outcome).toBe("dlq");
      await expect(redisClient.xlen(redisAuctionKeys.dlq)).resolves.toBe(1);
    } finally {
      if (previousMaxAttempts === undefined) delete process.env.BID_PROJECTOR_MAX_ATTEMPTS;
      else process.env.BID_PROJECTOR_MAX_ATTEMPTS = previousMaxAttempts;
    }
  });

  it("routes anti-sniping, ban, close, and cancel through ordered Redis mutations", async () => {
    await prisma.extend_bidding_time.create({ data: { threshold_time: 120n, extend_time: 10n } });
    const seller = await createUser({ role: "seller" });
    const bidder = await createUser();

    const closeAuction = await createAuction(seller.user_id);
    await prisma.products.update({
      where: { product_id: closeAuction.product_id },
      data: { auto_extended: true },
    });
    const closeProductId = Number(closeAuction.product_id);
    await bootstrapRedisAuction(closeProductId);
    const originalEndMs = closeAuction.end_time!.getTime();
    const bid = await redisAuctionAuthority.mutate({
      operation: "BID", productId: closeProductId, actorId: bidder.user_id, actorRole: "user",
      amountVnd: "120", idempotencyKey: "extend-bid", correlationId: randomUUID(),
    });
    expect(Number(bid.data.end_time_ms)).toBeGreaterThan(originalEndMs);
    await redisAuctionAuthority.mutate({
      operation: "BAN", productId: closeProductId, actorId: seller.user_id, actorRole: "seller",
      targetUserId: bidder.user_id, reason: "policy", idempotencyKey: "ban-bidder",
      correlationId: randomUUID(),
    });
    await runProjectorBatch("integration-mutations");
    await expect(prisma.bidding_ban_user.count({
      where: { product_id: closeAuction.product_id, user_id: bidder.user_id },
    })).resolves.toBe(1);

    const winner = await createUser();
    const dueAuction = await createAuction(seller.user_id);
    const dueProductId = Number(dueAuction.product_id);
    await bootstrapRedisAuction(dueProductId);
    await redisAuctionAuthority.mutate({
      operation: "BID", productId: dueProductId, actorId: winner.user_id, actorRole: "user",
      amountVnd: "130", idempotencyKey: "close-winner", correlationId: randomUUID(),
    });
    const close = await redisAuctionAuthority.mutate({
      operation: "CLOSE", productId: dueProductId, actorId: 0, actorRole: "system",
      idempotencyKey: "close-due", correlationId: randomUUID(),
      now: new Date(dueAuction.end_time!.getTime() + 1),
    });
    expect(close.data.order_id).toMatch(UUID);
    await runProjectorBatch("integration-mutations");
    await expect(prisma.orders.count({ where: { product_id: dueAuction.product_id } })).resolves.toBe(1);

    const cancelledAuction = await createAuction(seller.user_id);
    const cancelledProductId = Number(cancelledAuction.product_id);
    await bootstrapRedisAuction(cancelledProductId);
    await redisAuctionAuthority.mutate({
      operation: "CANCEL", productId: cancelledProductId, actorId: seller.user_id, actorRole: "seller",
      reason: "seller cancelled", idempotencyKey: "cancel-auction", correlationId: randomUUID(),
    });
    await runProjectorBatch("integration-mutations");
    await expect(prisma.products.findUniqueOrThrow({ where: { product_id: cancelledAuction.product_id } }))
      .resolves.toMatchObject({ auction_status: "CANCELLED", is_removed: true });
  });
});
