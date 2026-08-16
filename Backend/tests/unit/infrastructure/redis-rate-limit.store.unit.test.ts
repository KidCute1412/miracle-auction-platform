import { describe, expect, it } from "vitest";
import { redisRateLimitPrefixes } from "@/infrastructure/security/redis-rate-limit.store.ts";

describe("redis rate-limit namespaces", () => {
  it("keeps global API and authentication counters isolated", () => {
    expect(redisRateLimitPrefixes.api).toBe("api-rate-limit:");
    expect(redisRateLimitPrefixes.auth).toBe("auth-rate-limit:");
    expect(redisRateLimitPrefixes.api).not.toBe(redisRateLimitPrefixes.auth);
  });
});
