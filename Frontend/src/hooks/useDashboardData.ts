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
      const summaryPromise = dashboardService.getSummary({ range }).then((res) => {
        setSummary(res.data);
        if (!silent) setLoading(false);
      });
      const operationsPromise = dashboardService.getOperations().then((res) => {
        setOperations(res.data);
      }).catch(() => undefined);

      await Promise.all([summaryPromise, operationsPromise]);
      setError(null);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Dashboard data is unavailable");
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
