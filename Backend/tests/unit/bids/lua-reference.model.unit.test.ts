import { describe, expect, it } from "vitest";
import { decideLuaReferenceBid } from "../../../src/modules/bids/domain/lua-reference.model.ts";
import { calculateProxyBid } from "../../../src/modules/bids/domain/proxy-bid.policy.ts";

const auction = {
  productId: 1,
  sellerId: 9,
  currentPrice: 100n,
  startPrice: 100n,
  stepPrice: 10n,
  priceOwnerId: 2,
  buyNowPrice: null,
  startTime: new Date(0),
  endTime: new Date(4_000_000_000_000),
  isRemoved: false,
  status: "ACTIVE" as const,
  version: 0n,
  sequence: 0n,
};

describe("Lua bid reference model", () => {
  it("matches proxy bidding across a deterministic property matrix", () => {
    for (let leaderMaximum = 110n; leaderMaximum <= 1_000n; leaderMaximum += 10n) {
      for (let incomingMaximum = 110n; incomingMaximum <= 1_000n; incomingMaximum += 10n) {
        const proxy = calculateProxyBid(
          auction,
          { userId: 3, maxPrice: incomingMaximum },
          { userId: 2, maxPrice: leaderMaximum },
        );
        const reference = decideLuaReferenceBid({
          currentPriceVnd: auction.currentPrice,
          stepPriceVnd: auction.stepPrice,
          leaderId: 2,
          leaderMaxPriceVnd: leaderMaximum,
        }, 3, incomingMaximum);
        expect(reference.currentPriceVnd).toBe(proxy.currentPrice);
        expect(reference.leaderId).toBe(proxy.priceOwnerId);
      }
    }
  });

  it("keeps exact values above JavaScript's safe integer limit", () => {
    const result = decideLuaReferenceBid({
      currentPriceVnd: 9_007_199_254_740_992n,
      stepPriceVnd: 10n,
      leaderId: 2,
      leaderMaxPriceVnd: 9_007_199_254_741_100n,
    }, 3, 9_007_199_254_741_200n);
    expect(result.currentPriceVnd).toBe(9_007_199_254_741_110n);
  });
});
