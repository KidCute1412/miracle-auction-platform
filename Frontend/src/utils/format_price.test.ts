import { describe, expect, it } from "vitest";
import { formatPrice, parsePrice } from "./format_price";

describe("legacy price helpers", () => {
  it("formats whole-number prices with dot separators", () => {
    expect(formatPrice(1250000)).toBe("1.250.000");
  });

  it("returns an empty value when no price is supplied", () => {
    expect(formatPrice()).toBe("");
  });

  it("parses formatted prices and rejects missing input", () => {
    expect(parsePrice("1.250.000")).toBe(1250000);
    expect(parsePrice()).toBeNull();
  });
});
