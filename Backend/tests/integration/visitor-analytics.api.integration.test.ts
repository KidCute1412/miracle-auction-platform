import express from "express";
import cookieParser from "cookie-parser";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AccountRequest } from "../../src/interfaces/request.interface.ts";

const repository = vi.hoisted(() => ({
  record: vi.fn(), listSessions: vi.fn(), getSession: vi.fn(), getSessionEvents: vi.fn(),
  facets: vi.fn(), auditDetailView: vi.fn(),
}));
vi.mock("../../src/modules/visitor-analytics/infrastructure/visitor-analytics.repository.ts", () => ({
  visitorAnalyticsRepository: repository,
}));

import { adminVisitorAnalyticsRouter, publicVisitorAnalyticsRouter } from "../../src/modules/visitor-analytics/api/visitor-analytics.routes.ts";
const app = express();
app.set("trust proxy", 1);
app.use(express.json()); app.use(cookieParser());
app.use("/analytics", publicVisitorAnalyticsRouter);
app.use("/admin-direct", (req, _res, next) => {
  (req as AccountRequest).user = { user_id: 1, role: "admin", status: "active", auth_version: 0 };
  req.requestId = "323e4567-e89b-42d3-a456-426614174000";
  next();
});
app.use("/admin-direct/visitor-analytics", adminVisitorAnalyticsRouter);

const visitorId = "123e4567-e89b-42d3-a456-426614174000";
const sessionId = "223e4567-e89b-42d3-a456-426614174000";

describe("visitor analytics API integration", () => {
  beforeEach(() => vi.clearAllMocks());

  it("records an anonymous page view in a session", async () => {
    repository.record.mockResolvedValue({ id: 1n });
    const response = await request(app).post("/analytics/events").set("X-Forwarded-For", "203.0.113.10").send({
      sessionId, visitorId, eventType: "page_view", path: "/products?page=2", pageTitle: "Products",
      timezone: "Asia/Ho_Chi_Minh", language: "vi-VN", screenWidth: 1440, screenHeight: 900, metadata: {},
    });
    expect(response.status).toBe(202);
    expect(repository.record).toHaveBeenCalledWith(expect.objectContaining({
      sessionId, visitorId, userId: null, ipAddress: "203.0.113.10",
      geo: expect.objectContaining({ status: "unavailable", city: null, region: null }),
    }));
  });

  it("rejects malformed or unsafe event payloads before writing", async () => {
    const response = await request(app).post("/analytics/events").send({
      sessionId, visitorId, eventType: "page_view", path: "external", metadata: { password: "secret" },
    });
    expect(response.status).toBe(400);
    expect(repository.record).not.toHaveBeenCalled();
  });

  it("returns filtered sessions with summary and clear pagination", async () => {
    repository.listSessions.mockResolvedValue({
      rows: [], total: 0,
      summary: { sessions: 0, uniqueVisitors: 0, authenticatedSessions: 0, bounceSessions: 0, averageDurationSeconds: 0 },
    });
    const response = await request(app).get("/admin-direct/visitor-analytics/sessions?page=1&limit=25&range=7d&authenticated=false");
    expect(response.status).toBe(200);
    expect(response.body.meta).toEqual({ page: 1, limit: 25, total: 0, totalPages: 0 });
    expect(response.body.summary.uniqueVisitors).toBe(0);
    expect(repository.listSessions).toHaveBeenCalledWith(expect.objectContaining({ authenticated: false, page: 1, limit: 25 }));
  });

  it("rejects invalid page sizes and incomplete custom ranges", async () => {
    await request(app).get("/admin-direct/visitor-analytics/sessions?limit=1000").expect(400);
    await request(app).get("/admin-direct/visitor-analytics/sessions?range=custom").expect(400);
    expect(repository.listSessions).not.toHaveBeenCalled();
  });

  it("returns 404 for a missing session detail", async () => {
    repository.getSession.mockResolvedValue(null);
    const response = await request(app).get(`/admin-direct/visitor-analytics/sessions/${sessionId}`);
    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe("VISITOR_SESSION_NOT_FOUND");
  });

  it("returns a session detail and audits access", async () => {
    repository.getSession.mockResolvedValue({
      session_id: sessionId, visitor_id: visitorId, user_id: null, users: null, ip_address: "203.0.113.10",
      first_seen_at: new Date("2026-08-29T00:00:00Z"), last_seen_at: new Date("2026-08-29T00:05:00Z"),
      landing_path: "/", exit_path: "/products", referrer: null, page_view_count: 2, event_count: 2,
      country_code: "VN", country_name: "Vietnam", region: "Gia Lai", region_code: "30", city: "Chu Se",
      postal_code: null, latitude: null, longitude: null, geo_timezone: "Asia/Ho_Chi_Minh",
      geo_status: "resolved", geo_source: "historical", geo_checked_at: new Date("2026-08-29T00:00:00Z"),
      asn: "AS7552", isp_name: "Viettel", isp_domain: null, network_type: "isp",
      is_anonymous: false, is_anycast: false, is_hosting: false, is_mobile: true, is_satellite: false,
      timezone: "Asia/Ho_Chi_Minh", language: "vi-VN", user_agent: "Mozilla/5.0",
      browser: "Chrome", operating_system: "Android", device_type: "mobile", screen_width: 1080, screen_height: 2400,
    });
    repository.auditDetailView.mockResolvedValue({});
    const response = await request(app).get(`/admin-direct/visitor-analytics/sessions/${sessionId}`);
    expect(response.status).toBe(200);
    expect(response.body.data.location.city).toBe("Chu Se");
    expect(repository.auditDetailView).toHaveBeenCalledWith(1, sessionId, expect.any(String));
  });

  it("returns timeline pages and rejects invalid timeline pagination", async () => {
    repository.getSessionEvents.mockResolvedValue({ rows: [], total: 0 });
    await request(app).get(`/admin-direct/visitor-analytics/sessions/${sessionId}/events?page=1&limit=50`).expect(200);
    await request(app).get(`/admin-direct/visitor-analytics/sessions/${sessionId}/events?limit=1000`).expect(400);
  });

  it("returns available location and event facets", async () => {
    repository.facets.mockResolvedValue({
      countries: [{ country_code: "VN", country_name: "Vietnam" }],
      regions: [{ region: "Gia Lai" }], cities: [{ city: "Chu Se" }],
    });
    const response = await request(app).get("/admin-direct/visitor-analytics/facets");
    expect(response.status).toBe(200);
    expect(response.body.data.countries).toEqual([{ code: "VN", name: "Vietnam" }]);
  });
});
