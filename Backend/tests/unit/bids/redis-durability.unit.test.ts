import { beforeEach, describe, expect, it, vi } from "vitest";

const mutationRedis = vi.hoisted(() => ({ script: vi.fn(), evalsha: vi.fn(), wait: vi.fn() }));
vi.mock("../../../src/config/redis.config.ts", () => ({
  auctionMutationRedisClient: mutationRedis,
  createAuctionMutationRedisClient: () => mutationRedis,
}));

import { getRedisMutationMetrics, RedisAuctionAuthority } from "../../../src/modules/bids/infrastructure/redis/redis-auction.authority.ts";

const success = JSON.stringify({
  status: "success",
  data: { productId: "1", currentPriceVnd: "110000", endAtMs: "1", sequence: "1", version: "1", status: "ACTIVE" },
});

describe("Redis mutation durability", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.BID_DURABILITY_REPLICAS = "1";
    process.env.BID_DURABILITY_WAIT_MS = "100";
    mutationRedis.script.mockResolvedValue("sha");
    mutationRedis.evalsha.mockResolvedValue(success);
  });

  it("returns success only after the configured replica acknowledges", async () => {
    mutationRedis.wait.mockResolvedValue(1);
    await expect(new RedisAuctionAuthority().mutate({
      operation: "BID", productId: 1, actorId: 2, actorRole: "user", amountVnd: "110000",
      idempotencyKey: "durable-1", correlationId: "correlation-1",
    })).resolves.toMatchObject({ status: "success" });
    expect(mutationRedis.wait).toHaveBeenCalledWith(1, 100);
    expect(getRedisMutationMetrics()).toMatchObject({
      samples: expect.any(Number),
      poolAcquireP95Ms: expect.any(Number),
      luaEvalP95Ms: expect.any(Number),
      totalMutationP95Ms: expect.any(Number),
      replicaAckP95Ms: expect.any(Number),
    });
  });

  it("returns a retryable 503 when replica acknowledgement is unconfirmed", async () => {
    mutationRedis.wait.mockResolvedValue(0);
    await expect(new RedisAuctionAuthority().mutate({
      operation: "BID", productId: 1, actorId: 2, actorRole: "user", amountVnd: "110000",
      idempotencyKey: "durable-2", correlationId: "correlation-2",
    })).rejects.toMatchObject({ statusCode: 503, code: "BID_DURABILITY_UNCONFIRMED" });
  });
});
