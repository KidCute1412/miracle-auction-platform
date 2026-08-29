import type { Response } from "express";
import type { AccountRequest } from "@/interfaces/request.interface.ts";
import { requireAuthenticatedUser } from "@/interfaces/request.interface.ts";
import { parseDevice } from "../application/device.service.ts";
import { normalizeClientIp, resolveGeoIp } from "../application/geoip.service.ts";
import { visitorAnalyticsRepository, type SessionFilters, type VisitorEventType } from "../infrastructure/visitor-analytics.repository.ts";

interface RecordBody {
  sessionId: string; visitorId: string; eventType: VisitorEventType; path: string;
  pageTitle?: string | null; referrer?: string | null; timezone?: string | null; language?: string | null;
  screenWidth?: number | null; screenHeight?: number | null; metadata: Record<string, string | number | boolean>;
}
interface SessionQuery extends Omit<SessionFilters, "from" | "to"> {
  range: "24h" | "7d" | "30d" | "90d" | "custom"; from?: Date; to?: Date;
}

const query = <T>(res: Response): T => res.locals.validated?.query as T;
const params = <T>(res: Response): T => res.locals.validated?.params as T;
const body = <T>(res: Response): T => res.locals.validated?.body as T;

function rangeDates(input: SessionQuery): Pick<SessionFilters, "from" | "to"> {
  if (input.range === "custom") return { from: input.from, to: input.to };
  const milliseconds = { "24h": 86_400_000, "7d": 604_800_000, "30d": 2_592_000_000, "90d": 7_776_000_000 }[input.range];
  return { from: new Date(Date.now() - milliseconds), to: new Date() };
}

function user(row: { users: { user_id: number; username: string; email: string } | null }) {
  return row.users ? { id: row.users.user_id, username: row.users.username, email: row.users.email } : null;
}

function sessionDto(row: Awaited<ReturnType<typeof visitorAnalyticsRepository.getSession>> extends infer T ? NonNullable<T> : never) {
  const durationSeconds = Math.max(0, Math.round((row.last_seen_at.getTime() - row.first_seen_at.getTime()) / 1000));
  return {
    sessionId: row.session_id, visitorId: row.visitor_id, user: user(row), ipAddress: row.ip_address,
    firstSeenAt: row.first_seen_at.toISOString(), lastSeenAt: row.last_seen_at.toISOString(), durationSeconds,
    landingPath: row.landing_path, exitPath: row.exit_path, referrer: row.referrer,
    pageViewCount: row.page_view_count, eventCount: row.event_count,
    location: { status: row.geo_status, source: row.geo_source, countryCode: row.country_code, countryName: row.country_name,
      region: row.region, regionCode: row.region_code, city: row.city, postalCode: row.postal_code,
      latitude: row.latitude ? Number(row.latitude) : null, longitude: row.longitude ? Number(row.longitude) : null,
      timezone: row.geo_timezone, checkedAt: row.geo_checked_at?.toISOString() ?? null },
    network: { asn: row.asn, ispName: row.isp_name, ispDomain: row.isp_domain, type: row.network_type,
      isAnonymous: row.is_anonymous, isAnycast: row.is_anycast, isHosting: row.is_hosting,
      isMobile: row.is_mobile, isSatellite: row.is_satellite },
    device: { browser: row.browser, operatingSystem: row.operating_system, type: row.device_type,
      screen: row.screen_width && row.screen_height ? `${row.screen_width}x${row.screen_height}` : null,
      language: row.language, timezone: row.timezone, userAgent: row.user_agent },
  };
}

export async function recordEvent(req: AccountRequest, res: Response): Promise<void> {
  const input = body<RecordBody>(res);
  const ipAddress = normalizeClientIp(req.ip || req.socket.remoteAddress);
  const [geo, device] = await Promise.all([resolveGeoIp(ipAddress), Promise.resolve(parseDevice(req.get("user-agent")))]);
  await visitorAnalyticsRepository.record({
    sessionId: input.sessionId, visitorId: input.visitorId, userId: req.user?.user_id ?? null,
    eventType: input.eventType, path: input.path, pageTitle: input.pageTitle || null,
    referrer: input.referrer || null, ipAddress, timezone: input.timezone || null,
    language: input.language || null, userAgent: req.get("user-agent")?.slice(0, 1000) || null,
    browser: device.browser, operatingSystem: device.operatingSystem, deviceType: device.deviceType,
    screenWidth: input.screenWidth ?? null, screenHeight: input.screenHeight ?? null,
    metadata: input.metadata,
    geo,
  });
  res.status(202).json({ success: true, data: { accepted: true } });
}

export async function listSessions(_req: AccountRequest, res: Response): Promise<void> {
  const input = query<SessionQuery>(res);
  const filters: SessionFilters = { ...input, ...rangeDates(input) };
  const result = await visitorAnalyticsRepository.listSessions(filters);
  res.json({
    success: true,
    data: result.rows.map((row) => sessionDto(row)),
    summary: result.summary,
    meta: { page: input.page, limit: input.limit, total: result.total, totalPages: Math.ceil(result.total / input.limit) },
  });
}

export async function getSession(req: AccountRequest, res: Response): Promise<void> {
  const { sessionId } = params<{ sessionId: string }>(res);
  const session = await visitorAnalyticsRepository.getSession(sessionId);
  if (!session) {
    res.status(404).json({ success: false, error: { code: "VISITOR_SESSION_NOT_FOUND", message: "Visitor session was not found", requestId: req.requestId } });
    return;
  }
  const actor = requireAuthenticatedUser(req);
  await visitorAnalyticsRepository.auditDetailView(actor.user_id, sessionId, req.requestId);
  res.json({ success: true, data: sessionDto(session) });
}

export async function getSessionEvents(_req: AccountRequest, res: Response): Promise<void> {
  const { sessionId } = params<{ sessionId: string }>(res);
  const { page, limit } = query<{ page: number; limit: number }>(res);
  const result = await visitorAnalyticsRepository.getSessionEvents(sessionId, page, limit);
  res.json({
    success: true,
    data: result.rows.map((row) => ({ id: row.id.toString(), eventType: row.event_type, path: row.path,
      pageTitle: row.page_title, referrer: row.referrer, metadata: row.metadata, createdAt: row.created_at.toISOString() })),
    meta: { page, limit, total: result.total, totalPages: Math.ceil(result.total / limit) },
  });
}

export async function getFacets(_req: AccountRequest, res: Response): Promise<void> {
  const result = await visitorAnalyticsRepository.facets();
  res.json({ success: true, data: {
    countries: result.countries.map((item) => ({ code: item.country_code!, name: item.country_name })),
    regions: result.regions.map((item) => item.region!),
    cities: result.cities.map((item) => item.city!),
    eventTypes: ["page_view", "product_view", "search_submitted", "favorite_toggled", "auth_started", "auth_succeeded", "registration_started", "bid_started"],
  } });
}
