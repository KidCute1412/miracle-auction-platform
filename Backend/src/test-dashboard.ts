import { Prisma } from "@prisma/client";
import { prisma } from "./infrastructure/database/prisma.client.ts";

async function test() {
  try {
    const interval = "6 months";
    const format = "Mon";
    const dateTrunc = "month";
    const overviewQuery = await prisma.$queryRaw(Prisma.sql`
      SELECT to_char(created_at, ${format}) AS month, count(*) AS count, date_trunc(${dateTrunc}, created_at) AS trunc_date
      FROM products WHERE created_at >= now() - ${interval}::interval
      GROUP BY to_char(created_at, ${format}), date_trunc(${dateTrunc}, created_at) ORDER BY trunc_date
    `);
    console.log("Overview query output:", overviewQuery);
  } catch (error: unknown) {
    console.error("Test query failed:", error instanceof Error ? error.message : error);
  } finally {
    await prisma.$disconnect();
  }
}

void test();
