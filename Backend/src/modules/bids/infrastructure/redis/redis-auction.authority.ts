import { createComponentLogger } from "@/infrastructure/observability/logger.ts";

const log = createComponentLogger("redis-auction.authority");

import { createHash, randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import type { Redis } from "ioredis";
import { auctionMutationRedisClient, auctionRedisShardForProduct, createAuctionMutationRedisClientForProduct } from "@/config/redis.config.ts";
import { BidDomainError, BidDurabilityUnconfirmedError, BidInfrastructureError } from "../../domain/bid.errors.ts";
import { parseMoneyVnd } from "../../domain/money.ts";
import { mutationKeys, redisAuctionKeys } from "./redis-auction.keys.ts";
import type { AuctionMutationCommand, AuctionMutationResult } from "./redis-auction.types.ts";

const SCRIPT_URL = new URL("./auction-mutate.lua", import.meta.url);
const scriptShas = new WeakMap<Redis, string>();
const mutationLatencyMs: number[] = [];
const poolAcquireLatencyMs: number[] = [];
const luaEvalLatencyMs: number[] = [];
const replicaAckLatencyMs: number[] = [];
let durabilityUnconfirmed = 0;
let indeterminateMutations = 0;

interface MutationLease {
  client: Redis;
  release: () => void;
}

interface MutationPoolEntry {
  client: Redis;
  busy: boolean;
}

const mutationPools = new Map<number, MutationPoolEntry[]>([[0, [{ client: auctionMutationRedisClient, busy: false }]]]);
const mutationWaiters = new Map<number, Array<(lease: MutationLease) => void>>();

function mutationPoolSize(): number {
  const configured = Number(process.env.BID_MUTATION_CONNECTIONS ?? 8);
  return Number.isInteger(configured) && configured > 0 ? Math.min(configured, 64) : 8;
}

function poolFor(shard: number): MutationPoolEntry[] {
  let pool = mutationPools.get(shard);
  if (!pool) {
    pool = [{ client: createAuctionMutationRedisClientForProduct(shard), busy: false }];
    mutationPools.set(shard, pool);
  }
  return pool;
}

function ensureMutationPool(shard: number, productId: number): void {
  const pool = poolFor(shard);
  while (pool.length < mutationPoolSize()) {
    pool.push({ client: createAuctionMutationRedisClientForProduct(productId), busy: false });
  }
}

function leaseEntry(entry: MutationPoolEntry, shard: number): MutationLease {
  entry.busy = true;
  return {
    client: entry.client,
    release: () => {
      const waiters = mutationWaiters.get(shard) ?? [];
      const waiter = waiters.shift();
      if (waiter) {
        waiter(leaseEntry(entry, shard));
        return;
      }
      entry.busy = false;
    },
  };
}

async function acquireMutationClient(productId: number): Promise<MutationLease> {
  const shard = auctionRedisShardForProduct(productId);
  ensureMutationPool(shard, productId);
  const available = poolFor(shard).find((entry) => !entry.busy);
  if (available) return leaseEntry(available, shard);
  return new Promise((resolve) => {
    const waiters = mutationWaiters.get(shard) ?? [];
    waiters.push(resolve);
    mutationWaiters.set(shard, waiters);
  });
}

function recordSample(samples: number[], value: number): void {
  samples.push(value);
  if (samples.length > 1_000) samples.shift();
}

function percentile95(samples: readonly number[]): number {
  const ordered = [...samples].sort((left, right) => left - right);
  return ordered[Math.max(0, Math.ceil(ordered.length * 0.95) - 1)] ?? 0;
}

export function getRedisMutationMetrics() {
  return {
    samples: mutationLatencyMs.length,
    poolAcquireP95Ms: percentile95(poolAcquireLatencyMs),
    luaEvalP95Ms: percentile95(luaEvalLatencyMs),
    totalMutationP95Ms: percentile95(mutationLatencyMs),
    // Compatibility for existing readiness consumers.
    mutationP95Ms: percentile95(mutationLatencyMs),
    replicaAckP95Ms: percentile95(replicaAckLatencyMs),
    durabilityUnconfirmed,
    indeterminateMutations,
  };
}

function fingerprint(command: AuctionMutationCommand): string {
  return [
    command.operation,
    command.productId,
    command.actorId,
    command.amountVnd ?? "",
    command.targetUserId ?? "",
    command.reason ?? "",
  ].join(":");
}

function idempotencyDigest(command: AuctionMutationCommand): string {
  return createHash("sha256").update(command.idempotencyKey).digest("hex");
}

function isIndeterminateScriptError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return /OOM|Error running script|ERR Error running script/i.test(message);
}

