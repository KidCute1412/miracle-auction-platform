import { describe, expect, it } from "vitest";
import { formatAuctionDuration, getAuctionClock } from "./auction_time";

const now = Date.parse("2026-07-30T12:00:00.000Z");

describe("auction clock", () => {
  it("keeps bidding unavailable before the start time", () => {
    expect(getAuctionClock(
      "2026-07-30T12:01:00.000Z",
      "2026-07-30T13:00:00.000Z",
      now,
    )).toEqual({ phase: "PENDING", targetTimeMs: now + 60_000, remainingMs: 60_000 });
  });

  it("makes bidding available only inside the auction window", () => {
    expect(getAuctionClock(
      "2026-07-30T11:00:00.000Z",
      "2026-07-30T13:00:00.000Z",
      now,
    ).phase).toBe("ACTIVE");
    expect(getAuctionClock(
      "2026-07-30T10:00:00.000Z",
      "2026-07-30T12:00:00.000Z",
      now,
    ).phase).toBe("ENDED");
  });

  it("formats a stable countdown", () => {
    expect(formatAuctionDuration(3_661_000)).toBe("1h 1m");
    expect(formatAuctionDuration(-1)).toBe("0m 0s");
  });
});
