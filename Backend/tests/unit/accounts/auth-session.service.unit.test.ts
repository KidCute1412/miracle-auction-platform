import { beforeEach, describe, expect, it, vi } from "vitest";

const redis = vi.hoisted(() => {
  const exec = vi.fn().mockResolvedValue([]);
  const chain: { exec: typeof exec; set?: ReturnType<typeof vi.fn> } = { exec };
  const set = vi.fn().mockReturnValue(chain);
  chain.set = set;
  const multi = vi.fn().mockReturnValue(chain);
  return { exec, set, multi, evalCommand: vi.fn() };
});
vi.mock("@/config/redis.config.ts", () => ({ redisClient: { multi: redis.multi, eval: redis.evalCommand } }));

import { consumeRefreshSession, createRefreshSession, persistRefreshSession, revokeRefreshSession } from "../../../src/modules/accounts/application/auth-session.service.ts";

describe("refresh session service", () => {
  beforeEach(() => vi.clearAllMocks());

  it("creates a session family with unique token IDs", () => {
    const first = createRefreshSession(1, 2, true, "family");
    const second = createRefreshSession(1, 2, true, "family");
    expect(first).toMatchObject({ userId: 1, authVersion: 2, rememberMe: true, sessionId: "family" });
    expect(first.tokenId).not.toBe(second.tokenId);
  });

  it("persists both family and token with the expected TTL", async () => {
    await persistRefreshSession({ userId: 1, authVersion: 2, rememberMe: false, sessionId: "family", tokenId: "token" });
    expect(redis.multi).toHaveBeenCalledOnce(); expect(redis.set).toHaveBeenCalledTimes(2); expect(redis.exec).toHaveBeenCalledOnce();
    expect(redis.set).toHaveBeenCalledWith("auth:session:family", "active", "EX", 86400);
  });

  it.each(["active", "reused", "revoked"] as const)("returns Redis consume state %s", async (state) => {
    redis.evalCommand.mockResolvedValueOnce(state);
    await expect(consumeRefreshSession("family", "token")).resolves.toBe(state);
  });

  it("revokes a token family with or without a token ID", async () => {
    redis.evalCommand.mockResolvedValue(undefined);
    await revokeRefreshSession("family", "token"); await revokeRefreshSession("family");
    expect(redis.evalCommand).toHaveBeenNthCalledWith(1, expect.any(String), 2, "auth:session:family", "auth:refresh:token");
    expect(redis.evalCommand).toHaveBeenNthCalledWith(2, expect.any(String), 2, "auth:session:family", "");
  });
});
