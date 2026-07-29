import { describe, expect, it } from "vitest";
import {
  canonicalAuctionEventType,
  normalizeAuctionEventType,
} from "../../../src/infrastructure/events/auction-event-contract.ts";

describe("auction event contract", () => {
  it("maps every Redis event explicitly to its canonical v1 name", () => {
    expect(canonicalAuctionEventType("BID_ACCEPTED")).toBe("bid.accepted.v1");
    expect(canonicalAuctionEventType("BUY_NOW_COMPLETED")).toBe("auction.buy_now_completed.v1");
    expect(canonicalAuctionEventType("AUCTION_CLOSED")).toBe("auction.closed.v1");
    expect(canonicalAuctionEventType("AUCTION_CANCELLED")).toBe("auction.cancelled.v1");
    expect(canonicalAuctionEventType("BIDDER_BANNED")).toBe("bidder.banned.v1");
  });

  it("accepts legacy aliases only at consumer boundaries", () => {
    expect(normalizeAuctionEventType("buy.now.completed")).toBe("auction.buy_now_completed.v1");
    expect(normalizeAuctionEventType("bid.accepted")).toBe("bid.accepted.v1");
    expect(normalizeAuctionEventType("unknown.event")).toBeUndefined();
  });
});
