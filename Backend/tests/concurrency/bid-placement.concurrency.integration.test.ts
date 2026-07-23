import { describe, expect, it } from "vitest";
import { PlaceBidUseCase } from "../../src/modules/bids/application/place-bid.use-case.ts";
import { prisma } from "../../src/infrastructure/database/prisma.client.ts";
import { createAuction, createUser } from "../support/fixtures.ts";
import { useIsolatedDatabase } from "../support/database.ts";

useIsolatedDatabase();

describe("bid placement PostgreSQL concurrency integration", () => {
  it("serializes competing bids and only persists committed auction effects", async () => {
    const seller = await createUser({ role: "seller" });
    const firstBidder = await createUser();
    const secondBidder = await createUser();
    const auction = await createAuction(seller.user_id);
    const productId = Number(auction.product_id);

    const results = await Promise.allSettled([
      new PlaceBidUseCase().execute({ userId: firstBidder.user_id, productId, maxPriceVnd: "110", idempotencyKey: "first-bid" }),
      new PlaceBidUseCase().execute({ userId: secondBidder.user_id, productId, maxPriceVnd: "110", idempotencyKey: "second-bid" }),
    ]);

    // PostgreSQL may serialize the equal maxima before or after the competing
    // transaction observes the leader. Either one or two committed requests
    // are valid; the durable product and outbox state must match that outcome.
    const committed = results.filter((result) => result.status === "fulfilled");
    expect(committed.length).toBeGreaterThanOrEqual(1);
    expect(committed.length).toBeLessThanOrEqual(2);

    const product = await prisma.products.findUniqueOrThrow({ where: { product_id: auction.product_id } });
    const history = await prisma.bidding_history.findMany({ where: { product_id: auction.product_id } });
    const outbox = await prisma.auction_outbox.findMany({ where: { aggregate_id: String(productId) } });
    expect(product.price_owner_id).not.toBeNull();
    expect(history.length).toBeGreaterThanOrEqual(committed.length);
    expect(product.current_price).toBeGreaterThanOrEqual(100n);
    expect(product.current_price).toBeLessThanOrEqual(110n);
    expect(history.some((entry) => entry.price_owner_id === product.price_owner_id)).toBe(true);
    expect(outbox.filter((event) => event.event_type === "bid.accepted")).toHaveLength(committed.length);

    const beforeRejectedAttempt = { history: history.length, outbox: outbox.length, owner: product.price_owner_id };
    await expect(new PlaceBidUseCase().execute({ userId: firstBidder.user_id, productId, maxPriceVnd: "110", idempotencyKey: "rejected-bid" })).rejects.toThrow("Invalid bid price");
    await expect(prisma.bidding_history.count({ where: { product_id: auction.product_id } })).resolves.toBe(beforeRejectedAttempt.history);
    await expect(prisma.auction_outbox.count({ where: { aggregate_id: String(productId) } })).resolves.toBe(beforeRejectedAttempt.outbox);
    await expect(prisma.products.findUniqueOrThrow({ where: { product_id: auction.product_id } })).resolves.toMatchObject({ price_owner_id: beforeRejectedAttempt.owner });
  });
});
