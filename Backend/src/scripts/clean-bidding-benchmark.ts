import { createComponentLogger } from "@/infrastructure/observability/logger.ts";

const log = createComponentLogger("clean-bidding-benchmark");

import "dotenv/config";
import { closeRedisConnection, getAuctionRedisClients, redisClient } from "@/config/redis.config.ts";
import { prisma } from "@/infrastructure/database/prisma.client.ts";

async function assertBenchmarkEnvironment(): Promise<void> {
  if (process.env.NODE_ENV !== "benchmark") throw new Error("NODE_ENV=benchmark is required");
  const [row] = await prisma.$queryRaw<Array<{ current_database: string }>>`SELECT current_database()`;
  const database = row?.current_database ?? "unknown";
  const expectedDatabase = process.env.BENCHMARK_DATABASE_NAME ?? "online_auction_benchmark";
  if (database !== expectedDatabase) {
    throw new Error(`Refusing to clean database '${database}'. Expected '${expectedDatabase}'.`);
  }
  const redisDatabase = Number(redisClient.options.db ?? 0);
  if (redisDatabase <= 0 && process.env.BENCHMARK_ISOLATED !== "true") {
    throw new Error("Refusing to flush Redis DB 0 outside an isolated benchmark stack");
  }
}

async function main(): Promise<void> {
  await assertBenchmarkEnvironment();
  const benchmarkProducts = await prisma.products.findMany({
    where: {
      OR: [{ product_name: { startsWith: "Benchmark Auction" } }, { product_id: { gte: 900000n } }],
    },
    select: { product_id: true },
  });
  const productIds = benchmarkProducts.map((p) => p.product_id);

  const benchmarkUsers = await prisma.users.findMany({
    where: {
      OR: [{ username: { startsWith: "benchmark-" } }, { user_id: { gte: 900000 } }],
    },
    select: { user_id: true },
  });
  const userIds = benchmarkUsers.map((u) => u.user_id);

  log.info(`Cleaning up ${productIds.length} benchmark products and ${userIds.length} benchmark users...`);

  await prisma.$transaction(async (tx) => {
    if (productIds.length > 0) {
      await tx.auction_outbox.deleteMany({ where: { aggregate_id: { in: productIds.map(String) } } });
      await tx.auction_processed_events.deleteMany({ where: { product_id: { in: productIds } } });
      await tx.auction_transitions.deleteMany({ where: { product_id: { in: productIds } } });
      await tx.orders.deleteMany({ where: { product_id: { in: productIds } } });
      await tx.bidding_history.deleteMany({ where: { product_id: { in: productIds } } });
      await tx.bidding_ban_user.deleteMany({ where: { product_id: { in: productIds } } });
      await tx.products.deleteMany({ where: { product_id: { in: productIds } } });
    }

    if (userIds.length > 0) {
      await tx.bid_idempotency.deleteMany({ where: { user_id: { in: userIds } } });
      await tx.users.deleteMany({ where: { user_id: { in: userIds } } });
    }
  });

  const database = Number(redisClient.options.db ?? 0);
  await Promise.all(getAuctionRedisClients().map((client) => client.flushdb()));
  log.info(`Flushed Redis DB ${database}`);

  log.info("Cleanup completed successfully.");
}

main()
  .finally(async () => Promise.allSettled([prisma.$disconnect(), closeRedisConnection()]))
  .catch((error: unknown) => {
    log.error("Cleanup error:", error);
    process.exitCode = 1;
  });
