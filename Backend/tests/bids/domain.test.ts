import { describe, expect, it } from "vitest";
import { assertBidAmount, assertBidderCanParticipate } from "../../src/modules/bids/domain/auction.policy.ts";
import { BidDomainError } from "../../src/modules/bids/domain/bid.errors.ts";
import { calculateProxyBid } from "../../src/modules/bids/domain/proxy-bid.policy.ts";

const auction = {
  productId: 1, sellerId: 10, currentPrice: 100, startPrice: 100, stepPrice: 10,
  priceOwnerId: null, buyNowPrice: 500, startTime: new Date("2020-01-01"), endTime: new Date("2030-01-01"), isRemoved: false,
};

describe("bid domain policies", () => {
  it("rejects a bid below the next valid step", () => {
    expect(() => assertBidAmount(auction, 105)).toThrow(BidDomainError);
  });
  it("rejects the seller", () => {
    expect(() => assertBidderCanParticipate(auction, 10, { rating: 5, ratingCount: 1, banned: false })).toThrow("Seller cannot bid");
  });
  it("keeps the existing leader when an incoming maximum is lower", () => {
    expect(calculateProxyBid(auction, { userId: 2, maxPrice: 130 }, { userId: 3, maxPrice: 150 })).toMatchObject({ currentPrice: 140, priceOwnerId: 3 });
  });
});
