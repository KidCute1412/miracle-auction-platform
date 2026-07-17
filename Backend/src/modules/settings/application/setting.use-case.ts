import * as settingRepository from "../infrastructure/setting.repository.ts";

// Retrieve the auto extend bidding time settings formatted
export async function getAutoExtendTimeSetting() {
  const result = await settingRepository.getAutoExtendTimeSetting();
  if (!result) return null;
  return {
    extend_time_minutes: result.extend_time,
    threshold_minutes: result.threshold_time,
  };
}
