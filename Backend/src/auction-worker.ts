import "dotenv/config";
import { hostname } from "node:os";
import { checkRedisConnection, closeRedisConnection, redisClient } from "@/config/redis.config.ts";
import { checkPrismaConnection, prisma } from "@/infrastructure/database/prisma.client.ts";
import { startRedisAuctionCloseJob, stopRedisAuctionCloseJob } from "@/jobs/redis-auction-close.job.ts";
import { bootstrapActiveRedisAuctions } from "@/modules/bids/infrastructure/redis/redis-auction.bootstrap.ts";
import {
  ensureProjectorGroup,
  getProjectorRuntimeStats,
  getProjectorStreamHealth,
} from "@/modules/bids/infrastructure/redis/redis-stream.projector.ts";
import { startBidProjector, stopBidProjector } from "@/workers/bid-projector.worker.ts";
import { getLogger, safeError } from "@/infrastructure/observability/logger.ts";

const log = getLogger({ component: "auction-worker" });

let heartbeatTimer: NodeJS.Timeout | undefined;

async function writeHeartbeat(): Promise<void> {
  const ttl = Number(process.env.AUCTION_WORKER_HEARTBEAT_TTL_SECONDS ?? 90);
  const health = await getProjectorStreamHealth();
  const transaction = redisClient.multi();
  transaction.set("auction:worker:heartbeat", new Date().toISOString(), "EX", ttl);
  transaction.set("auction:worker:projection-lag", String(health.lag ?? health.pending), "EX", ttl);
  transaction.set("auction:worker:projector-stats", JSON.stringify(getProjectorRuntimeStats()), "EX", ttl);
  await transaction.exec();
}

async function run(): Promise<void> {
  const [database, redis] = await Promise.all([checkPrismaConnection(), checkRedisConnection()]);
  if (!database || !redis) throw new Error(`Dependencies unavailable: database=${database} redis=${redis}`);

  await ensureProjectorGroup();
  const before = await getProjectorStreamHealth();
  log.info(
    {
      process: "auction-worker",
      consumer: `${hostname()}-${process.pid}`,
      pending: before.pending,
      lag: before.lag,
    },
    "Stream consumer group ready",
  );
  const initialized = await bootstrapActiveRedisAuctions();
  log.info({ initialized }, "Redis auction bootstrap completed");

  startBidProjector();
  startRedisAuctionCloseJob(Number(process.env.AUCTION_CLOSE_INTERVAL_MS ?? 1_000));
  await writeHeartbeat();
  heartbeatTimer = setInterval(() => {
    void writeHeartbeat().catch((error) => log.error({ err: safeError(error) }, "Heartbeat write failed"));
  }, 30_000);
  heartbeatTimer.unref();
}

let shuttingDown = false;
async function shutdown(signal: string): Promise<void> {
  if (shuttingDown) return;
  shuttingDown = true;
  log.info({ signal }, "Worker stopping");
  if (heartbeatTimer) clearInterval(heartbeatTimer);
  heartbeatTimer = undefined;
  await stopRedisAuctionCloseJob();
  await stopBidProjector();
  await Promise.allSettled([prisma.$disconnect(), closeRedisConnection()]);
  process.exit(0);
}

void run().catch((error: unknown) => {
  log.fatal({ err: safeError(error) }, "Worker startup failed");
  process.exit(1);
});

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));
