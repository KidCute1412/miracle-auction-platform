import { createComponentLogger } from "@/infrastructure/observability/logger.ts";

const log = createComponentLogger("seed-bidding-benchmark");

import "dotenv/config";
import { authRedisClient, closeRedisConnection, redisClient } from "@/config/redis.config.ts";
import { prisma } from "@/infrastructure/database/prisma.client.ts";
import { bootstrapRedisAuction } from "@/modules/bids/infrastructure/redis/redis-auction.bootstrap.ts";
import { writeFile } from "node:fs/promises";
import {
  BENCHMARK_SELLER_ID,
  benchmarkAuctionResetData,
} from "./benchmark-fixture.ts";

export const BENCHMARK_START_ID = Number(process.env.BENCHMARK_START_ID || 900001);
export const BENCHMARK_AUCTION_COUNT = Number(process.env.BENCHMARK_AUCTION_COUNT || 100);
export const BENCHMARK_BIDDER_COUNT = Number(process.env.BENCHMARK_BIDDER_COUNT || 500);

const AUCTION_IDS = Array.from({ length: BENCHMARK_AUCTION_COUNT }, (_, index) => BigInt(BENCHMARK_START_ID + index));
const BIDDER_IDS = Array.from({ length: BENCHMARK_BIDDER_COUNT }, (_, index) => BENCHMARK_START_ID + index);

async function assertBenchmarkDatabase(): Promise<void> {
  if (process.env.NODE_ENV !== "benchmark") throw new Error("NODE_ENV=benchmark is required");
  const [row] = await prisma.$queryRaw<Array<{ current_database: string }>>`SELECT current_database()`;
  const dbName = row?.current_database ?? "unknown";
  const expectedDatabase = process.env.BENCHMARK_DATABASE_NAME ?? "online_auction_benchmark";
  if (dbName !== expectedDatabase) {
    throw new Error(
      `Refusing to seed database '${dbName}'. Benchmark seeding must run against '${expectedDatabase}'.`,
    );
  }
}

async function clearRedisAuctionKeys(): Promise<void> {
  const database = Number(redisClient.options.db ?? 0);
  if (database <= 0 && process.env.BENCHMARK_ISOLATED !== "true") {
    throw new Error("Benchmark seeding requires an isolated Redis service or a dedicated non-zero Redis database");
  }
  await redisClient.flushdb();
}

async function main(): Promise<void> {
  await assertBenchmarkDatabase();
  const now = new Date();
  const resetData = benchmarkAuctionResetData(now);
  await prisma.$transaction(async (tx) => {
    await tx.auction_outbox.deleteMany({ where: { aggregate_id: { in: AUCTION_IDS.map(String) } } });
    await tx.auction_processed_events.deleteMany({ where: { product_id: { in: AUCTION_IDS } } });
    await tx.auction_transitions.deleteMany({ where: { product_id: { in: AUCTION_IDS } } });
    await tx.orders.deleteMany({ where: { product_id: { in: AUCTION_IDS } } });
    await tx.bidding_history.deleteMany({ where: { product_id: { in: AUCTION_IDS } } });
    await tx.bidding_ban_user.deleteMany({ where: { product_id: { in: AUCTION_IDS } } });
    await tx.bid_idempotency.deleteMany({ where: { user_id: { in: BIDDER_IDS } } });

    // createMany(..., skipDuplicates) only inserts missing products. Existing
    // benchmark products must be reset explicitly so every measured attempt
    // starts from the same auction state.
    await tx.products.updateMany({
      where: { product_id: { in: AUCTION_IDS } },
      data: resetData,
    });

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
    await tx.users.createMany({
      data: BIDDER_IDS.map((userId) => ({
        user_id: userId,
        username: `benchmark-bidder-${userId}`,
        full_name: `Benchmark Bidder ${userId}`,
        email: `benchmark-bidder-${userId}@example.test`,
        role: "user",
        status: "active",
        rating: 5,
        rating_count: 1,
      })),
      skipDuplicates: true,
    });

    await tx.products.createMany({
      data: AUCTION_IDS.map((productId) => ({
        product_name: `Benchmark Auction ${productId}`,
        ...resetData,
        product_id: productId,
      })),
      skipDuplicates: true,
    });
  }, { timeout: 60_000, maxWait: 10_000 });
  await clearRedisAuctionKeys();
  for (const productId of AUCTION_IDS) await bootstrapRedisAuction(Number(productId));
  const authSnapshots = authRedisClient.pipeline();
  for (const userId of BIDDER_IDS) {
    const key = `auth:v1:user:${userId}`;
    authSnapshots.hset(key, "role", "user", "status", "active", "authVersion", "0");
    authSnapshots.expire(key, Number(process.env.AUTH_SNAPSHOT_TTL_SECONDS ?? 30));
  }
  await authSnapshots.exec();
  const manifest = {
    runId: process.env.BENCHMARK_RUN_ID ?? "manual",
    database: process.env.BENCHMARK_DATABASE_NAME ?? "online_auction_benchmark",
    redisDatabase: Number(redisClient.options.db ?? 0),
    users: BIDDER_IDS.length,
    auctions: AUCTION_IDS.length,
    sellerId: BENCHMARK_SELLER_ID.toString(),
    productIds: AUCTION_IDS.map(String),
    bidderIds: BIDDER_IDS,
    startId: BENCHMARK_START_ID,
    startPriceVnd: "100000",
    stepPriceVnd: "10000",
  };
  if (process.env.BENCHMARK_MANIFEST_PATH) {
    await writeFile(process.env.BENCHMARK_MANIFEST_PATH, JSON.stringify(manifest, null, 2), "utf8");
  }
  process.stdout.write(`${JSON.stringify(manifest)}\n`);
}

main()
  .finally(async () => Promise.allSettled([prisma.$disconnect(), closeRedisConnection()]))
  .catch((error: unknown) => {
    log.error(error);
    process.exitCode = 1;
  });
