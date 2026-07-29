import { closeKafkaConnection, initKafka } from "@/config/kafka.config.ts";
import { closeRedisConnection } from "@/config/redis.config.ts";
import { prisma } from "@/infrastructure/database/prisma.client.ts";
import { dispatchBidOutbox } from "@/modules/bids/infrastructure/bid-outbox.dispatcher.ts";
import {
  getDashboardSummary,
  requestDashboardRecalculation,
} from "@/modules/dashboard/application/dashboard-summary.use-case.ts";

const wait = (milliseconds: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function main(): Promise<void> {
  if (!(await initKafka())) throw new Error("Kafka producer is unavailable");
  const request = await requestDashboardRecalculation();
  await dispatchBidOutbox();
  const deadline = Date.now() + 45_000;
  while (Date.now() < deadline) {
    const [summary, receipt] = await Promise.all([
      getDashboardSummary("30d"),
      prisma.dashboard_event_receipts.findUnique({ where: { event_id: request.eventId } }),
    ]);
    if (receipt?.status === "processed" && summary.metadata.version > request.baselineVersion) {
      console.log(JSON.stringify({
        eventId: request.eventId,
        baselineVersion: request.baselineVersion,
        completedVersion: summary.metadata.version,
        reason: summary.metadata.reason,
        receiptStatus: receipt.status,
        attempts: receipt.attempts,
      }));
      return;
    }
    await wait(1_000);
  }
  throw new Error(`Dashboard version did not advance beyond ${request.baselineVersion} within 45 seconds`);
}

main()
  .finally(async () => {
    await Promise.allSettled([
      closeKafkaConnection(),
      closeRedisConnection(),
      prisma.$disconnect(),
    ]);
  })
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  });
