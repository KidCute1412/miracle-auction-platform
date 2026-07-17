import dotenv from "dotenv";
dotenv.config();

import { initKafka } from "./config/kafka.config.ts";
import { startDashboardConsumer } from "./workers/dashboard.worker.ts";
import { stopDashboardConsumer } from "./workers/dashboard.worker.ts";
import { closeKafkaConnection } from "./config/kafka.config.ts";
import { closeRedisConnection } from "./config/redis.config.ts";
import db from "./config/database.config.ts";

// Initialize Kafka and start all background worker consumers
async function run() {
  console.log("[WORKER] Starting background stats worker process...");
  await initKafka();
  await startDashboardConsumer();
}

let shuttingDown = false;
const shutdown = async (signal: string): Promise<void> => {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`[WORKER] Received ${signal}; stopping consumers and connections...`);
  await Promise.allSettled([
    stopDashboardConsumer(),
    closeKafkaConnection(),
    closeRedisConnection(),
    db.destroy(),
  ]);
  process.exit(0);
};

run().catch((error: unknown) => {
  console.error("[WORKER] Failed to start:", error instanceof Error ? error.message : "unknown error");
  process.exit(1);
});

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));
