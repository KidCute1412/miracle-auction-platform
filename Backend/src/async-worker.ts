import "dotenv/config";
import { closeKafkaConnection, initKafka } from "@/config/kafka.config.ts";
import { closeRedisConnection, redisClient } from "@/config/redis.config.ts";
import { prisma } from "@/infrastructure/database/prisma.client.ts";
import {
  startEmailDeliveryLoop,
  stopEmailDeliveryLoop,
} from "@/modules/notifications/email-delivery.worker.ts";
import {
  startNotificationConsumer,
  stopNotificationConsumer,
} from "@/modules/notifications/notification-consumer.worker.ts";
import { startDashboardConsumer, stopDashboardConsumer } from "@/workers/dashboard.worker.ts";

let heartbeatTimer: NodeJS.Timeout | undefined;

async function writeHeartbeat(): Promise<void> {
  const ttl = Number(process.env.ASYNC_WORKER_HEARTBEAT_TTL_SECONDS ?? 90);
  await redisClient.set("async:worker:heartbeat", new Date().toISOString(), "EX", ttl).catch((error) => {
    console.warn("[ASYNC_WORKER] Redis heartbeat unavailable", {
      message: error instanceof Error ? error.message : "unknown",
    });
  });
}

async function run(): Promise<void> {
  await initKafka();
  await startDashboardConsumer();
  await startNotificationConsumer().catch((error) =>
    console.error("[ASYNC_WORKER] Notification intake unavailable; email delivery remains active", {
      message: error instanceof Error ? error.message : "unknown",
    }));
  startEmailDeliveryLoop();
  await writeHeartbeat();
  heartbeatTimer = setInterval(() => void writeHeartbeat(), 30_000);
  heartbeatTimer.unref();
  console.log("[ASYNC_WORKER] Dashboard, notification intake and email delivery started");
}

let shuttingDown = false;
async function shutdown(signal: string): Promise<void> {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log("[ASYNC_WORKER] Stopping", { signal });
  if (heartbeatTimer) clearInterval(heartbeatTimer);
  heartbeatTimer = undefined;
  await Promise.allSettled([
    stopDashboardConsumer(),
    stopNotificationConsumer(),
    stopEmailDeliveryLoop(),
  ]);
  await Promise.allSettled([closeKafkaConnection(), closeRedisConnection(), prisma.$disconnect()]);
  process.exit(0);
}

void run().catch((error: unknown) => {
  console.error("[ASYNC_WORKER] Startup failed", {
    message: error instanceof Error ? error.message : "unknown",
  });
  process.exit(1);
});

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));
