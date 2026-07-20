import { describe, expect, it, vi } from "vitest";

const getSetting = vi.hoisted(() => vi.fn());
vi.mock("../../../src/modules/settings/infrastructure/setting.repository.ts", () => ({ getAutoExtendTimeSetting: getSetting }));
import { getAutoExtendTimeSetting } from "../../../src/modules/settings/application/setting.use-case.ts";

describe("setting use cases", () => {
  it("returns null when auto-extend is not configured", async () => {
    getSetting.mockResolvedValue(null);
    await expect(getAutoExtendTimeSetting()).resolves.toBeNull();
  });

  it("maps auto-extend values to minutes", async () => {
    getSetting.mockResolvedValue({ extend_time: 5, threshold_time: 2 });
    await expect(getAutoExtendTimeSetting()).resolves.toEqual({ extend_time_minutes: 5, threshold_minutes: 2 });
  });
});
