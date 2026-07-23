import "dotenv/config";
import { redisClient } from "@/config/redis.config.ts";
import { prisma } from "@/infrastructure/database/prisma.client.ts";
import { bootstrapRedisAuction } from "@/modules/bids/infrastructure/redis/redis-auction.bootstrap.ts";

const AUCTION_IDS = Array.from({ length: 20 }, (_, index) => BigInt(index + 1));
const BIDDER_IDS = Array.from({ length: 200 }, (_, index) => index + 2);

async function assertBenchmarkDatabase(): Promise<void> {
  if (process.env.NODE_ENV !== "benchmark") throw new Error("NODE_ENV=benchmark is required");
  const [row] = await prisma.$queryRaw<Array<{ current_database: string }>>`SELECT current_database()`;
  if (row?.current_database !== "online_auction_test" && row?.current_database !== "online_auction_benchmark_test") {
    throw new Error(`Refusing to seed database '${row?.current_database ?? "unknown"}'`);
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
      where: { user_id: 1 },
      create: {
        user_id: 1, username: "benchmark-seller", full_name: "Benchmark Seller",
        email: "benchmark-seller@example.test", role: "seller", status: "active",
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
        seller_id: 1n,
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
        auction_status: "ACTIVE",
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
  console.log(JSON.stringify({ users: BIDDER_IDS.length, auctions: AUCTION_IDS.length, startPriceVnd: "100000", stepPriceVnd: "10000" }));
}

main()
  .finally(async () => Promise.allSettled([prisma.$disconnect(), redisClient.quit()]))
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  });
