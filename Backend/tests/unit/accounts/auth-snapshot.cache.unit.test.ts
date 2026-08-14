import { beforeEach, describe, expect, it, vi } from "vitest";

const subscriberListeners = vi.hoisted(() => new Map<string, (...args: string[]) => void>());
const subscriber = vi.hoisted(() => ({
  status: "ready",
  on: vi.fn((event: string, handler: (...args: string[]) => void) => subscriberListeners.set(event, handler)),
  subscribe: vi.fn().mockResolvedValue(1),
  quit: vi.fn().mockResolvedValue("OK"),
  disconnect: vi.fn(),
}));
const redis = vi.hoisted(() => ({ hmget: vi.fn(), eval: vi.fn(), publish: vi.fn(), duplicate: vi.fn(() => subscriber) }));
vi.mock("../../../src/config/redis.config.ts", () => ({ authRedisClient: redis }));

import {
  authSnapshotKey,
  invalidateLocalAuthSnapshot,
  readAuthSnapshot,
  resolveAuthPrincipal,
  startAuthSnapshotInvalidationSubscriber,
  stopAuthSnapshotInvalidationSubscriber,
  writeAuthSnapshot,
} from "../../../src/modules/accounts/infrastructure/auth-snapshot.cache.ts";

describe("auth snapshot cache", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    subscriberListeners.clear();
    process.env.AUTH_SNAPSHOT_LOCAL_TTL_MS = "2000";
  });

  it("uses a versioned, user-scoped key and parses a valid snapshot", async () => {
    redis.hmget.mockResolvedValue(["seller", "active", "7"]);
    await expect(readAuthSnapshot(42)).resolves.toEqual({ user_id: 42, role: "seller", status: "active", auth_version: 7 });
    expect(redis.hmget).toHaveBeenCalledWith(authSnapshotKey(42), "role", "status", "authVersion");
  });

  it("falls back to the database on a miss and writes through", async () => {
    redis.hmget.mockResolvedValue([null, null, null]);
    redis.eval.mockResolvedValue(1);
    const lookup = vi.fn().mockResolvedValue({ user_id: 9, role: "user", status: "active", auth_version: 3 });
    await expect(resolveAuthPrincipal(9, lookup)).resolves.toMatchObject({ user_id: 9, auth_version: 3 });
    expect(lookup).toHaveBeenCalledWith(9);
    expect(redis.eval).toHaveBeenCalled();
  });

  it("serves a short-lived local hit without another Redis read and evicts it explicitly", async () => {
    redis.hmget.mockResolvedValue(["user", "active", "3"]);
    const lookup = vi.fn();
    await expect(resolveAuthPrincipal(77, lookup)).resolves.toMatchObject({ user_id: 77 });
    await expect(resolveAuthPrincipal(77, lookup)).resolves.toMatchObject({ user_id: 77 });
    expect(redis.hmget).toHaveBeenCalledTimes(1);

    invalidateLocalAuthSnapshot(77);
    await expect(resolveAuthPrincipal(77, lookup)).resolves.toMatchObject({ user_id: 77 });
    expect(redis.hmget).toHaveBeenCalledTimes(2);
  });

  it("evicts a local principal when another API process publishes an invalidation", async () => {
    redis.hmget.mockResolvedValue(["user", "active", "5"]);
    await resolveAuthPrincipal(78, vi.fn());
    await startAuthSnapshotInvalidationSubscriber();
    subscriberListeners.get("message")?.("auth:v1:invalidate", JSON.stringify({ userId: 78, authVersion: 6 }));
    await resolveAuthPrincipal(78, vi.fn());
    expect(redis.hmget).toHaveBeenCalledTimes(2);
    await stopAuthSnapshotInvalidationSubscriber();
  });

  it("passes the auth version to the Lua fence and reports stale rejection", async () => {
    redis.eval.mockResolvedValue(0);
    await expect(writeAuthSnapshot({ user_id: 2, role: "admin", status: "active", auth_version: 4 })).resolves.toBe(false);
    expect(redis.eval.mock.calls[0]).toContain("4");
  });
});
