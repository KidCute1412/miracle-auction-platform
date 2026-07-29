import { describe, expect, it } from "vitest";
import { escapeCsvCell } from "../../../src/modules/dashboard/application/dashboard-summary.use-case.ts";
import { calculateRetryDelayMs } from "../../../src/workers/dashboard.worker.ts";
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
