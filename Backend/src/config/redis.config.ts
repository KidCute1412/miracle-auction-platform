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

const managedAuctionMutationClients = new Set<Redis>([auctionMutationRedisClient]);

export function createAuctionMutationRedisClient(): Redis {
  const client = auctionMutationRedisClient.duplicate();
  client.on("error", (error: Error) => log.error({ err: error }, "Auction mutation Redis pool connection error"));
  managedAuctionMutationClients.add(client);
  return client;
}

redisClient.on("error", (error: Error) => log.error({ err: error }, "Redis connection error"));
authRedisClient.on("error", (error: Error) => log.error({ err: error }, "Auth Redis connection error"));
auctionMutationRedisClient.on("error", (error: Error) => log.error({ err: error }, "Auction mutation Redis connection error"));
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
}

export async function checkRedisDurability(): Promise<RedisDurabilityReadiness> {
  const replicasRequired = Number(process.env.BID_DURABILITY_REPLICAS ?? 0);
  try {
    const info = await auctionMutationRedisClient.info("replication");
    const role = /^role:(\w+)$/m.exec(info)?.[1];
    const replicasConnected = Number(/^connected_slaves:(\d+)$/m.exec(info)?.[1] ?? 0);
    const primary = role === "master";
    return {
      primary,
      replicasConnected,
      replicasRequired,
      mode: replicasRequired > 0 ? "replica-ack" : "primary-only",
      ready: primary && replicasConnected >= replicasRequired,
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
  const clients = new Set([redisClient, authRedisClient, ...managedAuctionMutationClients]);
  await Promise.all(
    [...clients].map(async (client) => {
      if (client.status !== "end") await client.quit();
    }),
  );
}
