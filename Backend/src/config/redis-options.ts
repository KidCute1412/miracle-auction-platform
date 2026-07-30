import type { RedisOptions } from "ioredis";

export function redisReconnectDelay(attempt: number): number {
  return Math.min(attempt * 100, 3_000);
}

export const redisOptions: RedisOptions = {
  maxRetriesPerRequest: 3,
  connectTimeout: 5_000,
  retryStrategy: redisReconnectDelay,
};
