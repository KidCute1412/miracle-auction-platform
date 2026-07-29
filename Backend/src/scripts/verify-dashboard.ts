import { closeRedisConnection } from "@/config/redis.config.ts";
import { prisma } from "@/infrastructure/database/prisma.client.ts";
import {
  getDashboardSummary,
  refreshDashboardSnapshot,
} from "@/modules/dashboard/application/dashboard-summary.use-case.ts";

async function main(): Promise<void> {
  const refreshed = await refreshDashboardSnapshot({ reason: "verification" });
  const summary = await getDashboardSummary("30d");
  console.log(JSON.stringify({
    version: refreshed.version,
    metrics: summary.metrics,
    series: summary.series.length,
    categories: summary.categoryDistribution.length,
    heatmap: summary.bidHeatmap.length,
    state: summary.metadata.state,
  }));
}

main()
  .finally(async () => {
    await Promise.allSettled([prisma.$disconnect(), closeRedisConnection()]);
  })
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  });
