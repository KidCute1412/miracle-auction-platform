import RedisStore from "rate-limit-redis";
import { redisClient } from "@/config/redis.config.ts";

export const redisRateLimitPrefixes = {
  api: "api-rate-limit:",
  auth: "auth-rate-limit:",
} as const;

export function createRedisRateLimitStore(prefix: string): RedisStore {
  return new RedisStore({
    prefix,
    sendCommand: async (...args: string[]) => {
      try {
        return (await redisClient.call(args[0], ...args.slice(1))) as never;
      } catch {
        return undefined as never;
      }
    },
  });
}
