import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { DashboardOperations, DashboardSummary } from "api-contracts";

const service = vi.hoisted(() => ({
  getSummary: vi.fn(),
  getOperations: vi.fn(),
}));
vi.mock("@/services/dashboard.service", () => ({ dashboardService: service }));

import { useDashboardData } from "./useDashboardData";

const summary: DashboardSummary = {
  range: "30d",
  metrics: {
    completedOrderGmvVnd: 10, activeBidders: 2, enabledAccounts: 3, activeAuctions: 4,
    pendingOrders: 1, finishedOrders: 1, rejectedOrders: 0, pendingSellerVerifications: 0, sellThroughRate: 50,
  },
  comparison: { completedOrderGmvVnd: 10, activeBidders: 0, finishedOrders: null },
  series: [], categoryDistribution: [], bidHeatmap: [], recentActivity: [],
  metadata: {
    version: 1, updatedAt: new Date().toISOString(), freshnessMs: 1,
    state: "fresh", refreshDurationMs: 5, sourceEventCount: 1, reason: "test",
  },
};
const operations = {
  postgres: { available: true, latencyMs: 1 },
  redis: { available: true, latencyMs: 1 },
  kafka: { available: true, latencyMs: 1 },
  workerHeartbeat: { available: true, ageMs: 1 },
  refreshAgeMs: 1, outboxPending: 0, outboxRetrying: 0, consumerLag: 0, dlqCount: 0, adminSocketCount: 1,
} satisfies DashboardOperations;

describe("useDashboardData", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    service.getSummary.mockResolvedValue({ success: true, data: summary });
    service.getOperations.mockResolvedValue({ success: true, data: operations });
  });

  it("exposes loading and measured success data", async () => {
    const { result } = renderHook(() => useDashboardData("30d", false));
    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.summary?.metadata.version).toBe(1);
    expect(result.current.operations?.postgres.latencyMs).toBe(1);
    expect(result.current.error).toBeNull();
  });

  it("exposes API failures without fabricating fallback values", async () => {
    service.getSummary.mockRejectedValueOnce(new Error("offline"));
    const { result } = renderHook(() => useDashboardData("7d", false));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.summary).toBeNull();
    expect(result.current.error).toBe("offline");
  });

  it("refetches when the selected range changes", async () => {
    const { rerender } = renderHook(({ range }) => useDashboardData(range, false), {
      initialProps: { range: "7d" as const },
    });
    await waitFor(() => expect(service.getSummary).toHaveBeenCalledTimes(1));
    rerender({ range: "30d" as "7d" });
    await waitFor(() => expect(service.getSummary).toHaveBeenCalledTimes(2));
    expect(service.getSummary).toHaveBeenLastCalledWith({ range: "30d" });
  });
});
