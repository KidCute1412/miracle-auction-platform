import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import VisitorAnalyticsPage from "./VisitorAnalyticsPage";

const service = vi.hoisted(() => ({
  list: vi.fn(), getSession: vi.fn(), getTimeline: vi.fn(),
}));
vi.mock("@/services/visitor-analytics.service", () => ({ visitorAnalyticsService: service }));

const session = {
  sessionId: "223e4567-e89b-42d3-a456-426614174000", visitorId: "123e4567-e89b-42d3-a456-426614174000",
  user: null, ipAddress: "203.0.113.10", firstSeenAt: "2026-08-29T00:00:00.000Z",
  lastSeenAt: "2026-08-29T00:05:00.000Z", durationSeconds: 300, landingPath: "/",
  exitPath: "/products", referrer: null, pageViewCount: 2, eventCount: 2,
  location: { status: "resolved", source: "historical", countryCode: "VN", countryName: "Vietnam",
    region: "Gia Lai", regionCode: "30", city: "Chu Se", postalCode: null, latitude: 13.69,
    longitude: 108.08, timezone: "Asia/Ho_Chi_Minh", checkedAt: "2026-08-29T00:00:00.000Z" },
  network: { asn: "AS7552", ispName: "Viettel", ispDomain: null, type: "isp", isAnonymous: false,
    isAnycast: false, isHosting: false, isMobile: true, isSatellite: false },
  device: { browser: "Chrome", operatingSystem: "Android", type: "mobile", screen: "1080x2400",
    language: "vi-VN", timezone: "Asia/Ho_Chi_Minh", userAgent: "Mozilla/5.0" },
};

describe("VisitorAnalyticsPage", () => {
  beforeEach(() => {
    service.list.mockResolvedValue({ success: true, data: [session],
      summary: { sessions: 1, uniqueVisitors: 1, authenticatedSessions: 0, bounceSessions: 0, averageDurationSeconds: 300 },
      meta: { page: 1, limit: 25, total: 1, totalPages: 1 } });
    service.getSession.mockResolvedValue({ success: true, data: session });
    service.getTimeline.mockResolvedValue({ success: true, data: [{ id: "1", eventType: "page_view", path: "/",
      pageTitle: "Home", referrer: null, metadata: {}, createdAt: "2026-08-29T00:00:00.000Z" }],
      meta: { page: 1, limit: 50, total: 1, totalPages: 1 } });
  });

  it("uses customized comboboxes and opens a complete session detail dialog", async () => {
    const { container } = render(<MemoryRouter><VisitorAnalyticsPage /></MemoryRouter>);
    await screen.findByText("203.0.113.10");
    expect(container.querySelector("select:not([aria-hidden='true'])")).toBeNull();
    expect(screen.getAllByRole("combobox").length).toBeGreaterThan(3);
    fireEvent.click(screen.getByRole("button", { name: /Open session/ }));
    await screen.findByRole("dialog");
    await waitFor(() => expect(service.getSession).toHaveBeenCalledWith(session.sessionId));
    expect(screen.getByText("Visitor Session Details")).toBeTruthy();
    expect(screen.getByText("IP & Device")).toBeTruthy();
    expect(screen.queryByText("Approximate Location")).toBeNull();
    expect(screen.queryByText("ISP")).toBeNull();
    expect(screen.getAllByText("Page view").length).toBeGreaterThan(0);
  });
});
