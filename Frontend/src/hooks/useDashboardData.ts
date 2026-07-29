import { useCallback, useEffect, useState } from "react";
import type { DashboardOperations, DashboardRange, DashboardSummary } from "api-contracts";
import { dashboardService } from "@/services/dashboard.service";

export function useDashboardData(range: DashboardRange, polling: boolean) {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [operations, setOperations] = useState<DashboardOperations | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const refresh = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [summaryResponse, operationsResponse] = await Promise.all([
        dashboardService.getSummary({ range }),
        dashboardService.getOperations(),
      ]);
      setSummary(summaryResponse.data);
      setOperations(operationsResponse.data);
      setError(null);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Dashboard data is unavailable");
    } finally {
      if (!silent) setLoading(false);
    }
  }, [range]);
  useEffect(() => { void refresh(); }, [refresh]);
  useEffect(() => {
    if (!polling) return;
    const timer = window.setInterval(() => void refresh(true), 60_000);
    return () => window.clearInterval(timer);
  }, [polling, refresh]);
  return { summary, operations, loading, error, refresh };
}
