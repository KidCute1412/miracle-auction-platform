import express from "express";
import jwt from "jsonwebtoken";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const authCache = vi.hoisted(() => ({ resolveAuthPrincipal: vi.fn() }));
vi.mock("../../../src/modules/accounts/infrastructure/auth-snapshot.cache.ts", () => authCache);
vi.mock("../../../src/modules/accounts/infrastructure/account.repository.ts", () => ({
  accountRepository: { findAuthPrincipalById: vi.fn() },
}));

import { verifyToken } from "../../../src/middlewares/auth.middleware.ts";
import type { AccountRequest } from "../../../src/interfaces/request.interface.ts";

describe("auth snapshot middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.JWT_SECRET = "unit-test-auth-secret";
  });

  function token(authVersion: number): string {
    return jwt.sign({ user_id: 7, auth_version: authVersion }, process.env.JWT_SECRET!, {
      algorithm: "HS256", issuer: "online-auction", audience: "online-auction-api",
    });
  }

  function app() {
    const instance = express();
    instance.use((req, _res, next) => { req.cookies = { accessToken: req.header("x-test-token") }; next(); });
    instance.get("/private", verifyToken, (req, res) => res.json({ user: (req as AccountRequest).user }));
    return instance;
  }

  it("attaches only the minimum principal for a valid snapshot", async () => {
    authCache.resolveAuthPrincipal.mockResolvedValue({ user_id: 7, role: "user", status: "active", auth_version: 2 });
    const response = await request(app()).get("/private").set("x-test-token", token(2));
    expect(response.status).toBe(200);
    expect(response.body.user).toEqual({ user_id: 7, role: "user", status: "active", auth_version: 2 });
  });

  it("rejects a token immediately when the snapshot auth version has advanced", async () => {
    authCache.resolveAuthPrincipal.mockResolvedValue({ user_id: 7, role: "user", status: "active", auth_version: 3 });
    await request(app()).get("/private").set("x-test-token", token(2)).expect(401);
  });
});
