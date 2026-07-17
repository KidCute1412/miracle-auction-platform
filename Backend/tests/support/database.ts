import { beforeEach, afterAll } from "vitest";
import { prisma } from "../../src/infrastructure/database/prisma.client.ts";

const tables = [
  "auction_outbox", "bid_idempotency", "orders", "bidding_history", "bidding_ban_user",
  "product_questions", "love_products", "products", "extend_bidding_time", "otp_codes",
  "upgrade_to_sellers", "user_blacklist", "user_rating", "categories", "users",
] as const;

export function useIsolatedDatabase(): void {
  const databaseUrl = process.env.DATABASE_URL ?? "";
  if (!/test/i.test(databaseUrl)) {
    throw new Error("Integration tests require a DATABASE_URL that contains 'test'.");
  }

  beforeEach(async () => {
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tables.map((table) => `\"${table}\"`).join(", ")} RESTART IDENTITY CASCADE`);
  });
  afterAll(async () => prisma.$disconnect());
}
