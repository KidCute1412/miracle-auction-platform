import { Redis } from "ioredis";
import { redisOptions } from "./redis-options.ts";
import { getLogger, safeError } from "@/infrastructure/observability/logger.ts";

const log = getLogger({ component: "redis" });

// Keep reconnecting after transient Redis or Docker restarts. Individual commands
// remain bounded by maxRetriesPerRequest and commandTimeout.
export const redisClient = new Redis(process.env.REDIS_URL || "redis://localhost:16379", redisOptions);
export const authRedisClient = new Redis(process.env.AUTH_REDIS_URL || process.env.REDIS_URL || "redis://localhost:16379", redisOptions);
export const auctionMutationRedisClient = new Redis(
  process.env.AUCTION_REDIS_URL || process.env.REDIS_URL || "redis://localhost:16379",
  redisOptions,
);

/**
 * Benchmark-only auction authority shards.  The regular runtime keeps the
 * single AUCTION_REDIS_URL client above; setting AUCTION_REDIS_URLS opt-in
 * routes an auction deterministically to one of these primaries.
 */
const auctionShardUrls = (process.env.AUCTION_REDIS_URLS ?? "")
  .split(",")
  .map((url) => url.trim())
  .filter(Boolean);
export const auctionMutationRedisClients: Redis[] = auctionShardUrls.length > 0
  ? auctionShardUrls.map((url) => new Redis(url, redisOptions))
  : [auctionMutationRedisClient];
export const auctionRedisShardCount = auctionMutationRedisClients.length;

export function auctionRedisShardForProduct(productId: number): number {
  if (!Number.isSafeInteger(productId) || productId < 0) throw new Error("productId must be a non-negative safe integer");
  return productId % auctionRedisShardCount;
}

export function auctionRedisClientForProduct(productId: number): Redis {
  return auctionMutationRedisClients[auctionRedisShardForProduct(productId)]!;
}

export function getAuctionRedisClients(): readonly Redis[] {
  return auctionMutationRedisClients;
}

const managedAuctionMutationClients = new Set<Redis>([auctionMutationRedisClient]);

export function createAuctionMutationRedisClient(): Redis {
  const client = auctionMutationRedisClient.duplicate();
  client.on("error", (error: Error) => log.error({ err: error }, "Auction mutation Redis pool connection error"));
  managedAuctionMutationClients.add(client);
  return client;
}

export function createAuctionMutationRedisClientForProduct(productId: number): Redis {
  const client = auctionRedisClientForProduct(productId).duplicate();
  client.on("error", (error: Error) => log.error({ err: error }, "Auction mutation Redis pool connection error"));
  managedAuctionMutationClients.add(client);
  return client;
}

redisClient.on("error", (error: Error) => log.error({ err: error }, "Redis connection error"));
authRedisClient.on("error", (error: Error) => log.error({ err: error }, "Auth Redis connection error"));
auctionMutationRedisClient.on("error", (error: Error) => log.error({ err: error }, "Auction mutation Redis connection error"));
for (const client of auctionMutationRedisClients) {
  if (client !== auctionMutationRedisClient) client.on("error", (error: Error) => log.error({ err: error }, "Auction shard Redis connection error"));
}
export async function checkRedisConnection(): Promise<boolean> {
  try {
    return (await redisClient.ping()) === "PONG";
  } catch (error) {
    log.error({ err: safeError(error) }, "Redis connection check failed");
    return false;
  }
}

export interface RedisDurabilityReadiness {
  primary: boolean;
  replicasConnected: number;
  replicasRequired: number;
  mode: "primary-only" | "replica-ack";
  ready: boolean;
  shards?: Array<{ shard: number; primary: boolean; replicasConnected: number; ready: boolean }>;
}

export async function checkRedisDurability(): Promise<RedisDurabilityReadiness> {
  const replicasRequired = Number(process.env.BID_DURABILITY_REPLICAS ?? 0);
  try {
    const shards = await Promise.all(auctionMutationRedisClients.map(async (client, shard) => {
      const info = await client.info("replication");
      const primary = /^role:(\w+)$/m.exec(info)?.[1] === "master";
      const replicasConnected = Number(/^connected_slaves:(\d+)$/m.exec(info)?.[1] ?? 0);
      return { shard, primary, replicasConnected, ready: primary && replicasConnected >= replicasRequired };
    }));
    const first = shards[0]!;
    return {
      primary: first.primary,
      replicasConnected: first.replicasConnected,
      replicasRequired,
      mode: replicasRequired > 0 ? "replica-ack" : "primary-only",
      ready: shards.every((shard) => shard.ready),
      shards,
    };
  } catch {
    return {
      primary: false,
      replicasConnected: 0,
      replicasRequired,
      mode: replicasRequired > 0 ? "replica-ack" : "primary-only",
      ready: false,
    };
  }
}

export async function closeRedisConnection(): Promise<void> {
  const clients = new Set([redisClient, authRedisClient, ...auctionMutationRedisClients, ...managedAuctionMutationClients]);
  await Promise.all(
    [...clients].map(async (client) => {
      if (client.status !== "end") await client.quit();
    }),
  );
}
