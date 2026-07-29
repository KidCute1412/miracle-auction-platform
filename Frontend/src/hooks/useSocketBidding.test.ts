import { describe, expect, it } from "vitest";
import type { BidSocketEvent } from "api-contracts";
import { isNewer } from "./useSocketBidding.ts";

const event = (sequence: string, version: string): BidSocketEvent => ({
  eventId: `event-${sequence}-${version}`,
  productId: "1",
  currentPriceVnd: "100",
  leaderId: "2",
  endTimeMs: "1770000000000",
  sequence,
  version,
  orderId: null,
  status: "ACTIVE",
});

describe("socket bidding ordering", () => {
  it("rejects duplicate and stale sequence/version events", () => {
    expect(isNewer(event("2", "2"), undefined)).toBe(true);
    expect(isNewer(event("2", "2"), event("2", "2"))).toBe(false);
    expect(isNewer(event("1", "99"), event("2", "2"))).toBe(false);
    expect(isNewer(event("2", "3"), event("2", "2"))).toBe(true);
    expect(isNewer(event("3", "1"), event("2", "99"))).toBe(true);
  });
});
