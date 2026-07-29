import { describe, expect, it } from "vitest";
import {
  outboxRetryDelayMs,
  validateRelayRow,
} from "../../../src/infrastructure/events/outbox-relay.worker.ts";

const validRow = {
  id: 1n,
  event_id: "00000000-0000-4000-a000-000000000001",
  event_type: "bid.accepted.v1",
  event_version: 1,
  aggregate_id: "42",
  payload: { currentPriceVnd: "100" },
  topic: "bidding_events",
  correlation_id: "00000000-0000-4000-a000-000000000002",
  causation_id: null,
  occurred_at: new Date(),
  attempts: 0,
} as Parameters<typeof validateRelayRow>[0];

describe("outbox relay policy", () => {
  it("classifies valid and terminal rows before Kafka batching", () => {
    expect(validateRelayRow(validRow)).toBeUndefined();
    expect(validateRelayRow({ ...validRow, topic: "typo_topic" })).toContain("Unsupported");
    expect(validateRelayRow({ ...validRow, event_type: "BUY_NOW_COMPLETED" })).toContain("Invalid event type");
  });

  it("uses bounded exponential retry without dropping rows", () => {
    expect(outboxRetryDelayMs(1, 300_000)).toBe(1_000);
    expect(outboxRetryDelayMs(3, 300_000)).toBe(4_000);
    expect(outboxRetryDelayMs(50, 300_000)).toBe(300_000);
  });
});
