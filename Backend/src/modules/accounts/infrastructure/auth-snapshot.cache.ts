import type { Redis } from "ioredis";
import { authRedisClient } from "@/config/redis.config.ts";
import { createComponentLogger, safeError } from "@/infrastructure/observability/logger.ts";

const log = createComponentLogger("auth-snapshot.cache");
const TTL_SECONDS = Number(process.env.AUTH_SNAPSHOT_TTL_SECONDS ?? 30);
const LOCAL_TTL_MS = () => Math.max(0, Number(process.env.AUTH_SNAPSHOT_LOCAL_TTL_MS ?? 2_000));
const INVALIDATION_CHANNEL = "auth:v1:invalidate";
const WRITE_IF_CURRENT = `
local current = redis.call('HGET', KEYS[1], 'authVersion')
local incoming = tonumber(ARGV[3])
if current and tonumber(current) > incoming then return 0 end
redis.call('HSET', KEYS[1], 'role', ARGV[1], 'status', ARGV[2], 'authVersion', ARGV[3])
redis.call('EXPIRE', KEYS[1], ARGV[4])
return 1
`;

export interface AuthPrincipal {
  user_id: number;
  role: string;
  status: string;
  auth_version: number;
}

export interface AuthSnapshotMetrics {
  hits: number;
  misses: number;
  localHits: number;
  localMisses: number;
  redisHits: number;
  redisMisses: number;
  dbFallbacks: number;
  redisFailures: number;
  cacheReadP95Ms: number;
  localReadP95Ms: number;
  redisReadP95Ms: number;
  dbFallbackP95Ms: number;
}

const metrics = { localHits: 0, localMisses: 0, redisHits: 0, redisMisses: 0, dbFallbacks: 0, redisFailures: 0 };
const localSnapshots = new Map<number, { principal: AuthPrincipal; expiresAt: number }>();
const localReadLatencyMs: number[] = [];
const cacheReadLatencyMs: number[] = [];
const dbFallbackLatencyMs: number[] = [];
let invalidationSubscriber: Redis | undefined;
export const authSnapshotKey = (userId: number): string => `auth:v1:user:${userId}`;

function recordSample(samples: number[], value: number): void {
  samples.push(value);
  if (samples.length > 1_000) samples.shift();
}

function percentile95(samples: readonly number[]): number {
  const ordered = [...samples].sort((left, right) => left - right);
  return ordered[Math.max(0, Math.ceil(ordered.length * 0.95) - 1)] ?? 0;
}

function parseSnapshot(userId: number, values: Array<string | null>): AuthPrincipal | null {
  const [role, status, versionValue] = values;
  const authVersion = Number(versionValue);
  if (!role || !status || !Number.isSafeInteger(authVersion) || authVersion < 0) return null;
  return { user_id: userId, role, status, auth_version: authVersion };
}

function localSnapshot(userId: number): AuthPrincipal | null {
  const startedAt = performance.now();
  const entry = localSnapshots.get(userId);
  const principal = entry && entry.expiresAt > Date.now() ? entry.principal : null;
  if (entry && !principal) localSnapshots.delete(userId);
  recordSample(localReadLatencyMs, performance.now() - startedAt);
  if (principal) metrics.localHits += 1;
  else metrics.localMisses += 1;
  return principal;
}

function rememberLocalSnapshot(principal: AuthPrincipal): void {
  const ttlMs = LOCAL_TTL_MS();
  if (ttlMs <= 0) return;
  localSnapshots.set(principal.user_id, { principal, expiresAt: Date.now() + ttlMs });
}

export function invalidateLocalAuthSnapshot(userId: number): void {
  localSnapshots.delete(userId);
}

export async function readAuthSnapshot(userId: number, client: Redis = authRedisClient): Promise<AuthPrincipal | null> {
  const startedAt = performance.now();
  const snapshot = parseSnapshot(userId, await client.hmget(authSnapshotKey(userId), "role", "status", "authVersion"));
  recordSample(cacheReadLatencyMs, performance.now() - startedAt);
  if (snapshot) metrics.redisHits += 1;
  else metrics.redisMisses += 1;
  return snapshot;
}

