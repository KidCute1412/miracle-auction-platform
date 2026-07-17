import { prisma } from "@/infrastructure/database/prisma.client.ts";
import { publishDashboardUpdate } from "@/config/kafka.config.ts";
import * as DashboardModel from "../infrastructure/dashboard.repository.ts";

// Fetch cached dashboard statistics summary
export async function getDashboardSummary(range: string = "6m") {
  try {
    const cachedRow = await prisma.dashboard_stats.findUnique({ where: { key: "summary" } });
    if (cachedRow) {
      const cached = cachedRow.value as { metrics: unknown; chartData: Record<string, unknown>; activities: unknown };
      return {
        metrics: cached.metrics,
        chartData: cached.chartData[range] || cached.chartData["6m"] || { overview: [], revenue: [], bids: [] },
        activities: cached.activities,
      };
    }
  } catch (err) {
    console.warn("Dashboard cache read failed, falling back to live query:", err);
  }

  const metrics = await DashboardModel.getDashboardMetrics();
  const chartData = await DashboardModel.getDashboardChartData(range);
  const activities = await DashboardModel.getDashboardActivities();

  return {
    metrics,
    chartData,
    activities,
  };
}

// Request async background recalculation of the dashboard data
export async function requestDashboardRecalculation() {
  await publishDashboardUpdate();
}
