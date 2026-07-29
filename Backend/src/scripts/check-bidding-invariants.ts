import "dotenv/config";
import { Prisma } from "@prisma/client";
import type { Admin } from "kafkajs";
import { kafka, kafkaTopics } from "@/config/kafka.config.ts";
import { redisClient } from "@/config/redis.config.ts";
import { prisma } from "@/infrastructure/database/prisma.client.ts";
import { reconcileAuctionProjection } from "@/modules/bids/infrastructure/redis/redis-projection.reconciliation.ts";
import { getProjectorStreamHealth } from "@/modules/bids/infrastructure/redis/redis-stream.projector.ts";
import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

type Violation = { invariant: string; details: unknown };
type PipelineHealth = {
  streamPending: number;
  streamLag: number | null;
  outboxPending: number;
  dashboardConsumerLag: number | null;
  notificationConsumerLag: number | null;
};
const delay = (milliseconds: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, milliseconds));

export function calculateConsumerLag(
  topicEnds: Array<{ topic: string; partitions: Array<{ partition: number; high: string }> }>,
  groupOffsets: Array<{ topic: string; partitions: Array<{ partition: number; offset: string }> }>,
  fromBeginning: boolean,
): number {
  return topicEnds.reduce((total, topic) => {
    const committed = groupOffsets.find((item) => item.topic === topic.topic)?.partitions ?? [];
    return total + topic.partitions.reduce((topicTotal, partition) => {
      const offset = committed.find((item) => item.partition === partition.partition)?.offset ?? "-1";
      const current = offset === "-1" && !fromBeginning ? Number(partition.high) : Number(offset === "-1" ? 0 : offset);
      return topicTotal + Math.max(0, Number(partition.high) - current);
    }, 0);
  }, 0);
}

async function readConsumerLag(
  admin: Admin,
  groupId: string,
  topics: string[],
  fromBeginning: boolean,
): Promise<number> {
  const topicEnds = [];
  for (const topic of topics) {
    topicEnds.push({ topic, partitions: await admin.fetchTopicOffsets(topic) });
  }
  const groupOffsets = await admin.fetchOffsets({ groupId, topics });
  return calculateConsumerLag(topicEnds, groupOffsets, fromBeginning);
}

async function readPipelineHealth(admin: Admin): Promise<PipelineHealth> {
  const topics = [kafkaTopics.bidding, kafkaTopics.domain, kafkaTopics.dashboard];
  const [stream, outboxPending] = await Promise.all([
    getProjectorStreamHealth(),
    prisma.auction_outbox.count({ where: { delivered_at: null, terminal_at: null } }),
  ]);
  const dashboardConsumerLag = await readConsumerLag(
    admin,
    process.env.DASHBOARD_KAFKA_GROUP_ID ?? "dashboard-analytics-v1",
    topics,
    false,
  );
  const notificationConsumerLag = await readConsumerLag(
    admin,
    process.env.NOTIFICATION_KAFKA_GROUP_ID ?? "notification-intake-v1",
    topics,
    true,
  );
  return {
    streamPending: stream.pending,
    streamLag: stream.lag,
    outboxPending,
    dashboardConsumerLag,
    notificationConsumerLag,
  };
}

