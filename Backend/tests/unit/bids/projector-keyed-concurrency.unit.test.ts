import { describe, expect, it } from "vitest";
import { runKeyedLanes } from "../../../src/modules/bids/infrastructure/redis/redis-stream.projector.ts";

describe("projector keyed concurrency", () => {
  it("preserves order within an auction while processing auctions concurrently", async () => {
    const events = [
      { productId: "1", sequence: 1 }, { productId: "2", sequence: 1 },
      { productId: "1", sequence: 2 }, { productId: "2", sequence: 2 },
    ];
    const observed = new Map<string, number[]>();
    let active = 0;
    let maximumActive = 0;
    await runKeyedLanes(events, (event) => event.productId, async (event) => {
      active += 1;
      maximumActive = Math.max(maximumActive, active);
      await new Promise((resolve) => setTimeout(resolve, 5));
      observed.set(event.productId, [...(observed.get(event.productId) ?? []), event.sequence]);
      active -= 1;
    }, 2);
    expect(observed.get("1")).toEqual([1, 2]);
    expect(observed.get("2")).toEqual([1, 2]);
    expect(maximumActive).toBe(2);
  });
});
