import { Redis } from "ioredis";
import { redisOptions } from "./redis-options.ts";

// Keep reconnecting after transient Redis or Docker restarts. Individual commands
// remain bounded by maxRetriesPerRequest and commandTimeout.
export const redisClient = new Redis(
  process.env.REDIS_URL || "redis://localhost:16379",
  redisOptions,
);

redisClient.on("error", (error: Error) => console.error("[REDIS] Connection error:", error.message));
export async function checkRedisConnection(): Promise<boolean> {
  try { return (await redisClient.ping()) === "PONG"; }
  catch (error) { console.error("[REDIS] Connection check failed:", error); return false; }
}

export async function closeRedisConnection(): Promise<void> {
  if (redisClient.status !== "end") {
    await redisClient.quit();
  }
}
