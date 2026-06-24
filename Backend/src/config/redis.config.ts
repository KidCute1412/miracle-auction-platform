import Redis from "ioredis";

// Create Redis client instance with host configurations
export const redisClient = new Redis(process.env.REDIS_URL || "redis://localhost:6379");
