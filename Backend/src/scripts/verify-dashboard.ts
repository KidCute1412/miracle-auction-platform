import { createComponentLogger } from "@/infrastructure/observability/logger.ts";

const log = createComponentLogger("verify-dashboard");

import { closeRedisConnection } from "@/config/redis.config.ts";
import { prisma } from "@/infrastructure/database/prisma.client.ts";
import {
  getDashboardSummary,
  refreshDashboardSnapshot,
} from "@/modules/dashboard/application/dashboard-summary.use-case.ts";

async function main(): Promise<void> {
  const refreshed = await refreshDashboardSnapshot({ reason: "verification" });
  const summary = await getDashboardSummary("30d");
  process.stdout.write(
    `${JSON.stringify({
      version: refreshed.version,
      metrics: summary.metrics,
      series: summary.series.length,
      categories: summary.categoryDistribution.length,
      heatmap: summary.bidHeatmap.length,
      state: summary.metadata.state,
    })}\n`,
  );
}

main()
  .finally(async () => {
    await Promise.allSettled([prisma.$disconnect(), closeRedisConnection()]);
  })
  .catch((error: unknown) => {
    log.error(error);
    process.exitCode = 1;
  });
