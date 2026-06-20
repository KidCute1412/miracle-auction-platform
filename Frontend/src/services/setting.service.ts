import { apiRequest } from "./api.client.ts";

export const settingService = {
  getAutoExtendTime: async (): Promise<any> => {
    return apiRequest(`/settings/auto-extend-time`);
  },
};
