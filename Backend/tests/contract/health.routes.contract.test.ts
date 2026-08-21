import request from "supertest";
import { describe, expect, it, vi } from "vitest";
import { createApp } from "../../src/app.ts";
import { checkKafkaConnection } from "../../src/config/kafka.config.ts";
import { checkRedisDurability, redisClient } from "../../src/config/redis.config.ts";

vi.mock("../../src/infrastructure/database/prisma.client.ts", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../src/infrastructure/database/prisma.client.ts")>();
  return { ...actual, checkPrismaConnection: vi.fn().mockResolvedValue(true) };
});

describe("health and readiness route contract", () => {
  it("serves the public health contract without requiring frontend or dependencies", async () => {
    const response = await request(createApp()).get("/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "ok" });
  });

  it("reports readiness when all dependencies are available", async () => {
    vi.mocked(checkRedisDurability).mockResolvedValueOnce({ primary: true, replicasConnected: 1, replicasRequired: 1, mode: "replica-ack", ready: true });
    vi.mocked(redisClient.get).mockResolvedValueOnce(new Date().toISOString());
    const response = await request(createApp()).get("/ready");
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: "ready",
      dependencies: {
        database: true,
        redis: true,
        redisDurability: { primary: true, replicasConnected: 1, replicasRequired: 1, mode: "replica-ack", ready: true },
        auctionWorker: true,
        auctionAuthority: true,
        kafka: true,
      },
      metrics: {
        authSnapshot: {
          hits: 0,
          misses: 0,
          localHits: 0,
          localMisses: 0,
          redisHits: 0,
          redisMisses: 0,
          dbFallbacks: 0,
          redisFailures: 0,
          cacheReadP95Ms: 0,
          localReadP95Ms: 0,
          redisReadP95Ms: 0,
          dbFallbackP95Ms: 0,
        },
        redisMutation: {
          samples: 0,
          poolAcquireP95Ms: 0,
          luaEvalP95Ms: 0,
          totalMutationP95Ms: 0,
          mutationP95Ms: 0,
          replicaAckP95Ms: 0,
          durabilityUnconfirmed: 0,
          indeterminateMutations: 0,
        },
        auctionAuthorityRecovery: { state: "disabled", ready: true },
      },
    });
  });

  it("reports Kafka degradation without removing the API from service", async () => {
    vi.mocked(checkRedisDurability).mockResolvedValueOnce({ primary: true, replicasConnected: 1, replicasRequired: 1, mode: "replica-ack", ready: true });
    vi.mocked(redisClient.get).mockResolvedValueOnce(new Date().toISOString());
    vi.mocked(checkKafkaConnection).mockResolvedValueOnce(false);
    const response = await request(createApp()).get("/ready");
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ status: "ready", dependencies: { kafka: false } });
  });

  it("returns 503 when the authoritative auction worker heartbeat is stale", async () => {
    vi.mocked(checkRedisDurability).mockResolvedValueOnce({ primary: true, replicasConnected: 1, replicasRequired: 1, mode: "replica-ack", ready: true });
    vi.mocked(redisClient.get).mockResolvedValueOnce(new Date(Date.now() - 120_000).toISOString());
    const response = await request(createApp()).get("/ready");
    expect(response.status).toBe(503);
    expect(response.body).toMatchObject({
      status: "not_ready",
      dependencies: { auctionWorker: false },
    });
  });

  it("returns 503 when the configured Redis replica is unavailable", async () => {
    vi.mocked(checkRedisDurability).mockResolvedValueOnce({ primary: true, replicasConnected: 0, replicasRequired: 1, mode: "replica-ack", ready: false });
    vi.mocked(redisClient.get).mockResolvedValueOnce(new Date().toISOString());
    const response = await request(createApp()).get("/ready");
    expect(response.status).toBe(503);
    expect(response.body.dependencies.redisDurability).toMatchObject({ ready: false, replicasConnected: 0 });
  });

  it("returns 503 while automatic auction authority recovery is fenced", async () => {
    vi.stubEnv("AUCTION_AUTO_RECOVERY_ENABLED", "true");
    vi.mocked(checkRedisDurability).mockResolvedValueOnce({ primary: true, replicasConnected: 1, replicasRequired: 1, mode: "replica-ack", ready: true });
    vi.mocked(redisClient.get)
      .mockResolvedValueOnce(new Date().toISOString())
      .mockResolvedValueOnce(JSON.stringify({ state: "recovering", ready: false, recoveryEpoch: "4" }));
    const response = await request(createApp()).get("/ready");
    expect(response.status).toBe(503);
    expect(response.body).toMatchObject({
      status: "not_ready",
      dependencies: { auctionAuthority: false },
      metrics: { auctionAuthorityRecovery: { state: "recovering", recoveryEpoch: "4" } },
    });
    vi.unstubAllEnvs();
  });
});

describe("CSRF bootstrap route contract", () => {
  it("never returns a cached 304 response for a conditional token request", async () => {
    const app = createApp();
    const first = await request(app).get("/accounts/csrf");
    const second = await request(app)
      .get("/accounts/csrf")
      .set("If-None-Match", first.headers.etag as string);

    expect(first.status).toBe(200);
    expect(second.status).toBe(200);
    expect(second.headers["cache-control"]).toContain("no-store");
    expect(second.headers["set-cookie"]).toBeDefined();
    expect(second.body.token).toEqual(expect.any(String));
  });
});
