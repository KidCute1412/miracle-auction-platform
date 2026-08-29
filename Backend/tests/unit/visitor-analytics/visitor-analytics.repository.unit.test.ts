import { beforeEach, describe, expect, it, vi } from "vitest";

const transaction = vi.hoisted(() => vi.fn());
vi.mock("../../../src/infrastructure/database/prisma.client.ts", () => ({
  prisma: { $transaction: transaction },
}));

import { visitorAnalyticsRepository, type RecordVisitorEventInput } from "../../../src/modules/visitor-analytics/infrastructure/visitor-analytics.repository.ts";

const geo: RecordVisitorEventInput["geo"] = {
  status: "unavailable", source: null, countryCode: null, countryName: null,
  region: null, regionCode: null, city: null, postalCode: null, latitude: null,
  longitude: null, timezone: null, asn: null, ispName: null, ispDomain: null,
  networkType: null, isAnonymous: null, isAnycast: null, isHosting: null,
  isMobile: null, isSatellite: null, checkedAt: new Date(),
};

function input(userId: number | null): RecordVisitorEventInput {
  return {
    sessionId: "223e4567-e89b-42d3-a456-426614174000",
    visitorId: "123e4567-e89b-42d3-a456-426614174000",
    userId, eventType: "page_view", path: "/", pageTitle: "Home", referrer: null,
    ipAddress: "203.0.113.10", timezone: null, language: null, userAgent: null,
    browser: null, operatingSystem: null, deviceType: null, screenWidth: null,
    screenHeight: null, metadata: {}, geo,
  };
}

describe("visitor analytics session identity", () => {
  const update = vi.fn();

  beforeEach(() => {
    update.mockReset().mockResolvedValue({});
    transaction.mockReset().mockImplementation(async (work) => work({
      visitor_sessions: {
        findUnique: vi.fn().mockResolvedValue({
          visitor_id: input(null).visitorId,
          first_seen_at: new Date(),
        }),
        update,
      },
      visitor_events: { create: vi.fn().mockResolvedValue({ id: 1n }) },
    }));
  });

  it("promotes a session when an authenticated event arrives", async () => {
    await visitorAnalyticsRepository.record(input(42));
    expect(update).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ user_id: 42 }),
    }));
  });

  it("does not downgrade an identified session when an anonymous event arrives late", async () => {
    await visitorAnalyticsRepository.record(input(null));
    expect(update).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ user_id: undefined }),
    }));
  });
});
