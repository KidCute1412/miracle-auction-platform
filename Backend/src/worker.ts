import dotenv from "dotenv";
dotenv.config();

import { initKafka } from "./config/kafka.config.ts";
import { startDashboardConsumer } from "./workers/dashboard.worker.ts";

// Initialize Kafka and start all background worker consumers
async function run() {
  console.log("[WORKER] Starting background stats worker process...");
  await initKafka();
  await startDashboardConsumer();
}

run();
