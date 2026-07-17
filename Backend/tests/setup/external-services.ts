import { vi } from "vitest";

/**
 * Integration tests exercise Express and PostgreSQL, never real providers.
 * Keep these mocks at the process boundary so importing createApp is safe in CI.
 */
vi.mock("@/config/redis.config.ts", () => ({
  redisClient: { call: vi.fn(), status: "end", ping: vi.fn().mockResolvedValue("PONG"), quit: vi.fn() },
  checkRedisConnection: vi.fn().mockResolvedValue(true),
  closeRedisConnection: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/config/kafka.config.ts", () => ({
  kafka: {},
  initKafka: vi.fn().mockResolvedValue(true),
  checkKafkaConnection: vi.fn().mockResolvedValue(true),
  closeKafkaConnection: vi.fn().mockResolvedValue(undefined),
  publishBidEvent: vi.fn().mockResolvedValue(undefined),
  publishBidEventStrict: vi.fn().mockResolvedValue(undefined),
  publishDashboardUpdate: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("rate-limit-redis", () => ({
  default: class TestRateLimitStore {
    init() {}
    increment = vi.fn().mockResolvedValue({ totalHits: 1, resetTime: new Date(Date.now() + 60_000) });
    decrement = vi.fn().mockResolvedValue(undefined);
    resetKey = vi.fn().mockResolvedValue(undefined);
  },
}));
