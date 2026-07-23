import "dotenv/config";
import { Prisma } from "@prisma/client";
import { redisClient } from "@/config/redis.config.ts";
import { prisma } from "@/infrastructure/database/prisma.client.ts";
import { reconcileAuctionProjection } from "@/modules/bids/infrastructure/redis/redis-projection.reconciliation.ts";
import { writeFile } from "node:fs/promises";

type Violation = { invariant: string; details: unknown };
const delay = (milliseconds: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function main(): Promise<void> {
  const violations: Violation[] = [];
  const duplicateTransitions = await prisma.$queryRaw<Array<{ product_id: bigint; sequence: bigint; count: bigint }>>(Prisma.sql`
    SELECT product_id, sequence, COUNT(*) AS count
    FROM auction_transitions GROUP BY product_id, sequence HAVING COUNT(*) > 1`);
  if (duplicateTransitions.length) violations.push({ invariant: "unique transition sequence", details: duplicateTransitions });

  const duplicateOrders = await prisma.$queryRaw<Array<{ product_id: bigint; count: bigint }>>(Prisma.sql`
    SELECT product_id, COUNT(*) AS count FROM orders
    WHERE product_id IS NOT NULL GROUP BY product_id HAVING COUNT(*) > 1`);
  if (duplicateOrders.length) violations.push({ invariant: "one order per auction", details: duplicateOrders });

  const reconciliation = [];
  if ((process.env.BID_ENGINE ?? "postgres") === "redis") {
    const projectionMismatch = await prisma.$queryRaw<Array<{ product_id: bigint; auction_sequence: bigint; projected_sequence: bigint }>>(Prisma.sql`
      SELECT p.product_id, p.auction_sequence, COALESCE(MAX(t.sequence), 0) AS projected_sequence
      FROM products p LEFT JOIN auction_transitions t ON t.product_id = p.product_id
      WHERE p.product_id BETWEEN 1 AND 20
      GROUP BY p.product_id, p.auction_sequence
      HAVING p.auction_sequence <> COALESCE(MAX(t.sequence), 0)`);
    if (projectionMismatch.length) violations.push({ invariant: "snapshot matches transition sequence", details: projectionMismatch });
    const timeoutMs = Number(process.env.WAIT_FOR_CONVERGENCE_MS ?? 0);
    const deadline = Date.now() + timeoutMs;
    do {
      reconciliation.length = 0;
      for (let productId = 1; productId <= 20; productId += 1) {
        reconciliation.push(await reconcileAuctionProjection(productId));
      }
      if (reconciliation.every((result) => result.status === "converged") || Date.now() >= deadline) break;
      await delay(250);
    } while (true);
    for (const result of reconciliation) {
      if (result.status !== "converged") violations.push({ invariant: "Redis/PostgreSQL convergence", details: result });
    }
  } else {
    const baselineMismatch = await prisma.$queryRaw<Array<{ product_id: bigint }>>(Prisma.sql`
      SELECT p.product_id
      FROM products p
      WHERE p.product_id BETWEEN 1 AND 20
        AND p.auction_sequence > 0
        AND NOT EXISTS (
          SELECT 1 FROM bidding_history h
          WHERE h.product_id = p.product_id AND h.price_owner_id = p.price_owner_id
        )`);
    if (baselineMismatch.length) violations.push({ invariant: "PostgreSQL snapshot has matching bid history", details: baselineMismatch });
  }
  const output = { violations, reconciliation, passed: violations.length === 0 };
  const serialized = JSON.stringify(output, (_key, value) => typeof value === "bigint" ? value.toString() : value, 2);
  console.log(serialized);
  if (process.env.INVARIANT_OUTPUT) await writeFile(process.env.INVARIANT_OUTPUT, serialized, "utf8");
  if (violations.length > 0) process.exitCode = 1;
}

main()
  .finally(async () => Promise.allSettled([prisma.$disconnect(), redisClient.quit()]))
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  });
