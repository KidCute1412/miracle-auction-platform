import { prisma } from "@/infrastructure/database/prisma.client.ts";
import { Prisma } from "@prisma/client";
import { kafka } from "@/config/kafka.config.ts";
import * as DashboardModel from "../modules/dashboard/infrastructure/dashboard.repository.ts";

let dashboardConsumer: ReturnType<typeof kafka.consumer> | undefined;
let dashboardInterval: NodeJS.Timeout | undefined;

// Create cache table if it does not exist
async function ensureCacheTable() {
  // The table belongs to the Prisma migration history.  This lightweight read
  // keeps worker startup from silently recreating schema outside migrations.
  await prisma.dashboard_stats.findFirst({ select: { key: true } });
}

// Recalculate dashboard metrics and write to DB cache
async function refreshDashboardCache() {
  try {
    await ensureCacheTable();

    // Fetch live metrics and activities
    const metrics = await DashboardModel.getDashboardMetrics();
    const activities = await DashboardModel.getDashboardActivities();

    // Pre-calculate all timeframe ranges to cache them
    const chartData = {
      "7d": await DashboardModel.getDashboardChartData("7d"),
      "30d": await DashboardModel.getDashboardChartData("30d"),
      "3m": await DashboardModel.getDashboardChartData("3m"),
      "6m": await DashboardModel.getDashboardChartData("6m"),
      "1y": await DashboardModel.getDashboardChartData("1y"),
    };

    const payload = {
      metrics,
      chartData,
      activities,
      updated_at: new Date(),
    };

    // Store in Postgres jsonb cache table
    const value = JSON.parse(JSON.stringify(payload)) as Prisma.InputJsonValue;
    await prisma.dashboard_stats.upsert({
      where: { key: "summary" },
      create: { key: "summary", value },
      update: { value, updated_at: new Date() },
    });

    console.log(`[WORKER] Dashboard stats pre-calculated and cached successfully:
      - GMV: $${metrics.gmv.toLocaleString()}
      - Active Users: ${metrics.activeUsers.toLocaleString()}
      - Active Auctions: ${metrics.activeAuctions.toLocaleString()}
      - Pending Verifications: ${metrics.pendingVerifications}
      - Recent Activities Count: ${activities.length}`);
  } catch (error) {
    console.error("[WORKER] Failed to refresh dashboard stats cache:", error);
  }
}

// Start consuming dashboard update jobs from Kafka and run scheduled crons
export async function startDashboardConsumer(): Promise<void> {
  // Pre-calculate immediately on startup
  await refreshDashboardCache();

  // Schedule background recalculation every 1 minute
  dashboardInterval = setInterval(async () => {
    console.log("[WORKER] Running scheduled dashboard stats update...");
    await refreshDashboardCache();
  }, 60000);

  try {
    dashboardConsumer = kafka.consumer({ groupId: "dashboard-group" });
    await dashboardConsumer.connect();
    await dashboardConsumer.subscribe({ topic: "dashboard_updates", fromBeginning: false });

    await dashboardConsumer.run({
      eachMessage: async () => {
        console.log("[WORKER] Received manual sync trigger from Kafka topic...");
        await refreshDashboardCache();
      },
    });
  } catch (error) {
    console.error("[WORKER] Failed to run Kafka consumer:", error);
  }
}

export async function stopDashboardConsumer(): Promise<void> {
  if (dashboardInterval) {
    clearInterval(dashboardInterval);
    dashboardInterval = undefined;
  }
  if (dashboardConsumer) {
    await dashboardConsumer.disconnect();
    dashboardConsumer = undefined;
  }
}
