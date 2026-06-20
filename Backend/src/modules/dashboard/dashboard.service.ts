import * as DashboardModel from "./dashboard.model.ts";

// Fetch combined dashboard payload including metrics, chart data, and activity logs
export async function getDashboardSummary(range?: string) {
  const metrics = await DashboardModel.getDashboardMetrics();
  const chartData = await DashboardModel.getDashboardChartData(range);
  const activities = await DashboardModel.getDashboardActivities();

  return {
    metrics,
    chartData,
    activities,
  };
}
