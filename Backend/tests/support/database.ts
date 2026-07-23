import { beforeEach, afterAll } from "vitest";
import { prisma } from "../../src/infrastructure/database/prisma.client.ts";
import { assertManagedDatabaseName, validateManagedTestDatabaseEnvironment } from "./database-safety.ts";

const tables = [
  "auction_outbox", "auction_processed_events", "auction_transitions", "bid_idempotency",
  "orders", "bidding_history", "bidding_ban_user",
  "product_questions", "love_products", "products", "extend_bidding_time", "otp_codes",
  "upgrade_to_sellers", "user_blacklist", "user_rating", "categories", "users",
] as const;

export function useIsolatedDatabase(): void {
  validateManagedTestDatabaseEnvironment(process.env);

  beforeEach(async () => {
    const [connection] = await prisma.$queryRaw<Array<{ current_database: string }>>`SELECT current_database()`;
    assertManagedDatabaseName(connection?.current_database ?? "");
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tables.map((table) => `\"${table}\"`).join(", ")} RESTART IDENTITY CASCADE`);
  });
  afterAll(async () => prisma.$disconnect());
}
