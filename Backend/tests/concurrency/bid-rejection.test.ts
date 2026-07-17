import { describe, expect, it } from "vitest";
import { PlaceBidUseCase } from "../../src/modules/bids/application/place-bid.use-case.ts";
import { prisma } from "../../src/infrastructure/database/prisma.client.ts";
import { createAuction, createUser } from "../support/fixtures.ts";
import { useIsolatedDatabase } from "../support/database.ts";

useIsolatedDatabase();

describe("PostgreSQL bid concurrency", () => {
  it("serializes competing bids and only persists committed auction effects", async () => {
    const seller = await createUser({ role: "seller" });
    const firstBidder = await createUser();
    const secondBidder = await createUser();
    const auction = await createAuction(seller.user_id);
    const productId = Number(auction.product_id);

    const results = await Promise.allSettled([
      new PlaceBidUseCase().execute({ userId: firstBidder.user_id, productId, maxPrice: 110 }),
      new PlaceBidUseCase().execute({ userId: secondBidder.user_id, productId, maxPrice: 110 }),
    ]);

    // Both maxima are valid when their transactions obtain the row lock. They
    // must nevertheless converge on one durable current price and winner.
    expect(results.filter((result) => result.status === "fulfilled")).toHaveLength(2);

    const product = await prisma.products.findUniqueOrThrow({ where: { product_id: auction.product_id } });
    const history = await prisma.bidding_history.findMany({ where: { product_id: auction.product_id } });
    const outbox = await prisma.auction_outbox.findMany({ where: { aggregate_id: String(productId) } });
    expect(product.current_price).toBe(110);
    expect(product.price_owner_id).not.toBeNull();
    // The proxy algorithm records both the challenger and the retained leader
    // on the competing transaction, so three audit rows are expected.
    expect(history).toHaveLength(3);
    expect(history.at(-1)?.price_owner_id).toBe(product.price_owner_id);
    expect(outbox.filter((event) => event.event_type === "bid.accepted")).toHaveLength(2);

    const beforeRejectedAttempt = { history: history.length, outbox: outbox.length, owner: product.price_owner_id };
    await expect(new PlaceBidUseCase().execute({ userId: firstBidder.user_id, productId, maxPrice: 110 })).rejects.toThrow("Invalid bid price");
    await expect(prisma.bidding_history.count({ where: { product_id: auction.product_id } })).resolves.toBe(beforeRejectedAttempt.history);
    await expect(prisma.auction_outbox.count({ where: { aggregate_id: String(productId) } })).resolves.toBe(beforeRejectedAttempt.outbox);
    await expect(prisma.products.findUniqueOrThrow({ where: { product_id: auction.product_id } })).resolves.toMatchObject({ price_owner_id: beforeRejectedAttempt.owner });
  });
});
