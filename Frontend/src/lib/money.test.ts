import { describe, expect, it } from "vitest";
import { formatVnd, moneyBigInt } from "./money";

describe("money helpers", () => {
  it("normalizes empty money values to zero", () => {
    expect(moneyBigInt(undefined)).toBe(0n);
    expect(moneyBigInt("")).toBe(0n);
  });

  it("drops decimal fractions before creating a bigint", () => {
    expect(moneyBigInt("1250.99")).toBe(1250n);
    expect(moneyBigInt(1250.99)).toBe(1250n);
  });

  it("preserves bigint values", () => {
    expect(moneyBigInt(9_007_199_254_740_993n)).toBe(9_007_199_254_740_993n);
  });

  it("formats number and bigint values with separators", () => {
    expect(formatVnd(1250000)).toBe("1,250,000");
    expect(formatVnd(9_007_199_254_740_993n)).toBe("9,007,199,254,740,993");
  });

  it("preserves non-numeric display values", () => {
    expect(formatVnd("unavailable")).toBe("unavailable");
  });
});
