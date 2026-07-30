import crypto from "crypto";
import cookieParser from "cookie-parser";
import express from "express";
import request from "supertest";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { csrfProtection, issueCsrfToken } from "../../../src/middlewares/csrf.middleware.ts";

const csrfCookie = (token: string) => `csrfToken=${token}`;
const extractCookie = (response: request.Response) => {
  const setCookie = response.headers["set-cookie"];
  if (!setCookie?.[0]) throw new Error("Expected the response to set a CSRF cookie");
  return setCookie[0].split(";")[0];
};

function createCsrfApp() {
  const app = express();
  app.use(cookieParser());
  app.get("/csrf", (req, res) => res.json({ token: issueCsrfToken(req, res) }));
  app.post("/protected", csrfProtection, (_req, res) => res.status(204).end());
  return app;
}

describe("CSRF token recovery", () => {
  const originalSecret = process.env.CSRF_SECRET;
  const originalClientUrl = process.env.CLIENT_URL;

  beforeEach(() => {
    process.env.CSRF_SECRET = "current-csrf-secret";
    process.env.CLIENT_URL = "http://localhost:5173";
  });

  afterEach(() => {
    if (originalSecret === undefined) delete process.env.CSRF_SECRET;
    else process.env.CSRF_SECRET = originalSecret;
    if (originalClientUrl === undefined) delete process.env.CLIENT_URL;
    else process.env.CLIENT_URL = originalClientUrl;
  });

  it("reuses an existing token only when its signature is valid", async () => {
    const app = createCsrfApp();
    const issued = await request(app).get("/csrf");
    const cookie = extractCookie(issued);
    const existingToken = issued.body.token as string;

    const reused = await request(app).get("/csrf").set("Cookie", cookie);

    expect(reused.status).toBe(200);
    expect(reused.body.token).toBe(existingToken);
    expect(reused.headers["set-cookie"]).toBeUndefined();
  });

  it.each([
    ["malformed", "not-a-signed-token"],
    [
      "signed with an old secret",
      `stale-token.${crypto.createHmac("sha256", "old-csrf-secret").update("stale-token").digest("base64url")}`,
    ],
  ])("automatically replaces a %s cookie", async (_case, staleToken) => {
    const app = createCsrfApp();
    const refreshed = await request(app).get("/csrf").set("Cookie", csrfCookie(staleToken));
    const freshToken = refreshed.body.token as string;
    const freshCookie = extractCookie(refreshed);

    expect(refreshed.status).toBe(200);
    expect(freshToken).not.toBe(staleToken);
    expect(freshCookie).toBe(csrfCookie(freshToken));

    const protectedResponse = await request(app)
      .post("/protected")
      .set("Origin", process.env.CLIENT_URL!)
      .set("Cookie", freshCookie)
      .set("X-CSRF-Token", freshToken);

    expect(protectedResponse.status).toBe(204);
  });

  it.each([
    ["missing header", undefined, undefined],
    ["cookie/header mismatch", "different-token", undefined],
    ["incorrect origin", undefined, "http://localhost:4173"],
  ])("still rejects a request with %s", async (_case, headerOverride, originOverride) => {
    const app = createCsrfApp();
    const issued = await request(app).get("/csrf");
    const token = issued.body.token as string;
    const protectedRequest = request(app)
      .post("/protected")
      .set("Origin", originOverride ?? process.env.CLIENT_URL!)
      .set("Cookie", extractCookie(issued));
    if (_case !== "missing header") protectedRequest.set("X-CSRF-Token", headerOverride ?? token);

    const response = await protectedRequest;

    expect(response.status).toBe(403);
    expect(response.body).toEqual({ code: "error", message: "Invalid CSRF token" });
  });
});
