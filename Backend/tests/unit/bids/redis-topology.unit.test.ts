import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => vi.resetModules());

describe("Redis topology configuration", () => {
  it("keeps standalone URL mode as the default", async () => {
    const { resolveRedisTopology } = await import("../../../src/config/redis-topology.ts");
    expect(resolveRedisTopology({})).toEqual({ mode: "standalone", masterName: null, sentinels: [] });
  });

  it("requires a quorum-capable Sentinel discovery list", async () => {
    const { resolveRedisTopology } = await import("../../../src/config/redis-topology.ts");
    expect(() => resolveRedisTopology({ REDIS_MODE: "sentinel", REDIS_SENTINEL_MASTER: "auction-primary" })).toThrow(/three/);
    expect(resolveRedisTopology({
      REDIS_MODE: "sentinel",
      REDIS_SENTINEL_MASTER: "auction-primary",
      REDIS_SENTINEL_NODES: "sentinel-1:26379,sentinel-2:26380,sentinel-3:26381",
    })).toEqual({
      mode: "sentinel",
      masterName: "auction-primary",
      sentinels: [
        { host: "sentinel-1", port: 26379 },
        { host: "sentinel-2", port: 26380 },
        { host: "sentinel-3", port: 26381 },
      ],
    });
  });

  it("rejects unsupported modes and malformed endpoints before connecting", async () => {
    const { resolveRedisTopology } = await import("../../../src/config/redis-topology.ts");
    expect(() => resolveRedisTopology({ REDIS_MODE: "cluster" })).toThrow(/Unsupported/);
    expect(() => resolveRedisTopology({
      REDIS_MODE: "sentinel",
      REDIS_SENTINEL_MASTER: "auction-primary",
      REDIS_SENTINEL_NODES: "one:26379,two:not-a-port,three:26379",
    })).toThrow(/Invalid Redis Sentinel node/);
  });
});
