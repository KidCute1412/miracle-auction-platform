import { beforeEach, describe, expect, it, vi } from "vitest";

const findUnique = vi.hoisted(() => vi.fn());
const repo = vi.hoisted(() => ({ getDashboardMetrics: vi.fn(), getDashboardChartData: vi.fn(), getDashboardActivities: vi.fn() }));
const publish = vi.hoisted(() => vi.fn());
vi.mock("@/infrastructure/database/prisma.client.ts", () => ({ prisma: { dashboard_stats: { findUnique } } }));
vi.mock("../../src/modules/dashboard/infrastructure/dashboard.repository.ts", () => repo);
vi.mock("@/config/kafka.config.ts", () => ({ publishDashboardUpdate: publish }));

import { getDashboardSummary, requestDashboardRecalculation } from "../../src/modules/dashboard/application/dashboard-summary.use-case.ts";

describe("dashboard summary use cases", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns the requested cached chart range", async () => {
    findUnique.mockResolvedValue({ value: { metrics: { users: 1 }, chartData: { "1m": { overview: [1] } }, activities: [2] } });
    await expect(getDashboardSummary("1m")).resolves.toEqual({ metrics: { users: 1 }, chartData: { overview: [1] }, activities: [2] });
    expect(repo.getDashboardMetrics).not.toHaveBeenCalled();
  });

  it("falls back to live queries when cache is absent", async () => {
    findUnique.mockResolvedValue(null); repo.getDashboardMetrics.mockResolvedValue({ users: 2 }); repo.getDashboardChartData.mockResolvedValue({ overview: [] }); repo.getDashboardActivities.mockResolvedValue([]);
    await expect(getDashboardSummary("6m")).resolves.toEqual({ metrics: { users: 2 }, chartData: { overview: [] }, activities: [] });
  });

  it("publishes a recalculation request", async () => {
    publish.mockResolvedValue(undefined);
    await requestDashboardRecalculation();
    expect(publish).toHaveBeenCalledOnce();
  });
});
