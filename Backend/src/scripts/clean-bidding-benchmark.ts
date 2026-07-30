import { createComponentLogger } from "@/infrastructure/observability/logger.ts";

const log = createComponentLogger("clean-bidding-benchmark");

import "dotenv/config";
import { redisClient } from "@/config/redis.config.ts";
import { prisma } from "@/infrastructure/database/prisma.client.ts";

async function main(): Promise<void> {
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
  if (database > 0) {
    await redisClient.flushdb();
    log.info(`Flushed Redis DB ${database}`);
  }

  log.info("Cleanup completed successfully.");
}

main()
  .finally(async () => Promise.allSettled([prisma.$disconnect(), redisClient.quit()]))
  .catch((error: unknown) => {
    log.error("Cleanup error:", error);
    process.exitCode = 1;
  });
