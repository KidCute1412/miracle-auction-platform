import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../../src/app.ts";

describe("route contract: infrastructure", () => {
  it("serves the public health contract without requiring frontend or dependencies", async () => {
    const response = await request(createApp()).get("/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "ok" });
  });
});
