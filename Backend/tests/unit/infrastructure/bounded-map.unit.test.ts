import { describe, expect, it } from "vitest";
import { mapWithConcurrency } from "../../../src/infrastructure/concurrency/bounded-map.ts";

describe("mapWithConcurrency", () => {
  it("preserves input order while bounding active work", async () => {
    let active = 0;
    let maximum = 0;
    const result = await mapWithConcurrency([1, 2, 3, 4], 2, async (value) => {
      active += 1;
      maximum = Math.max(maximum, active);
      await new Promise((resolve) => setTimeout(resolve, value === 1 ? 10 : 1));
      active -= 1;
      return value * 2;
    });

    expect(result).toEqual([2, 4, 6, 8]);
    expect(maximum).toBeLessThanOrEqual(2);
  });

  it("returns an empty result without invoking the mapper", async () => {
    let calls = 0;
    expect(await mapWithConcurrency([], 4, async () => { calls += 1; return calls; })).toEqual([]);
    expect(calls).toBe(0);
  });
});
