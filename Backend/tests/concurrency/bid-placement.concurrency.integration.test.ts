import { beforeEach, describe, expect, it, vi } from "vitest";
import { randomUUID } from "node:crypto";
vi.unmock("@/config/redis.config.ts");

import { PlaceBidUseCase } from "../../src/modules/bids/application/place-bid.use-case.ts";
import { prisma } from "../../src/infrastructure/database/prisma.client.ts";
import { redisClient } from "../../src/config/redis.config.ts";
import { bootstrapRedisAuction } from "../../src/modules/bids/infrastructure/redis/redis-auction.bootstrap.ts";
import { runProjectorBatch } from "../../src/modules/bids/infrastructure/redis/redis-stream.projector.ts";
import { createAuction, createUser } from "../support/fixtures.ts";
import { useIsolatedDatabase } from "../support/database.ts";

useIsolatedDatabase();
beforeEach(async () => redisClient.flushdb());

describe("Redis-authoritative bid placement concurrency integration", () => {
  it("serializes competing bids and only persists committed auction effects", async () => {
    const seller = await createUser({ role: "seller" });
    const firstBidder = await createUser();
    const secondBidder = await createUser();
    const auction = await createAuction(seller.user_id);
    const productId = Number(auction.product_id);
    await bootstrapRedisAuction(productId);

    const results = await Promise.allSettled([
      new PlaceBidUseCase().execute({ userId: firstBidder.user_id, productId, maxPriceVnd: "110", idempotencyKey: "first-bid", correlationId: randomUUID() }),
      new PlaceBidUseCase().execute({ userId: secondBidder.user_id, productId, maxPriceVnd: "110", idempotencyKey: "second-bid", correlationId: randomUUID() }),
    ]);

    const committed = results.filter((result) => result.status === "fulfilled");
    expect(committed).toHaveLength(2);
    for (let attempt = 0; attempt < 3; attempt += 1) {
      await runProjectorBatch("concurrency-test");
    }

    const product = await prisma.products.findUniqueOrThrow({ where: { product_id: auction.product_id } });
    const history = await prisma.bidding_history.findMany({ where: { product_id: auction.product_id } });
    const outbox = await prisma.auction_outbox.findMany({ where: { aggregate_id: String(productId) } });
    expect(product.price_owner_id).not.toBeNull();
    expect(history).toHaveLength(committed.length);
    expect(product.current_price).toBeGreaterThanOrEqual(100n);
    expect(product.current_price).toBeLessThanOrEqual(110n);
    expect(history.some((entry) => entry.price_owner_id === product.price_owner_id)).toBe(true);
    expect(outbox.filter((event) => event.event_type === "bid.accepted.v1")).toHaveLength(committed.length);

    const beforeRejectedAttempt = { history: history.length, outbox: outbox.length, owner: product.price_owner_id };
    await expect(new PlaceBidUseCase().execute({ userId: firstBidder.user_id, productId, maxPriceVnd: "110", idempotencyKey: "rejected-bid", correlationId: randomUUID() })).rejects.toMatchObject({ code: "BID_TOO_LOW" });
    await expect(prisma.bidding_history.count({ where: { product_id: auction.product_id } })).resolves.toBe(beforeRejectedAttempt.history);
    await expect(prisma.auction_outbox.count({ where: { aggregate_id: String(productId) } })).resolves.toBe(beforeRejectedAttempt.outbox);
    await expect(prisma.products.findUniqueOrThrow({ where: { product_id: auction.product_id } })).resolves.toMatchObject({ price_owner_id: beforeRejectedAttempt.owner });
  });
});
