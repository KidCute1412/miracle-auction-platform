import { beforeEach, describe, expect, it, vi } from "vitest";

const deleteExpired = vi.hoisted(() => vi.fn());
vi.mock("../../../src/modules/visitor-analytics/infrastructure/visitor-analytics.repository.ts", () => ({
  visitorAnalyticsRepository: { deleteExpired },
}));
import { runVisitorAnalyticsRetention } from "../../../src/modules/visitor-analytics/application/visitor-retention.worker.ts";

describe("visitor analytics retention worker", () => {
  beforeEach(() => {
    deleteExpired.mockReset().mockResolvedValue({ sessions: 0 });
    process.env.VISITOR_ANALYTICS_RETENTION_DAYS = "90";
  });
  it("uses the configured retention window", async () => {
    await runVisitorAnalyticsRetention();
    expect(deleteExpired).toHaveBeenCalledWith(90);
  });
  it("contains cleanup failures without crashing the async worker", async () => {
    deleteExpired.mockRejectedValue(new Error("database unavailable"));
    await expect(runVisitorAnalyticsRetention()).resolves.toBeUndefined();
  });
});
