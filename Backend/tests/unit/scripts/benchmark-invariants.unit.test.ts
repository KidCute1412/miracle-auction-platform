import { describe, expect, it } from "vitest";
import { calculateConsumerLag, isDownstreamViolation, pipelineConverged } from "../../../src/scripts/check-bidding-invariants.ts";

describe("benchmark invariant helpers", () => {
  it("sums consumer lag across topics and treats an uncommitted partition as offset zero", () => {
    expect(calculateConsumerLag(
      [
        { topic: "bidding_events", partitions: [{ partition: 0, high: "10" }, { partition: 1, high: "7" }] },
        { topic: "domain_events", partitions: [{ partition: 0, high: "4" }] },
      ],
      [
        { topic: "bidding_events", partitions: [{ partition: 0, offset: "8" }, { partition: 1, offset: "-1" }] },
        { topic: "domain_events", partitions: [{ partition: 0, offset: "4" }] },
      ],
      true,
    )).toBe(9);
  });

  it("treats an uncommitted partition as caught up when the consumer starts at the latest offset", () => {
    expect(calculateConsumerLag(
      [{ topic: "dashboard_updates", partitions: [{ partition: 0, high: "2" }] }],
      [{ topic: "dashboard_updates", partitions: [{ partition: 0, offset: "-1" }] }],
      false,
    )).toBe(0);
  });

  it("never reports negative lag when a committed offset is ahead of the observed high watermark", () => {
    expect(calculateConsumerLag(
      [{ topic: "bidding_events", partitions: [{ partition: 0, high: "10" }] }],
      [{ topic: "bidding_events", partitions: [{ partition: 0, offset: "12" }] }],
      true,
    )).toBe(0);
  });

  it("classifies Kafka freshness separately from bidding core invariants", () => {
    expect(isDownstreamViolation({ invariant: "Kafka consumer lag converged", details: {} })).toBe(true);
    expect(isDownstreamViolation({ invariant: "snapshot matches transition sequence", details: {} })).toBe(false);
  });

  it("does not require a Redis Stream when checking the PostgreSQL pessimistic-lock baseline", () => {
    const health = {
      streamPending: null,
      streamLag: null,
      outboxPending: 0,
      dashboardConsumerLag: 0,
      notificationConsumerLag: 0,
    };
    expect(pipelineConverged(health, false)).toBe(true);
    expect(pipelineConverged({ ...health, streamPending: 1 }, true)).toBe(false);
  });
});
