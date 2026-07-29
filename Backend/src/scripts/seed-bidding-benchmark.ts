import "dotenv/config";
import { redisClient } from "@/config/redis.config.ts";
import { prisma } from "@/infrastructure/database/prisma.client.ts";
import { bootstrapRedisAuction } from "@/modules/bids/infrastructure/redis/redis-auction.bootstrap.ts";

export const BENCHMARK_START_ID = Number(process.env.BENCHMARK_START_ID || 900001);
export const BENCHMARK_AUCTION_COUNT = Number(process.env.BENCHMARK_AUCTION_COUNT || 100);
export const BENCHMARK_BIDDER_COUNT = Number(process.env.BENCHMARK_BIDDER_COUNT || 500);
export const BENCHMARK_SELLER_ID = 900000n;

const AUCTION_IDS = Array.from({ length: BENCHMARK_AUCTION_COUNT }, (_, index) => BigInt(BENCHMARK_START_ID + index));
const BIDDER_IDS = Array.from({ length: BENCHMARK_BIDDER_COUNT }, (_, index) => BENCHMARK_START_ID + index);

async function assertBenchmarkDatabase(): Promise<void> {
  if (process.env.NODE_ENV !== "benchmark") throw new Error("NODE_ENV=benchmark is required");
  const [row] = await prisma.$queryRaw<Array<{ current_database: string }>>`SELECT current_database()`;
  const dbName = row?.current_database ?? "unknown";
  if (dbName !== "online_auction_benchmark_test" && process.env.ALLOW_DEV_BENCHMARK_SEED !== "true") {
    throw new Error(
      `Refusing to seed database '${dbName}'. Benchmark seeding must run against 'online_auction_benchmark_test' or set ALLOW_DEV_BENCHMARK_SEED=true.`
    );
  }
}

async function clearRedisAuctionKeys(): Promise<void> {
  const database = Number(redisClient.options.db ?? 0);
  if (database <= 0) throw new Error("Benchmark seeding requires a dedicated non-zero Redis logical database");
  await redisClient.flushdb();
}

async function main(): Promise<void> {
  await assertBenchmarkDatabase();
  await prisma.$transaction(async (tx) => {
    await tx.auction_outbox.deleteMany({ where: { aggregate_id: { in: AUCTION_IDS.map(String) } } });
    await tx.auction_processed_events.deleteMany({ where: { product_id: { in: AUCTION_IDS } } });
    await tx.auction_transitions.deleteMany({ where: { product_id: { in: AUCTION_IDS } } });
    await tx.orders.deleteMany({ where: { product_id: { in: AUCTION_IDS } } });
    await tx.bidding_history.deleteMany({ where: { product_id: { in: AUCTION_IDS } } });
    await tx.bidding_ban_user.deleteMany({ where: { product_id: { in: AUCTION_IDS } } });
    await tx.bid_idempotency.deleteMany({ where: { user_id: { in: BIDDER_IDS } } });

    await tx.users.upsert({
      where: { user_id: Number(BENCHMARK_SELLER_ID) },
      create: {
        user_id: Number(BENCHMARK_SELLER_ID),
        username: "benchmark-seller",
        full_name: "Benchmark Seller",
        email: "benchmark-seller@example.test",
        role: "seller",
        status: "active",
      },
      update: { role: "seller", status: "active", auth_version: 0 },
    });
    for (const userId of BIDDER_IDS) {
      await tx.users.upsert({
        where: { user_id: userId },
        create: {
          user_id: userId,
          username: `benchmark-bidder-${userId}`,
          full_name: `Benchmark Bidder ${userId}`,
          email: `benchmark-bidder-${userId}@example.test`,
          role: "user",
          status: "active",
          rating: 5,
          rating_count: 1,
        },
        update: { status: "active", auth_version: 0, rating: 5, rating_count: 1 },
      });
    }

    for (const productId of AUCTION_IDS) {
      const data = {
        product_name: `Benchmark Auction ${productId}`,
        seller_id: BENCHMARK_SELLER_ID,
        start_price: 100_000n,
        current_price: 100_000n,
        step_price: 10_000n,
        buy_now_price: null,
        price_owner_id: null,
        bid_turns: 0n,
        start_time: new Date(Date.now() - 60_000),
        end_time: new Date(Date.now() + 60 * 60_000),
        product_images: [],
        is_removed: false,
        auto_extended: false,
        auction_status: "ACTIVE" as const,
        auction_version: 0n,
        auction_sequence: 0n,
        auction_end_email_sent: false,
      };
      await tx.products.upsert({
        where: { product_id: productId },
        create: { product_id: productId, ...data },
        update: data,
      });
    }
  });
  await clearRedisAuctionKeys();
  for (const productId of AUCTION_IDS) await bootstrapRedisAuction(Number(productId));
  console.log(
    JSON.stringify({
      users: BIDDER_IDS.length,
      auctions: AUCTION_IDS.length,
      startId: BENCHMARK_START_ID,
      startPriceVnd: "100000",
      stepPriceVnd: "10000",
    })
  );
}

main()
  .finally(async () => Promise.allSettled([prisma.$disconnect(), redisClient.quit()]))
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  });

