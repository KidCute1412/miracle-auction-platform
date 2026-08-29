import "dotenv/config";
import { closeRedisConnection, redisClient } from "@/config/redis.config.ts";
import { prisma } from "@/infrastructure/database/prisma.client.ts";
import { startEmailDeliveryLoop, stopEmailDeliveryLoop } from "@/modules/notifications/email-delivery.worker.ts";
import {
  startNotificationConsumer,
  stopNotificationConsumer,
} from "@/modules/notifications/notification-consumer.worker.ts";
import { startDashboardConsumer, stopDashboardConsumer } from "@/workers/dashboard.worker.ts";
import { getLogger, safeError } from "@/infrastructure/observability/logger.ts";
import { startVisitorAnalyticsRetention, stopVisitorAnalyticsRetention } from "@/modules/visitor-analytics/application/visitor-retention.worker.ts";

const log = getLogger({ component: "async-worker" });

let heartbeatTimer: NodeJS.Timeout | undefined;

async function writeHeartbeat(): Promise<void> {
  const ttl = Number(process.env.ASYNC_WORKER_HEARTBEAT_TTL_SECONDS ?? 90);
  await redisClient.set("async:worker:heartbeat", new Date().toISOString(), "EX", ttl).catch((error) => {
    log.warn({ err: safeError(error) }, "Redis heartbeat unavailable");
  });
}

async function run(): Promise<void> {
  await startDashboardConsumer();
  await startNotificationConsumer().catch((error) =>
    log.error({ err: safeError(error) }, "Notification intake unavailable; email delivery remains active"),
  );
  startEmailDeliveryLoop();
  startVisitorAnalyticsRetention();
  await writeHeartbeat();
  heartbeatTimer = setInterval(() => void writeHeartbeat(), 30_000);
  heartbeatTimer.unref();
  log.info("Dashboard, notification intake, and email delivery started");
}

let shuttingDown = false;
async function shutdown(signal: string): Promise<void> {
  if (shuttingDown) return;
  shuttingDown = true;
  log.info({ signal }, "Worker stopping");
  if (heartbeatTimer) clearInterval(heartbeatTimer);
  stopVisitorAnalyticsRetention();
  heartbeatTimer = undefined;
  await Promise.allSettled([stopDashboardConsumer(), stopNotificationConsumer(), stopEmailDeliveryLoop()]);
  await Promise.allSettled([closeRedisConnection(), prisma.$disconnect()]);
  process.exit(0);
}

void run().catch((error: unknown) => {
  log.fatal({ err: safeError(error) }, "Worker startup failed");
  process.exit(1);
});

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));
