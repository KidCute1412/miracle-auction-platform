import request from "supertest";
import { describe, expect, it, vi } from "vitest";
import { createApp } from "../../src/app.ts";
import { checkKafkaConnection } from "../../src/config/kafka.config.ts";

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
    const response = await request(createApp()).get("/ready");
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "ready", dependencies: { database: true, redis: true, kafka: true } });
  });

  it("returns 503 when a required dependency is unavailable", async () => {
    vi.mocked(checkKafkaConnection).mockResolvedValueOnce(false);
    const response = await request(createApp()).get("/ready");
    expect(response.status).toBe(503);
    expect(response.body).toMatchObject({ status: "not_ready", dependencies: { kafka: false } });
  });
});
