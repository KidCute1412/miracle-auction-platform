import { randomUUID } from "node:crypto";
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

vi.unmock("@/config/redis.config.ts");

import { redisClient } from "../../src/config/redis.config.ts";
import { prisma } from "../../src/infrastructure/database/prisma.client.ts";
import { PlaceBidUseCase } from "../../src/modules/bids/application/place-bid.use-case.ts";
import { redisAuctionAuthority } from "../../src/modules/bids/infrastructure/redis/redis-auction.authority.ts";
import { bootstrapRedisAuction } from "../../src/modules/bids/infrastructure/redis/redis-auction.bootstrap.ts";
import { redisAuctionKeys } from "../../src/modules/bids/infrastructure/redis/redis-auction.keys.ts";
import { runAuctionAuthorityRecoveryCycle } from "../../src/modules/bids/infrastructure/redis/redis-authority.recovery.ts";
import {
  acknowledgeProjectedEntry,
  autoClaimProjectorEntries,
  closeProjectorRedisConnection,
  compactAcknowledgedProjectorEntries,
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
  it("does not mistake a planned batch bootstrap for partial Redis loss", async () => {
    vi.stubEnv("AUCTION_AUTO_RECOVERY_ENABLED", "true");
    const marker = randomUUID();
    try {
      const seller = await createUser({ role: "seller" });
      const auction = await createAuction(seller.user_id);
      const productId = Number(auction.product_id);
      await prisma.auction_authority_recovery.update({
        where: { id: 1 },
        data: { state: "READY", owner_id: null, lease_until: null, last_error: null },
      });
      await bootstrapRedisAuction(productId);
      await runAuctionAuthorityRecoveryCycle();
      await redisClient.set(redisAuctionKeys.plannedBootstrap, marker, "PX", 30_000);
      await redisClient.del(redisAuctionKeys.state(productId));

      await expect(runAuctionAuthorityRecoveryCycle()).resolves.toMatchObject({
        state: "checking",
        ready: false,
        trigger: "PLANNED_BOOTSTRAP",
      });
      await expect(redisClient.exists(redisAuctionKeys.recoveryFence)).resolves.toBe(0);

      await bootstrapRedisAuction(productId);
      await redisClient.del(redisAuctionKeys.plannedBootstrap);
      await expect(runAuctionAuthorityRecoveryCycle()).resolves.toMatchObject({ state: "ready", ready: true });
    } finally {
      await redisClient.del(redisAuctionKeys.plannedBootstrap);
      vi.unstubAllEnvs();
    }
  });

  it("automatically rebuilds total Redis loss from PostgreSQL and preserves a successful retry", async () => {
    vi.stubEnv("AUCTION_AUTO_RECOVERY_ENABLED", "true");
    try {
      const seller = await createUser({ role: "seller" });
      const bidder = await createUser();
      const auction = await createAuction(seller.user_id);
      const productId = Number(auction.product_id);
      await prisma.auction_authority_recovery.update({
        where: { id: 1 },
        data: {
          state: "READY",
          owner_id: null,
          lease_until: null,
          last_error: null,
          last_redis_healthy_at: new Date(),
        },
      });
      await bootstrapRedisAuction(productId);
      const accepted = await redisAuctionAuthority.mutate({
        operation: "BID",
        productId,
        actorId: bidder.user_id,
        actorRole: "user",
        amountVnd: "120",
        idempotencyKey: "survives-total-redis-loss",
        correlationId: randomUUID(),
      });
      await runProjectorBatch("integration-before-total-loss");
      await runAuctionAuthorityRecoveryCycle();
      const endBeforeLoss = await redisClient.hget(redisAuctionKeys.state(productId), "endAtMs");

      await redisClient.flushdb();
      const recovered = await runAuctionAuthorityRecoveryCycle();

      expect(recovered).toMatchObject({ ready: true, state: "ready", trigger: "FULL_DATA_LOSS" });
      await expect(redisClient.exists(redisAuctionKeys.state(productId))).resolves.toBe(1);
      await expect(redisClient.exists(redisAuctionKeys.recoveryFence)).resolves.toBe(0);
      const endAfterLoss = await redisClient.hget(redisAuctionKeys.state(productId), "endAtMs");
      expect(Number(endAfterLoss)).toBeGreaterThanOrEqual(Number(endBeforeLoss) + 300_000);
      const retry = await redisAuctionAuthority.mutate({
        operation: "BID",
        productId,
        actorId: bidder.user_id,
        actorRole: "user",
        amountVnd: "120",
        idempotencyKey: "survives-total-redis-loss",
        correlationId: randomUUID(),
      });
      expect(retry.data.event_id).toBe(accepted.data.event_id);
      await expect(prisma.auction_authority_recovery.findUniqueOrThrow({ where: { id: 1 } })).resolves.toMatchObject({
        state: "READY",
        owner_id: null,
        last_error: null,
      });
    } finally {
      vi.unstubAllEnvs();
    }
  });

  it("recovers one missing auction state without blocking a healthy auction", async () => {
    vi.stubEnv("AUCTION_AUTO_RECOVERY_ENABLED", "true");
    try {
      const seller = await createUser({ role: "seller" });
      const bidder = await createUser();
      const healthyBidder = await createUser();
      const broken = await createAuction(seller.user_id);
      const healthy = await createAuction(seller.user_id);
      const brokenId = Number(broken.product_id);
      const healthyId = Number(healthy.product_id);
      await prisma.auction_authority_recovery.update({
        where: { id: 1 },
        data: { state: "READY", owner_id: null, lease_until: null, last_error: null, last_redis_healthy_at: new Date() },
      });
      await bootstrapRedisAuction(brokenId);
      await bootstrapRedisAuction(healthyId);
      await runAuctionAuthorityRecoveryCycle();

      await redisClient.del(redisAuctionKeys.state(brokenId));
      await redisClient.set(redisAuctionKeys.auctionRecoveryFence(brokenId), "test-partial-fence");
      const healthyBid = await redisAuctionAuthority.mutate({
        operation: "BID", productId: healthyId, actorId: healthyBidder.user_id, actorRole: "user", amountVnd: "120",
        idempotencyKey: "healthy-during-partial-recovery", correlationId: randomUUID(),
      });
      expect(healthyBid.status).toBe("success");

      const recovered = await runAuctionAuthorityRecoveryCycle();
      expect(recovered).toMatchObject({ state: "ready", ready: true, scope: "none", affectedAuctionIds: [] });
      await expect(redisClient.exists(redisAuctionKeys.state(brokenId))).resolves.toBe(1);
      await expect(redisClient.exists(redisAuctionKeys.auctionRecoveryFence(brokenId))).resolves.toBe(0);
      await expect(redisClient.exists(redisAuctionKeys.recoveryFence)).resolves.toBe(0);

      await expect(redisAuctionAuthority.mutate({
        operation: "BID", productId: brokenId, actorId: bidder.user_id, actorRole: "user", amountVnd: "120",
        idempotencyKey: "broken-after-recovery", correlationId: randomUUID(),
      })).resolves.toMatchObject({ status: "success" });
    } finally {
      vi.unstubAllEnvs();
    }
  });

  it("repairs an auction state key corrupted to the wrong Redis type", async () => {
    vi.stubEnv("AUCTION_AUTO_RECOVERY_ENABLED", "true");
    try {
      const seller = await createUser({ role: "seller" });
      const auction = await createAuction(seller.user_id);
      const healthyAuction = await createAuction(seller.user_id);
      const productId = Number(auction.product_id);
      const healthyProductId = Number(healthyAuction.product_id);
      await prisma.auction_authority_recovery.update({
        where: { id: 1 },
        data: { state: "READY", owner_id: null, lease_until: null, last_error: null, last_redis_healthy_at: new Date() },
      });
      await bootstrapRedisAuction(productId);
      await bootstrapRedisAuction(healthyProductId);
      await runAuctionAuthorityRecoveryCycle();

      await redisClient.del(
        redisAuctionKeys.maxima(productId),
        redisAuctionKeys.ranking(productId),
        redisAuctionKeys.rankMembers(productId),
        redisAuctionKeys.bans(productId),
      );
      await redisClient.set(redisAuctionKeys.state(productId), "corrupted-state");

      await expect(runAuctionAuthorityRecoveryCycle()).resolves.toMatchObject({
        state: "ready",
        ready: true,
        scope: "none",
        affectedAuctionIds: [],
      });
      await expect(redisClient.type(redisAuctionKeys.state(productId))).resolves.toBe("hash");
      await expect(redisClient.hget(redisAuctionKeys.state(productId), "productId")).resolves.toBe(productId.toString());
      await expect(redisClient.exists(redisAuctionKeys.auctionRecoveryFence(productId))).resolves.toBe(0);
    } finally {
      vi.unstubAllEnvs();
    }
  });

  it("does not complete targeted recovery around a malformed target stream event", async () => {
    vi.stubEnv("AUCTION_AUTO_RECOVERY_ENABLED", "true");
    try {
      const seller = await createUser({ role: "seller" });
      const broken = await createAuction(seller.user_id);
      const healthy = await createAuction(seller.user_id);
      const brokenId = Number(broken.product_id);
      const healthyId = Number(healthy.product_id);
      await prisma.auction_authority_recovery.update({
        where: { id: 1 },
        data: { state: "READY", owner_id: null, lease_until: null, last_error: null, last_redis_healthy_at: new Date() },
      });
      await bootstrapRedisAuction(brokenId);
      await bootstrapRedisAuction(healthyId);
      await runAuctionAuthorityRecoveryCycle();

      await redisClient.del(redisAuctionKeys.state(brokenId));
      await redisClient.xadd(
        redisAuctionKeys.results,
        "*",
        "event",
        JSON.stringify({ productId: brokenId.toString(), type: "BROKEN_EVENT" }),
      );

      await expect(runAuctionAuthorityRecoveryCycle()).rejects.toThrow(/malformed stream event belongs to recovering auction/i);
      await expect(redisClient.exists(redisAuctionKeys.auctionRecoveryFence(brokenId))).resolves.toBe(1);
      await expect(redisClient.type(redisAuctionKeys.state(brokenId))).resolves.toBe("none");
    } finally {
      vi.unstubAllEnvs();
    }
  });

  it("rebuilds missing bid indexes after an auction has active bid history", async () => {
    vi.stubEnv("AUCTION_AUTO_RECOVERY_ENABLED", "true");
    try {
      const seller = await createUser({ role: "seller" });
      const bidder = await createUser();
      const auction = await createAuction(seller.user_id);
      const healthy = await createAuction(seller.user_id);
      const productId = Number(auction.product_id);
      const healthyId = Number(healthy.product_id);
      await prisma.auction_authority_recovery.update({
        where: { id: 1 },
        data: { state: "READY", owner_id: null, lease_until: null, last_error: null, last_redis_healthy_at: new Date() },
      });
      await bootstrapRedisAuction(productId);
      await bootstrapRedisAuction(healthyId);
      await runAuctionAuthorityRecoveryCycle();
      await redisAuctionAuthority.mutate({
        operation: "BID", productId, actorId: bidder.user_id, actorRole: "user", amountVnd: "120",
        idempotencyKey: "bid-before-index-corruption", correlationId: randomUUID(),
      });
      await runProjectorBatch("active-bid-index-recovery");

      await redisClient.del(redisAuctionKeys.maxima(productId));
      await expect(runAuctionAuthorityRecoveryCycle()).resolves.toMatchObject({
        state: "ready", ready: true, scope: "none", affectedAuctionIds: [],
      });
      await expect(redisClient.type(redisAuctionKeys.maxima(productId))).resolves.toBe("hash");
      await expect(redisClient.hget(redisAuctionKeys.maxima(productId), bidder.user_id.toString())).resolves.toBe("120");
      await expect(redisClient.exists(redisAuctionKeys.auctionRecoveryFence(productId))).resolves.toBe(0);
    } finally {
      vi.unstubAllEnvs();
    }
  });

  it("installs one snapshot when two bootstrap callers race", async () => {
    const seller = await createUser({ role: "seller" });
    const auction = await createAuction(seller.user_id);
    const results = await Promise.all([
      bootstrapRedisAuction(Number(auction.product_id)),
      bootstrapRedisAuction(Number(auction.product_id)),
    ]);
    expect(results.filter(Boolean)).toHaveLength(1);
    await expect(redisClient.hget(redisAuctionKeys.state(auction.product_id), "productId")).resolves.toBe(
      auction.product_id.toString(),
    );
  });

  it("fails closed instead of rebuilding a missing authority state on the bid path", async () => {
    const seller = await createUser({ role: "seller" });
    const bidder = await createUser();
    const auction = await createAuction(seller.user_id);
    const productId = Number(auction.product_id);
    const previousBidEngine = process.env.BID_ENGINE;
    process.env.BID_ENGINE = "redis";

    try {
      await expect(
        new PlaceBidUseCase().execute({
          userId: bidder.user_id,
          productId,
          maxPriceVnd: "120",
          idempotencyKey: "bootstrap-first-bid",
          correlationId: randomUUID(),
        }),
      ).rejects.toMatchObject({ statusCode: 503, code: "AUCTION_STATE_NOT_READY" });
    } finally {
      if (previousBidEngine === undefined) delete process.env.BID_ENGINE;
      else process.env.BID_ENGINE = previousBidEngine;
    }

    await expect(redisClient.exists(redisAuctionKeys.state(productId))).resolves.toBe(0);
  });

  it("activates a cached PENDING auction when its start time arrives", async () => {
    const seller = await createUser({ role: "seller" });
    const bidder = await createUser();
    const startTime = new Date(Date.now() + 60_000);
    const endTime = new Date(startTime.getTime() + 60 * 60_000);
    const auction = await createAuction(seller.user_id, {
      start_time: startTime,
      end_time: endTime,
      auction_status: "PENDING",
    });
    const productId = Number(auction.product_id);

    await bootstrapRedisAuction(productId);
    await expect(redisClient.hget(redisAuctionKeys.state(productId), "status")).resolves.toBe("PENDING");

    await expect(
      redisAuctionAuthority.mutate({
        operation: "BID",
        productId,
        actorId: bidder.user_id,
        actorRole: "user",
        amountVnd: "120",
        idempotencyKey: "pending-becomes-active",
        correlationId: randomUUID(),
        now: new Date(startTime.getTime() + 1),
      }),
    ).resolves.toMatchObject({ status: "success" });

    await expect(redisClient.hget(redisAuctionKeys.state(productId), "status")).resolves.toBe("ACTIVE");
    await runProjectorBatch("integration-pending-activation");
    await expect(
      prisma.products.findUniqueOrThrow({ where: { product_id: auction.product_id } }),
    ).resolves.toMatchObject({ auction_status: "ACTIVE" });
  });

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
    const bidEntries = await redisClient.xrange(redisAuctionKeys.results, "-", "+");
    const persistedBidEntry = bidEntries[0];
    expect(persistedBidEntry).toBeDefined();
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
    await expect(redisClient.xlen(redisAuctionKeys.results)).resolves.toBe(0);

    await expect(reconcileAuctionProjection(productId)).resolves.toMatchObject({
      status: "converged",
      redisLastEventId: bid.data.event_id,
      postgresLastEventId: bid.data.event_id,
    });
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
    await expect(reconcileAuctionProjection(productId)).resolves.toMatchObject({
      status: "converged",
      redisLastEventId: buyNow.data.event_id,
      postgresLastEventId: buyNow.data.event_id,
    });
    await expect(redisClient.pttl(redisAuctionKeys.state(productId))).resolves.toBeGreaterThan(0);

    const payloadIndex = persistedBidEntry![1].indexOf("event");
    await expect(
      projectAuctionEntry({ id: persistedBidEntry![0], payload: persistedBidEntry![1][payloadIndex + 1]! }),
    ).resolves.toBe("duplicate");
  });

  it("reports Redis/PostgreSQL deadline and status divergence", async () => {
    const seller = await createUser({ role: "seller" });
    const auction = await createAuction(seller.user_id);
    const productId = Number(auction.product_id);
    await bootstrapRedisAuction(productId);

    await expect(reconcileAuctionProjection(productId)).resolves.toMatchObject({ status: "converged" });
    await redisClient.hset(redisAuctionKeys.state(productId), "endAtMs", String(auction.end_time!.getTime() + 60_000));
    await expect(reconcileAuctionProjection(productId)).resolves.toMatchObject({
      status: "diverged",
      redisEndAtMs: String(auction.end_time!.getTime() + 60_000),
    });
  });

  it("reports a mismatched projection checkpoint as divergence", async () => {
    const seller = await createUser({ role: "seller" });
    const bidder = await createUser();
    const auction = await createAuction(seller.user_id);
    const productId = Number(auction.product_id);
    await bootstrapRedisAuction(productId);

    const bid = await redisAuctionAuthority.mutate({
      operation: "BID",
      productId,
      actorId: bidder.user_id,
      actorRole: "user",
      amountVnd: "120",
      idempotencyKey: "checkpoint-divergence",
      correlationId: randomUUID(),
    });
    await runProjectorBatch("integration-checkpoint");
    await expect(reconcileAuctionProjection(productId)).resolves.toMatchObject({
      status: "converged",
      redisLastEventId: bid.data.event_id,
      postgresLastEventId: bid.data.event_id,
    });

    await redisClient.hset(redisAuctionKeys.state(productId), "lastEventId", randomUUID());
    await expect(reconcileAuctionProjection(productId)).resolves.toMatchObject({ status: "diverged" });
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
        operation: "BID",
        productId,
        actorId: first.user_id,
        actorRole: "user",
        amountVnd: "150",
        idempotencyKey: "concurrent-1",
        correlationId: randomUUID(),
      }),
      redisAuctionAuthority.mutate({
        operation: "BID",
        productId,
        actorId: second.user_id,
        actorRole: "user",
        amountVnd: "170",
        idempotencyKey: "concurrent-2",
        correlationId: randomUUID(),
      }),
    ]);
    expect(results.map((result) => BigInt(result.data.sequence)).sort()).toEqual([1n, 2n]);
    await runProjectorBatch("integration-2");

    const product = await prisma.products.findUniqueOrThrow({ where: { product_id: auction.product_id } });
    expect(product.auction_sequence).toBe(2n);
    expect(product.auction_version).toBe(2n);
    await expect(prisma.auction_processed_events.count({ where: { product_id: auction.product_id } })).resolves.toBe(2);
    await expect(prisma.auction_transitions.count({ where: { product_id: auction.product_id } })).resolves.toBe(2);
  });

  it("recovers a crashed consumer pending entry and dead-letters a terminal failure", async () => {
    const seller = await createUser({ role: "seller" });
    const bidder = await createUser();
    const auction = await createAuction(seller.user_id);
    const productId = Number(auction.product_id);
    await bootstrapRedisAuction(productId);
    await redisAuctionAuthority.mutate({
      operation: "BID",
      productId,
      actorId: bidder.user_id,
      actorRole: "user",
      amountVnd: "120",
      idempotencyKey: "pending-recovery",
      correlationId: randomUUID(),
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
        { id: "9999999999999-0", payload: '{"invalid":true}' },
        new Error("terminal schema error"),
      );
      expect(outcome).toBe("dlq");
      await expect(redisClient.xlen(redisAuctionKeys.dlq)).resolves.toBe(1);
    } finally {
      if (previousMaxAttempts === undefined) delete process.env.BID_PROJECTOR_MAX_ATTEMPTS;
      else process.env.BID_PROJECTOR_MAX_ATTEMPTS = previousMaxAttempts;
    }
  });

  it("never compacts a pending projector entry", async () => {
    const seller = await createUser({ role: "seller" });
    const bidder = await createUser();
    const auction = await createAuction(seller.user_id);
    const productId = Number(auction.product_id);
    await bootstrapRedisAuction(productId);
    await redisAuctionAuthority.mutate({
      operation: "BID",
      productId,
      actorId: bidder.user_id,
      actorRole: "user",
      amountVnd: "120",
      idempotencyKey: "pending-compaction",
      correlationId: randomUUID(),
    });
    await ensureProjectorGroup();
    const pending = await readNewProjectorEntries("pending-compaction-consumer");
    expect(pending).toHaveLength(1);
    await compactAcknowledgedProjectorEntries();
    await expect(redisClient.xlen(redisAuctionKeys.results)).resolves.toBe(1);
    await projectAuctionEntry(pending[0]!);
    await acknowledgeProjectedEntry(pending[0]!.id);
    await expect(redisClient.xlen(redisAuctionKeys.results)).resolves.toBe(0);
  });

  it("expires idempotency records independently", async () => {
    const seller = await createUser({ role: "seller" });
    const bidder = await createUser();
    const auction = await createAuction(seller.user_id);
    const productId = Number(auction.product_id);
    await bootstrapRedisAuction(productId);
    const previousTtl = process.env.BID_IDEMPOTENCY_TTL_MS;
    process.env.BID_IDEMPOTENCY_TTL_MS = "5000";
    try {
      for (const key of ["low-one", "low-two"]) {
        await expect(
          redisAuctionAuthority.mutate({
            operation: "BID",
            productId,
            actorId: bidder.user_id,
            actorRole: "user",
            amountVnd: "105",
            idempotencyKey: key,
            correlationId: randomUUID(),
          }),
        ).rejects.toMatchObject({ code: "BID_TOO_LOW" });
        if (key === "low-one") await new Promise((resolve) => setTimeout(resolve, 25));
      }
      const keys = await redisClient.keys(`auction:v1:${productId}:idempotency-request:*`);
      expect(keys).toHaveLength(2);
      const ttls = await Promise.all(keys.map((key) => redisClient.pttl(key)));
      expect(ttls.every((ttl) => ttl > 0 && ttl <= 5000)).toBe(true);
      expect(Math.abs(ttls[0]! - ttls[1]!)).toBeGreaterThanOrEqual(10);
    } finally {
      if (previousTtl === undefined) delete process.env.BID_IDEMPOTENCY_TTL_MS;
      else process.env.BID_IDEMPOTENCY_TTL_MS = previousTtl;
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
      operation: "BID",
      productId: closeProductId,
      actorId: bidder.user_id,
      actorRole: "user",
      amountVnd: "120",
      idempotencyKey: "extend-bid",
      correlationId: randomUUID(),
    });
    expect(Number(bid.data.end_time_ms)).toBeGreaterThan(originalEndMs);
    await redisAuctionAuthority.mutate({
      operation: "BAN",
      productId: closeProductId,
      actorId: seller.user_id,
      actorRole: "seller",
      targetUserId: bidder.user_id,
      reason: "policy",
      idempotencyKey: "ban-bidder",
      correlationId: randomUUID(),
    });
    await runProjectorBatch("integration-mutations");
    await expect(
      prisma.bidding_ban_user.count({
        where: { product_id: closeAuction.product_id, user_id: bidder.user_id },
      }),
    ).resolves.toBe(1);

    const winner = await createUser();
    const dueAuction = await createAuction(seller.user_id);
    const dueProductId = Number(dueAuction.product_id);
    await bootstrapRedisAuction(dueProductId);
    await redisAuctionAuthority.mutate({
      operation: "BID",
      productId: dueProductId,
      actorId: winner.user_id,
      actorRole: "user",
      amountVnd: "130",
      idempotencyKey: "close-winner",
      correlationId: randomUUID(),
    });
    const close = await redisAuctionAuthority.mutate({
      operation: "CLOSE",
      productId: dueProductId,
      actorId: 0,
      actorRole: "system",
      idempotencyKey: "close-due",
      correlationId: randomUUID(),
      now: new Date(dueAuction.end_time!.getTime() + 1),
    });
    expect(close.data.order_id).toMatch(UUID);
    await runProjectorBatch("integration-mutations");
    await expect(prisma.orders.count({ where: { product_id: dueAuction.product_id } })).resolves.toBe(1);

    const cancelledAuction = await createAuction(seller.user_id);
    const cancelledProductId = Number(cancelledAuction.product_id);
    await bootstrapRedisAuction(cancelledProductId);
    await redisAuctionAuthority.mutate({
      operation: "CANCEL",
      productId: cancelledProductId,
      actorId: seller.user_id,
      actorRole: "seller",
      reason: "seller cancelled",
      idempotencyKey: "cancel-auction",
      correlationId: randomUUID(),
    });
    await runProjectorBatch("integration-mutations");
    await expect(
      prisma.products.findUniqueOrThrow({ where: { product_id: cancelledAuction.product_id } }),
    ).resolves.toMatchObject({ auction_status: "CANCELLED", is_removed: true });
  });

  it("does not let bidder throttling block the system close mutation", async () => {
    const previousRateLimit = process.env.BID_RATE_LIMIT;
    process.env.BID_RATE_LIMIT = "0";
    try {
      const seller = await createUser({ role: "seller" });
      const bidder = await createUser();
      const auction = await createAuction(seller.user_id);
      const productId = Number(auction.product_id);
      await bootstrapRedisAuction(productId);

      await expect(
        redisAuctionAuthority.mutate({
          operation: "BID",
          productId,
          actorId: bidder.user_id,
          actorRole: "user",
          amountVnd: "120",
          idempotencyKey: "rate-limited-bid",
          correlationId: randomUUID(),
        }),
      ).rejects.toMatchObject({ code: "RATE_LIMITED" });
      await expect(redisClient.keys(`auction:v1:${productId}:idempotency-request:*`)).resolves.toHaveLength(0);

      await expect(
        redisAuctionAuthority.mutate({
          operation: "CLOSE",
          productId,
          actorId: 0,
          actorRole: "system",
          idempotencyKey: "system-close-not-rate-limited",
          correlationId: randomUUID(),
          now: new Date(auction.end_time!.getTime() + 1),
        }),
      ).resolves.toMatchObject({ status: "success" });
    } finally {
      if (previousRateLimit === undefined) delete process.env.BID_RATE_LIMIT;
      else process.env.BID_RATE_LIMIT = previousRateLimit;
    }
  });
});
