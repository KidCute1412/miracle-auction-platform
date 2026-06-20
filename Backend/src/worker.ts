import dotenv from "dotenv";
dotenv.config();

import { initRabbitMQ } from "./config/rabbitmq.config.ts";
import { startDashboardConsumer } from "./workers/dashboard.worker.ts";

// Initialize RabbitMQ and start all background worker consumers
async function run() {
  console.log("[WORKER] Starting background stats worker process...");
  await initRabbitMQ();
  await startDashboardConsumer();
}

run();