function pipelineConverged(health: PipelineHealth): boolean {
  return health.streamPending === 0
    && (health.streamLag === null || health.streamLag === 0)
    && health.outboxPending === 0
    && health.dashboardConsumerLag === 0
    && health.notificationConsumerLag === 0;
}

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

  const duplicateHistorySequences = await prisma.$queryRaw<Array<{ product_id: bigint; sequence: bigint; count: bigint }>>(Prisma.sql`
    SELECT product_id, sequence, COUNT(*) AS count
    FROM bidding_history
    WHERE sequence IS NOT NULL
    GROUP BY product_id, sequence
    HAVING COUNT(*) > 1`);
  if (duplicateHistorySequences.length) {
    violations.push({ invariant: "unique bidding history sequence", details: duplicateHistorySequences });
  }

  const reconciliation = [];
  let pipelineHealth: PipelineHealth | null = null;
  if ((process.env.BID_ENGINE ?? "postgres") === "redis") {
    const projectionMismatch = await prisma.$queryRaw<Array<{ product_id: bigint; auction_sequence: bigint; projected_sequence: bigint }>>(Prisma.sql`
      SELECT p.product_id, p.auction_sequence, COALESCE(MAX(t.sequence), 0) AS projected_sequence
      FROM products p LEFT JOIN auction_transitions t ON t.product_id = p.product_id
      WHERE (p.product_id >= 900000 OR p.product_name LIKE 'Benchmark Auction%')
      GROUP BY p.product_id, p.auction_sequence
      HAVING p.auction_sequence <> COALESCE(MAX(t.sequence), 0)`);
    if (projectionMismatch.length) violations.push({ invariant: "snapshot matches transition sequence", details: projectionMismatch });
    const timeoutMs = Number(process.env.WAIT_FOR_CONVERGENCE_MS ?? 0);
    const deadline = Date.now() + timeoutMs;
    const benchmarkProducts = await prisma.products.findMany({
      where: { OR: [{ product_name: { startsWith: "Benchmark Auction" } }, { product_id: { gte: 900000n } }] },
      select: { product_id: true },
    });
    for (;;) {
      reconciliation.length = 0;
      for (const prod of benchmarkProducts) {
        reconciliation.push(await reconcileAuctionProjection(Number(prod.product_id)));
      }
      if (reconciliation.every((result) => result.status === "converged") || Date.now() >= deadline) break;
      await delay(250);
    }
    for (const result of reconciliation) {
      if (result.status !== "converged") violations.push({ invariant: "Redis/PostgreSQL convergence", details: result });
    }

    const pipelineDeadline = Date.now() + timeoutMs;
    let lastPipelineError: string | undefined;
    for (;;) {
      const admin = kafka.admin();
      try {
        await admin.connect();
        for (;;) {
          pipelineHealth = await readPipelineHealth(admin);
          lastPipelineError = undefined;
          if (pipelineConverged(pipelineHealth) || Date.now() >= pipelineDeadline) break;
          await delay(500);
        }
      } catch (error) {
        lastPipelineError = error instanceof Error ? error.message : "unknown";
      } finally {
        await admin.disconnect().catch(() => undefined);
      }
      if (pipelineHealth && pipelineConverged(pipelineHealth)) break;
      if (Date.now() >= pipelineDeadline) break;
      await delay(500);
    }
    if (!pipelineHealth) {
      violations.push({
        invariant: "Pipeline health measurable",
        details: { message: lastPipelineError ?? "unavailable" },
      });
    } else {
      if (pipelineHealth.streamPending !== 0 || (pipelineHealth.streamLag !== null && pipelineHealth.streamLag !== 0)) {
        violations.push({ invariant: "Redis Stream PEL and lag drained", details: pipelineHealth });
      }
      if (pipelineHealth.outboxPending !== 0) {
        violations.push({ invariant: "PostgreSQL outbox drained", details: pipelineHealth });
      }
      if (pipelineHealth.dashboardConsumerLag !== 0 || pipelineHealth.notificationConsumerLag !== 0) {
        violations.push({ invariant: "Kafka consumer lag converged", details: pipelineHealth });
      }
    }
  } else {
    const baselineMismatch = await prisma.$queryRaw<Array<{ product_id: bigint }>>(Prisma.sql`
      SELECT p.product_id
      FROM products p
      WHERE (p.product_id >= 900000 OR p.product_name LIKE 'Benchmark Auction%')
        AND p.auction_sequence > 0
        AND NOT EXISTS (
          SELECT 1 FROM bidding_history h
          WHERE h.product_id = p.product_id AND h.price_owner_id = p.price_owner_id
        )`);
    if (baselineMismatch.length) violations.push({ invariant: "PostgreSQL snapshot has matching bid history", details: baselineMismatch });
  }
  const output = { violations, reconciliation, pipelineHealth, passed: violations.length === 0 };
  const serialized = JSON.stringify(output, (_key, value) => typeof value === "bigint" ? value.toString() : value, 2);
  console.log(serialized);
  if (process.env.INVARIANT_OUTPUT) await writeFile(process.env.INVARIANT_OUTPUT, serialized, "utf8");
  if (violations.length > 0) process.exitCode = 1;
}

const entrypoint = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : undefined;
if (import.meta.url === entrypoint) {
  void main()
    .finally(async () => Promise.allSettled([prisma.$disconnect(), redisClient.quit()]))
    .catch((error: unknown) => {
      console.error(error);
      process.exitCode = 1;
    });
}
