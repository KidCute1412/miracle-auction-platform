import express from "express";
import request from "supertest";
import { describe, expect, it, vi } from "vitest";
import { currentLogContext } from "../../../src/infrastructure/observability/logger.ts";
import { requestId } from "../../../src/middlewares/request-id.middleware.ts";
import { createRequestLogger } from "../../../src/middlewares/request-logger.middleware.ts";

describe("request observability middleware", () => {
  it("preserves a valid request ID and exposes it as correlation context", async () => {
    const app = express();
    app.use(requestId);
    app.get("/context", (req, res) => {
      res.json({ requestId: req.requestId, context: currentLogContext() });
    });
    const id = "5fdf0726-ecbb-45f1-8559-e07751f8a725";

    const response = await request(app).get("/context").set("X-Request-ID", id);

    expect(response.headers["x-request-id"]).toBe(id);
    expect(response.body).toEqual({
      requestId: id,
      context: { requestId: id, correlationId: id },
    });
  });

  it("replaces invalid IDs and records one safe HTTP completion", async () => {
    const info = vi.fn();
    const app = express();
    app.use(requestId);
    app.use(createRequestLogger({ info }));
    app.get("/items", (req, res) => res.json({ requestId: req.requestId }));

    const response = await request(app).get("/items?token=must-not-be-logged").set("X-Request-ID", "invalid");

    expect(response.headers["x-request-id"]).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
    expect(info).toHaveBeenCalledOnce();
    expect(info).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "GET",
        path: "/items",
        statusCode: 200,
        durationMs: expect.any(Number),
      }),
      "HTTP request completed",
    );
    expect(JSON.stringify(info.mock.calls)).not.toContain("must-not-be-logged");
  });

  it("suppresses successful probes but logs failed probes", async () => {
    const info = vi.fn();
    const app = express();
    app.use(requestId);
    app.use(createRequestLogger({ info }));
    app.get("/health", (_req, res) => res.sendStatus(200));
    app.get("/ready", (_req, res) => res.sendStatus(503));

    await request(app).get("/health");
    await request(app).get("/ready");

    expect(info).toHaveBeenCalledOnce();
    expect(info).toHaveBeenCalledWith(
      expect.objectContaining({
        path: "/ready",
        statusCode: 503,
      }),
      "HTTP request completed",
    );
  });
});
