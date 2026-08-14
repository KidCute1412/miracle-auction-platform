import { describe, expect, it } from "vitest";
import {
  benchmarkAuctionResetData,
  BENCHMARK_START_PRICE,
  BENCHMARK_STEP_PRICE,
  BENCHMARK_SELLER_ID,
} from "@/scripts/benchmark-fixture.ts";

describe("benchmark auction fixture", () => {
  it("resets an existing auction to the deterministic baseline", () => {
    const now = new Date("2026-08-10T05:00:00.000Z");
    const data = benchmarkAuctionResetData(now);

    expect(data).toMatchObject({
      seller_id: BENCHMARK_SELLER_ID,
      start_price: BENCHMARK_START_PRICE,
      current_price: BENCHMARK_START_PRICE,
      step_price: BENCHMARK_STEP_PRICE,
      price_owner_id: null,
      bid_turns: 0n,
      auction_status: "ACTIVE",
      auction_version: 0n,
      auction_sequence: 0n,
      auction_end_email_sent: false,
      auction_notification_enqueued_at: null,
    });
    expect(data.start_time).toEqual(new Date("2026-08-10T04:59:00.000Z"));
    expect(data.end_time).toEqual(new Date("2026-08-10T06:00:00.000Z"));
  });
});
