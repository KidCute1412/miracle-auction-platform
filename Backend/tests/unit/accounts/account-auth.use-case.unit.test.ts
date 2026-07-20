import { beforeEach, describe, expect, it } from "vitest";
import jwt from "jsonwebtoken";
import { generateAccessToken, generateRefreshToken } from "../../../src/modules/accounts/application/account-auth.use-case.ts";

describe("account JWT generation", () => {
  beforeEach(() => {
    process.env.JWT_SECRET = "access-secret-for-test";
    process.env.JWT_REFRESH_SECRET = "refresh-secret-for-test";
  });

  it("creates access tokens with a short expiry and pinned claims", () => {
    const token = generateAccessToken({ user_id: 7, auth_version: 3 });
    const payload = jwt.verify(token, process.env.JWT_SECRET!, { algorithms: ["HS256"], issuer: "online-auction", audience: "online-auction-api" }) as jwt.JwtPayload;
    expect(payload).toMatchObject({ user_id: 7, auth_version: 3 });
    expect((payload.exp ?? 0) - (payload.iat ?? 0)).toBe(15 * 60);
  });

  it("creates refresh tokens with unique token IDs and a session family", () => {
    const user = { user_id: 7, auth_version: 3 };
    const first = generateRefreshToken(user, true, "family-1", "token-1");
    const second = generateRefreshToken(user, true, "family-1", "token-2");
    expect(first).not.toBe(second);
    const payload = jwt.verify(first, process.env.JWT_REFRESH_SECRET!, { algorithms: ["HS256"], issuer: "online-auction", audience: "online-auction-api" }) as jwt.JwtPayload;
    expect(payload).toMatchObject({ user_id: 7, auth_version: 3, sid: "family-1", jti: "token-1", section: "long" });
    expect((payload.exp ?? 0) - (payload.iat ?? 0)).toBe(7 * 24 * 60 * 60);
  });

  it("does not accept a refresh token under the access-token secret", () => {
    const token = generateRefreshToken({ user_id: 7, auth_version: 3 }, false, "family-1", "token-1");
    expect(() => jwt.verify(token, process.env.JWT_SECRET!, { algorithms: ["HS256"] })).toThrow();
  });
});
