import "dotenv/config";
import { closeKafkaConnection, initKafka } from "@/config/kafka.config.ts";
import { closeRedisConnection } from "@/config/redis.config.ts";
import { prisma } from "@/infrastructure/database/prisma.client.ts";
import { startOutboxRelay, stopOutboxRelay } from "@/infrastructure/events/outbox-relay.worker.ts";

async function run(): Promise<void> {
  if (!(await initKafka())) throw new Error("Kafka producer is unavailable");
  startOutboxRelay();
  console.log("[OUTBOX_RELAY] Started");
}

let shuttingDown = false;
async function shutdown(signal: string): Promise<void> {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log("[OUTBOX_RELAY] Stopping", { signal });
  await stopOutboxRelay();
  await Promise.allSettled([closeKafkaConnection(), closeRedisConnection(), prisma.$disconnect()]);
  process.exit(0);
}

void run().catch((error: unknown) => {
  console.error("[OUTBOX_RELAY] Startup failed", {
    message: error instanceof Error ? error.message : "unknown",
  });
  process.exit(1);
});

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));
