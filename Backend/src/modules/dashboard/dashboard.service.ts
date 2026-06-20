import db from "@/config/database.config.ts";
import { publishDashboardUpdate } from "@/config/rabbitmq.config.ts";
import * as DashboardModel from "./dashboard.model.ts";

// Fetch cached dashboard statistics summary
export async function getDashboardSummary(range: string = "6m") {
  try {
    const cacheQuery = await db.raw("select value from dashboard_stats where key = 'summary'");
    if (cacheQuery.rows[0]) {
      const cached = cacheQuery.rows[0].value;
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
