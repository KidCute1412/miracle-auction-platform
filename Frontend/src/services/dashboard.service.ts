import { apiRequest } from "./api.client.ts";
import type {
  AuditLogResponse,
  DashboardDlqResponse,
  DashboardOperationsResponse,
  DashboardRange,
  DashboardSummaryResponse,
  DashboardSyncResponse,
} from "api-contracts";

const ADMIN_PATH = import.meta.env.VITE_PATH_ADMIN || "admin";

export const dashboardService = {
  // Retrieve the full admin dashboard status data
  getSummary: async (params?: { range?: DashboardRange }): Promise<DashboardSummaryResponse> => {
    return apiRequest(`/${ADMIN_PATH}/dashboard`, { params });
  },

  // Trigger cache recalculation
  syncCache: async (): Promise<DashboardSyncResponse> => {
    return apiRequest(`/${ADMIN_PATH}/dashboard/sync`, { method: "POST" });
  },
  getOperations: (): Promise<DashboardOperationsResponse> =>
    apiRequest(`/${ADMIN_PATH}/dashboard/operations`),
  getAuditLogs: (params?: Record<string, string | number | undefined>): Promise<AuditLogResponse> =>
    apiRequest(`/${ADMIN_PATH}/audit-logs`, { params }),
  getDlq: (params?: { page?: number; limit?: number }): Promise<DashboardDlqResponse> =>
    apiRequest(`/${ADMIN_PATH}/dashboard/dlq`, { params }),
  retryDlq: (eventId: string): Promise<DashboardSyncResponse> =>
    apiRequest(`/${ADMIN_PATH}/dashboard/dlq/${eventId}/retry`, { method: "POST" }),
  exportUrl: (dataset: "analytics" | "audit", range: DashboardRange): string => {
    const base = import.meta.env.VITE_API_URL || "http://localhost:5000";
    return `${base}/${ADMIN_PATH}/dashboard/export.csv?dataset=${dataset}&range=${range}`;
  },
};
