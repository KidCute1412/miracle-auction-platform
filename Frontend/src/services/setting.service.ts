import { apiRequest } from "./api.client.ts";
import type { AutoExtendTimeResponse } from "api-contracts";

export const settingService = {
  getAutoExtendTime: async (): Promise<AutoExtendTimeResponse> => {
    return apiRequest(`/settings/auto-extend-time`);
  },
};
