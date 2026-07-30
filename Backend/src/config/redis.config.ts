import { Redis } from "ioredis";
import { redisOptions } from "./redis-options.ts";
import { getLogger, safeError } from "@/infrastructure/observability/logger.ts";

const log = getLogger({ component: "redis" });

// Keep reconnecting after transient Redis or Docker restarts. Individual commands
// remain bounded by maxRetriesPerRequest and commandTimeout.
export const redisClient = new Redis(process.env.REDIS_URL || "redis://localhost:16379", redisOptions);

redisClient.on("error", (error: Error) => log.error({ err: error }, "Redis connection error"));
export async function checkRedisConnection(): Promise<boolean> {
  try {
    return (await redisClient.ping()) === "PONG";
  } catch (error) {
    log.error({ err: safeError(error) }, "Redis connection check failed");
    return false;
  }
}

export async function closeRedisConnection(): Promise<void> {
  if (redisClient.status !== "end") {
    await redisClient.quit();
  }
}
