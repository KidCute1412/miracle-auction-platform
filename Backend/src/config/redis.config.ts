import { Redis } from "ioredis";

// Create Redis client instance with bounded retries to prevent infinite reconnect loops when host is unreachable
export const redisClient = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    if (times > 20) {
      return null; // Stop retrying after 20 attempts
    }
    return Math.min(times * 100, 3000);
  },
});

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
