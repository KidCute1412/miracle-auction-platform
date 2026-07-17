import { describe, expect, it } from "vitest";
import { assertBidAmount } from "../../src/modules/bids/domain/auction.policy.ts";

describe("bid rejection invariant", () => {
  it("does not accept a stale amount during competing submissions", () => {
    const auction = {
      productId: 1, sellerId: 2, currentPrice: 100, startPrice: 100, stepPrice: 10,
      priceOwnerId: 3, buyNowPrice: null, startTime: new Date("2020-01-01"), endTime: new Date("2030-01-01"), isRemoved: false,
    };

    expect(() => assertBidAmount(auction, 100)).toThrow();
  });
});
