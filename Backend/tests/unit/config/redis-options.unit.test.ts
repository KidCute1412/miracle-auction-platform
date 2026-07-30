import { describe, expect, it } from "vitest";
import { redisOptions, redisReconnectDelay } from "../../../src/config/redis-options.ts";

describe("Redis resilience options", () => {
  it("continues reconnecting with a capped backoff after a long outage", () => {
    expect(redisReconnectDelay(1)).toBe(100);
    expect(redisReconnectDelay(20)).toBe(2_000);
    expect(redisReconnectDelay(21)).toBe(2_100);
    expect(redisReconnectDelay(100)).toBe(3_000);
  });

  it("bounds each command while allowing the connection to recover", () => {
    expect(redisOptions.maxRetriesPerRequest).toBe(3);
    expect(redisOptions.connectTimeout).toBe(5_000);
    expect(redisOptions.retryStrategy).toBe(redisReconnectDelay);
  });
});
