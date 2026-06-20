import { apiRequest } from "./api.client.ts";

const ADMIN_PATH = import.meta.env.VITE_PATH_ADMIN || "admin";

export const dashboardService = {
  // Retrieve the full admin dashboard status data
  getSummary: async (params?: Record<string, any>): Promise<any> => {
    return apiRequest(`/${ADMIN_PATH}/dashboard`, { params });
  },
};
