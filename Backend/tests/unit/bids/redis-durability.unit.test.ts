import { beforeEach, describe, expect, it, vi } from "vitest";

const mutationRedis = vi.hoisted(() => ([
  { script: vi.fn(), evalsha: vi.fn(), wait: vi.fn() },
  { script: vi.fn(), evalsha: vi.fn(), wait: vi.fn() },
]));
vi.mock("../../../src/config/redis.config.ts", () => ({
  auctionMutationRedisClient: mutationRedis[0],
  auctionRedisShardForProduct: (productId: number) => productId % 2,
  createAuctionMutationRedisClientForProduct: (productId: number) => mutationRedis[productId % 2],
}));

import { getRedisMutationMetrics, RedisAuctionAuthority } from "../../../src/modules/bids/infrastructure/redis/redis-auction.authority.ts";
import { streamReceiptId } from "../../../src/modules/bids/infrastructure/redis/redis-stream.projector.ts";

const success = JSON.stringify({
  status: "success",
  data: { productId: "1", currentPriceVnd: "110000", endAtMs: "1", sequence: "1", version: "1", status: "ACTIVE" },
});

describe("Redis mutation durability", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.BID_DURABILITY_REPLICAS = "1";
    process.env.BID_DURABILITY_WAIT_MS = "100";
    for (const redis of mutationRedis) {
      redis.script.mockResolvedValue("sha");
      redis.evalsha.mockResolvedValue(success);
    }
  });

  it("returns success only after the configured replica acknowledges", async () => {
    mutationRedis[1].wait.mockResolvedValue(1);
    await expect(new RedisAuctionAuthority().mutate({
      operation: "BID", productId: 1, actorId: 2, actorRole: "user", amountVnd: "110000",
      idempotencyKey: "durable-1", correlationId: "correlation-1",
    })).resolves.toMatchObject({ status: "success" });
    expect(mutationRedis[1].wait).toHaveBeenCalledWith(1, 100);
    expect(getRedisMutationMetrics()).toMatchObject({
      samples: expect.any(Number),
      poolAcquireP95Ms: expect.any(Number),
      luaEvalP95Ms: expect.any(Number),
      totalMutationP95Ms: expect.any(Number),
      replicaAckP95Ms: expect.any(Number),
    });
  });

  it("returns a retryable 503 when replica acknowledgement is unconfirmed", async () => {
    mutationRedis[0].wait.mockResolvedValue(0);
    await expect(new RedisAuctionAuthority().mutate({
      operation: "BID", productId: 2, actorId: 2, actorRole: "user", amountVnd: "110000",
      idempotencyKey: "durable-2", correlationId: "correlation-2",
    })).rejects.toMatchObject({ statusCode: 503, code: "BID_DURABILITY_UNCONFIRMED" });
  });

  it("routes each auction and WAIT acknowledgement to its deterministic shard", async () => {
    mutationRedis[0].wait.mockResolvedValue(1);
    mutationRedis[1].wait.mockResolvedValue(1);
    const authority = new RedisAuctionAuthority();
    await authority.mutate({ operation: "BID", productId: 2, actorId: 2, actorRole: "user", amountVnd: "110000", idempotencyKey: "shard-zero", correlationId: "correlation-3" });
    await authority.mutate({ operation: "BID", productId: 3, actorId: 2, actorRole: "user", amountVnd: "110000", idempotencyKey: "shard-one", correlationId: "correlation-4" });
    expect(mutationRedis[0].evalsha).toHaveBeenCalled();
    expect(mutationRedis[1].evalsha).toHaveBeenCalled();
    expect(mutationRedis[0].wait).toHaveBeenCalledWith(1, 100);
    expect(mutationRedis[1].wait).toHaveBeenCalledWith(1, 100);
  });
});

describe("sharded projector receipts", () => {
  it("namespaces an otherwise identical Redis Stream ID by shard", () => {
    expect(streamReceiptId({ id: "1720000000000-0", shard: 0 })).toBe("shard:0:1720000000000-0");
    expect(streamReceiptId({ id: "1720000000000-0", shard: 1 })).toBe("shard:1:1720000000000-0");
  });
});
