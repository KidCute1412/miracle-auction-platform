import "dotenv/config";
import { closeKafkaConnection, initKafka } from "@/config/kafka.config.ts";
import { closeRedisConnection } from "@/config/redis.config.ts";
import { prisma } from "@/infrastructure/database/prisma.client.ts";
import { startOutboxRelay, stopOutboxRelay } from "@/infrastructure/events/outbox-relay.worker.ts";
import { getLogger, safeError } from "@/infrastructure/observability/logger.ts";

const log = getLogger({ component: "outbox-relay" });

async function run(): Promise<void> {
  if (!(await initKafka())) throw new Error("Kafka producer is unavailable");
  startOutboxRelay();
  log.info("Outbox relay started");
}

let shuttingDown = false;
async function shutdown(signal: string): Promise<void> {
  if (shuttingDown) return;
  shuttingDown = true;
  log.info({ signal }, "Outbox relay stopping");
  await stopOutboxRelay();
  await Promise.allSettled([closeKafkaConnection(), closeRedisConnection(), prisma.$disconnect()]);
  process.exit(0);
}

void run().catch((error: unknown) => {
  log.fatal({ err: safeError(error) }, "Outbox relay startup failed");
  process.exit(1);
});

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));
