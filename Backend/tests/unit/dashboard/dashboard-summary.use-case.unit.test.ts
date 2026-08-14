import { describe, expect, it } from "vitest";
import { escapeCsvCell } from "../../../src/modules/dashboard/application/dashboard-summary.use-case.ts";
import { calculateRetryDelayMs, nonNegativeIntegerEnv } from "../../../src/workers/dashboard.worker.ts";
import { createEventEnvelope, parseEventEnvelope } from "../../../src/infrastructure/events/event-envelope.ts";

describe("dashboard analytics helpers", () => {
  it("prevents spreadsheet formula execution and escapes quotes", () => {
    expect(escapeCsvCell("=HYPERLINK(\"https://bad\")")).toBe("\"'=HYPERLINK(\"\"https://bad\"\")\"");
    expect(escapeCsvCell("-1+2")).toBe("\"'-1+2\"");
    expect(escapeCsvCell("safe")).toBe("\"safe\"");
  });

  it("uses bounded exponential retry delays", () => {
    expect([1, 2, 3, 8].map(calculateRetryDelayMs)).toEqual([1_000, 2_000, 4_000, 30_000]);
  });

  it("allows dashboard debounce to be explicitly disabled for benchmark batches", () => {
    expect(nonNegativeIntegerEnv("0", 15_000)).toBe(0);
    expect(nonNegativeIntegerEnv("16", 8)).toBe(16);
    expect(nonNegativeIntegerEnv("131072", 256 * 1024)).toBe(131072);
    expect(nonNegativeIntegerEnv("-1", 8)).toBe(8);
    expect(nonNegativeIntegerEnv("invalid", 8)).toBe(8);
  });

  it("round-trips the versioned event envelope", () => {
    const event = createEventEnvelope({
      eventType: "dashboard.refresh_requested.v1",
      aggregateId: "dashboard",
      payload: { source: "admin" },
    });
    expect(parseEventEnvelope(JSON.stringify(event))).toEqual(event);
  });

  it("rejects malformed event envelopes", () => {
    expect(() => parseEventEnvelope(JSON.stringify({ eventType: "bad" }))).toThrow("Invalid event field");
  });
});
