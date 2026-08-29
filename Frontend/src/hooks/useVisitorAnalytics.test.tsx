import { renderHook, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getVisitorSessionId, useVisitorAnalytics } from "./useVisitorAnalytics";

const record = vi.hoisted(() => vi.fn());
vi.mock("@/services/visitor-analytics.service", () => ({ visitorAnalyticsService: { record } }));

describe("useVisitorAnalytics", () => {
  beforeEach(() => {
    record.mockReset().mockResolvedValue({ success: true, data: { accepted: true } });
    localStorage.clear();
    Object.defineProperty(navigator, "doNotTrack", { configurable: true, value: "0" });
  });

  it("records a page view for an anonymous route", async () => {
    renderHook(() => useVisitorAnalytics(), {
      wrapper: ({ children }) => <MemoryRouter initialEntries={["/products?page=2"]}>{children}</MemoryRouter>,
    });
    await waitFor(() => expect(record).toHaveBeenCalledTimes(1));
    expect(record).toHaveBeenCalledWith(expect.objectContaining({ sessionId: expect.any(String), visitorId: expect.any(String), eventType: "page_view" }));
  });

  it("honors the browser Do Not Track preference", () => {
    Object.defineProperty(navigator, "doNotTrack", { configurable: true, value: "1" });
    renderHook(() => useVisitorAnalytics(), {
      wrapper: ({ children }) => <MemoryRouter initialEntries={["/"]}>{children}</MemoryRouter>,
    });
    expect(record).not.toHaveBeenCalled();
  });

  it("reuses a session within 30 minutes and rotates it after inactivity", () => {
    const first = getVisitorSessionId(1_000);
    expect(getVisitorSessionId(1_000 + 29 * 60 * 1000)).toBe(first);
    expect(getVisitorSessionId(1_000 + 61 * 60 * 1000)).not.toBe(first);
  });
});