async function loadScript(client: Redis): Promise<string> {
  const source = await readFile(SCRIPT_URL, "utf8");
  const scriptSha = (await client.script("LOAD", source)) as string;
  scriptShas.set(client, scriptSha);
  return scriptSha;
}

async function evaluate(client: Redis, keys: string[], payload: string): Promise<unknown> {
  const sha = scriptShas.get(client) ?? (await loadScript(client));
  try {
    return await client.evalsha(sha, keys.length, ...keys, payload);
  } catch (error) {
    if (error instanceof Error && error.message.includes("NOSCRIPT")) {
      return client.evalsha(await loadScript(client), keys.length, ...keys, payload);
    }
    throw error;
  }
}

export class RedisAuctionAuthority {
  async mutate(command: AuctionMutationCommand): Promise<Extract<AuctionMutationResult, { status: "success" }>> {
    const mutationStartedAt = performance.now();
    if (!command.idempotencyKey || command.idempotencyKey.length > 255) {
      throw new BidDomainError("A valid idempotency key is required", 400, "IDEMPOTENCY_KEY_REQUIRED");
    }
    if (command.amountVnd !== undefined) parseMoneyVnd(command.amountVnd);
    const eventId = randomUUID();
    const orderId =
      command.orderId ?? (command.operation === "BUY_NOW" || command.operation === "CLOSE" ? randomUUID() : undefined);
    const payload = JSON.stringify({
      ...command,
      eventId,
      orderId,
      nowMs: (command.now ?? new Date()).getTime().toString(),
      fingerprint: fingerprint(command),
      rateLimit: Number(process.env.BID_RATE_LIMIT ?? 30),
      rateWindowMs: Number(process.env.BID_RATE_WINDOW_MS ?? 10_000),
      idempotencyTtlMs: Number(process.env.BID_IDEMPOTENCY_TTL_MS ?? 86_400_000),
    });

    const poolAcquireStartedAt = performance.now();
    const lease = await acquireMutationClient(command.productId);
    recordSample(poolAcquireLatencyMs, performance.now() - poolAcquireStartedAt);
    let raw: unknown;
    try {
      const luaEvalStartedAt = performance.now();
      raw = await evaluate(
        lease.client,
        mutationKeys(command.productId, command.actorId, idempotencyDigest(command)),
        payload,
      );
      recordSample(luaEvalLatencyMs, performance.now() - luaEvalStartedAt);
    } catch (error) {
      lease.release();
      if (isIndeterminateScriptError(error)) indeterminateMutations += 1;
      log.error("[BIDDING] Redis authority failure", error);
      throw new BidInfrastructureError();
    }
    if (typeof raw !== "string") {
      lease.release();
      throw new BidInfrastructureError("Bidding authority returned an invalid result");
    }

    let result: AuctionMutationResult;
    try {
      result = JSON.parse(raw) as AuctionMutationResult;
    } catch {
      lease.release();
      throw new BidInfrastructureError("Bidding authority returned malformed JSON");
    }
    if (result.status === "error") {
      lease.release();
      if (result.code === "AUCTION_STATE_NOT_READY") {
        throw new BidDomainError(result.message, result.statusCode, result.code);
      }
      if (result.statusCode >= 500) throw new BidInfrastructureError(result.message);
      throw new BidDomainError(result.message, result.statusCode, result.code);
    }
    const replicas = Number(process.env.BID_DURABILITY_REPLICAS ?? 0);
    if (replicas > 0) {
      const timeoutMs = Number(process.env.BID_DURABILITY_WAIT_MS ?? 100);
      const probeTtlMs = Number(process.env.BID_DURABILITY_PROBE_TTL_MS ?? 10_000);
      const waitStartedAt = performance.now();
      let acknowledged: number;
      try {
        await lease.client.set(redisAuctionKeys.durabilityProbe(eventId), "1", "PX", probeTtlMs);
        acknowledged = await lease.client.wait(replicas, timeoutMs);
      } finally {
        lease.release();
      }
      recordSample(replicaAckLatencyMs, performance.now() - waitStartedAt);
      if (acknowledged < replicas) {
        durabilityUnconfirmed += 1;
        throw new BidDurabilityUnconfirmedError(result.data);
      }
    } else {
      lease.release();
    }
    recordSample(mutationLatencyMs, performance.now() - mutationStartedAt);
    return result;
  }
}

export const redisAuctionAuthority = new RedisAuctionAuthority();
