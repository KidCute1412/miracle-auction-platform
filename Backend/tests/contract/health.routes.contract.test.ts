import request from "supertest";
import { describe, expect, it, vi } from "vitest";
import { createApp } from "../../src/app.ts";
import { checkKafkaConnection } from "../../src/config/kafka.config.ts";
import { redisClient } from "../../src/config/redis.config.ts";

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
    vi.mocked(redisClient.get).mockResolvedValueOnce(new Date().toISOString());
    const response = await request(createApp()).get("/ready");
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: "ready",
      dependencies: { database: true, redis: true, auctionWorker: true, kafka: true },
    });
  });

  it("reports Kafka degradation without removing the API from service", async () => {
    vi.mocked(redisClient.get).mockResolvedValueOnce(new Date().toISOString());
    vi.mocked(checkKafkaConnection).mockResolvedValueOnce(false);
    const response = await request(createApp()).get("/ready");
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ status: "ready", dependencies: { kafka: false } });
  });

  it("returns 503 when the authoritative auction worker heartbeat is stale", async () => {
    vi.mocked(redisClient.get).mockResolvedValueOnce(new Date(Date.now() - 120_000).toISOString());
    const response = await request(createApp()).get("/ready");
    expect(response.status).toBe(503);
    expect(response.body).toMatchObject({
      status: "not_ready",
      dependencies: { auctionWorker: false },
    });
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
