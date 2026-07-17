import { apiRequest } from "./api.client.ts";
import type { DashboardRange, DashboardSummaryResponse, LegacyCodeResponse } from "api-contracts";

const ADMIN_PATH = import.meta.env.VITE_PATH_ADMIN || "admin";

export const dashboardService = {
  // Retrieve the full admin dashboard status data
  getSummary: async (params?: { range?: DashboardRange }): Promise<DashboardSummaryResponse> => {
    return apiRequest(`/${ADMIN_PATH}/dashboard`, { params });
  },

  // Trigger cache recalculation
  syncCache: async (): Promise<LegacyCodeResponse> => {
    return apiRequest(`/${ADMIN_PATH}/dashboard/sync`, { method: "POST" });
  },
};