export async function writeAuthSnapshot(principal: AuthPrincipal, client: Redis = authRedisClient): Promise<boolean> {
  const result = await client.eval(
    WRITE_IF_CURRENT,
    1,
    authSnapshotKey(principal.user_id),
    principal.role,
    principal.status,
    String(principal.auth_version),
    String(TTL_SECONDS),
  );
  return Number(result) === 1;
}

export async function writeAuthSnapshotBestEffort(principal: AuthPrincipal): Promise<void> {
  try {
    await writeAuthSnapshot(principal);
  } catch (error) {
    metrics.redisFailures += 1;
    log.warn({ err: safeError(error), userId: principal.user_id }, "Auth snapshot write-through unavailable");
  }
}

async function publishInvalidation(principal: AuthPrincipal): Promise<void> {
  try {
    await authRedisClient.publish(INVALIDATION_CHANNEL, JSON.stringify({ userId: principal.user_id, authVersion: principal.auth_version }));
  } catch (error) {
    metrics.redisFailures += 1;
    log.warn({ err: safeError(error), userId: principal.user_id }, "Auth snapshot invalidation publish unavailable");
  }
}

/** Refreshes the shared snapshot and evicts local snapshots after an access-changing write. */
export async function invalidateAuthSnapshotBestEffort(principal: AuthPrincipal): Promise<void> {
  invalidateLocalAuthSnapshot(principal.user_id);
  await writeAuthSnapshotBestEffort(principal);
  await publishInvalidation(principal);
}

export async function startAuthSnapshotInvalidationSubscriber(): Promise<void> {
  if (invalidationSubscriber) return;
  const subscriber = authRedisClient.duplicate();
  subscriber.on("error", (error: Error) => log.warn({ err: safeError(error) }, "Auth snapshot invalidation subscriber unavailable"));
  subscriber.on("message", (channel: string, payload: string) => {
    if (channel !== INVALIDATION_CHANNEL) return;
    try {
      const message: unknown = JSON.parse(payload);
      if (!message || typeof message !== "object" || !Number.isSafeInteger((message as { userId?: unknown }).userId)) return;
      invalidateLocalAuthSnapshot((message as { userId: number }).userId);
    } catch {
      log.warn("Ignored malformed auth snapshot invalidation");
    }
  });
  try {
    await subscriber.subscribe(INVALIDATION_CHANNEL);
    invalidationSubscriber = subscriber;
  } catch (error) {
    subscriber.disconnect();
    log.warn({ err: safeError(error) }, "Auth snapshot invalidation subscription unavailable; local TTL remains the safety bound");
  }
}

export async function stopAuthSnapshotInvalidationSubscriber(): Promise<void> {
  const subscriber = invalidationSubscriber;
  invalidationSubscriber = undefined;
  if (subscriber && subscriber.status !== "end") await subscriber.quit();
}

export async function resolveAuthPrincipal(
  userId: number,
  databaseLookup: (id: number) => Promise<AuthPrincipal | null>,
): Promise<AuthPrincipal | null> {
  const local = localSnapshot(userId);
  if (local) return local;
  try {
    const cached = await readAuthSnapshot(userId);
    if (cached) {
      rememberLocalSnapshot(cached);
      return cached;
    }
  } catch (error) {
    metrics.redisFailures += 1;
    log.warn({ err: safeError(error), userId }, "Auth snapshot read unavailable; using database fallback");
  }
  metrics.dbFallbacks += 1;
  const fallbackStartedAt = performance.now();
  const principal = await databaseLookup(userId);
  recordSample(dbFallbackLatencyMs, performance.now() - fallbackStartedAt);
  if (principal) {
    await writeAuthSnapshotBestEffort(principal);
    rememberLocalSnapshot(principal);
  }
  return principal;
}

export function getAuthSnapshotMetrics(): AuthSnapshotMetrics {
  return {
    hits: metrics.redisHits,
    misses: metrics.redisMisses,
    ...metrics,
    cacheReadP95Ms: percentile95(cacheReadLatencyMs),
    localReadP95Ms: percentile95(localReadLatencyMs),
    redisReadP95Ms: percentile95(cacheReadLatencyMs),
    dbFallbackP95Ms: percentile95(dbFallbackLatencyMs),
  };
}
