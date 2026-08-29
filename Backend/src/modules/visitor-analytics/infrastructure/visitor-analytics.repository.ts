import { Prisma } from "@prisma/client";
import { prisma } from "@/infrastructure/database/prisma.client.ts";

export type VisitorEventType =
  | "page_view" | "product_view" | "search_submitted" | "favorite_toggled"
  | "auth_started" | "registration_started" | "bid_started";

export interface GeoData {
  status: "resolved" | "unavailable" | "private";
  source: string | null;
  countryCode: string | null; countryName: string | null;
  region: string | null; regionCode: string | null; city: string | null; postalCode: string | null;
  latitude: number | null; longitude: number | null; timezone: string | null;
  asn: string | null; ispName: string | null; ispDomain: string | null; networkType: string | null;
  isAnonymous: boolean | null; isAnycast: boolean | null; isHosting: boolean | null;
  isMobile: boolean | null; isSatellite: boolean | null;
  checkedAt: Date;
}

export interface RecordVisitorEventInput {
  sessionId: string; visitorId: string; userId: number | null; eventType: VisitorEventType;
  path: string; pageTitle: string | null; referrer: string | null; ipAddress: string;
  timezone: string | null; language: string | null; userAgent: string | null;
  browser: string | null; operatingSystem: string | null; deviceType: string | null;
  screenWidth: number | null; screenHeight: number | null; metadata: Prisma.InputJsonValue;
  geo: GeoData;
}

export interface SessionFilters {
  page: number; limit: number; search?: string; authenticated?: boolean;
  countryCode?: string; region?: string; city?: string; eventType?: VisitorEventType;
  risk?: "anonymous" | "hosting" | "mobile"; from?: Date; to?: Date;
  sort: "last_seen_desc" | "first_seen_desc" | "duration_desc" | "events_desc";
}

function sessionWhere(filters: SessionFilters): Prisma.visitor_sessionsWhereInput {
  const uuidSearch = filters.search && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(filters.search);
  return {
    last_seen_at: filters.from || filters.to ? { gte: filters.from, lte: filters.to } : undefined,
    user_id: filters.authenticated === undefined ? undefined : filters.authenticated ? { not: null } : null,
    country_code: filters.countryCode, region: filters.region, city: filters.city,
    is_anonymous: filters.risk === "anonymous" ? true : undefined,
    is_hosting: filters.risk === "hosting" ? true : undefined,
    is_mobile: filters.risk === "mobile" ? true : undefined,
    visitor_events: filters.eventType ? { some: { event_type: filters.eventType } } : undefined,
    OR: filters.search ? [
      { ip_address: { contains: filters.search } },
      ...(uuidSearch ? [{ visitor_id: { equals: filters.search } }, { session_id: { equals: filters.search } }] : []),
      { landing_path: { contains: filters.search, mode: "insensitive" } },
      { exit_path: { contains: filters.search, mode: "insensitive" } },
      { users: { is: { email: { contains: filters.search, mode: "insensitive" } } } },
      { users: { is: { username: { contains: filters.search, mode: "insensitive" } } } },
    ] : undefined,
  };
}

const orderBy: Record<SessionFilters["sort"], Prisma.visitor_sessionsOrderByWithRelationInput[]> = {
  last_seen_desc: [{ last_seen_at: "desc" }, { session_id: "desc" }],
  first_seen_desc: [{ first_seen_at: "desc" }, { session_id: "desc" }],
  events_desc: [{ event_count: "desc" }, { last_seen_at: "desc" }],
  duration_desc: [{ duration_seconds: "desc" }, { last_seen_at: "desc" }],
};

function summaryWhere(filters: SessionFilters): Prisma.Sql {
  const conditions: Prisma.Sql[] = [];
  if (filters.from) conditions.push(Prisma.sql`s.last_seen_at >= ${filters.from}`);
  if (filters.to) conditions.push(Prisma.sql`s.last_seen_at <= ${filters.to}`);
  if (filters.authenticated !== undefined) conditions.push(filters.authenticated ? Prisma.sql`s.user_id IS NOT NULL` : Prisma.sql`s.user_id IS NULL`);
  if (filters.countryCode) conditions.push(Prisma.sql`s.country_code = ${filters.countryCode}`);
  if (filters.region) conditions.push(Prisma.sql`s.region = ${filters.region}`);
  if (filters.city) conditions.push(Prisma.sql`s.city = ${filters.city}`);
  if (filters.risk === "anonymous") conditions.push(Prisma.sql`s.is_anonymous = true`);
  if (filters.risk === "hosting") conditions.push(Prisma.sql`s.is_hosting = true`);
  if (filters.risk === "mobile") conditions.push(Prisma.sql`s.is_mobile = true`);
  if (filters.eventType) conditions.push(Prisma.sql`EXISTS (SELECT 1 FROM visitor_events e WHERE e.session_id = s.session_id AND e.event_type = ${filters.eventType})`);
  if (filters.search) {
    const term = `%${filters.search}%`;
    conditions.push(Prisma.sql`(s.ip_address ILIKE ${term} OR s.visitor_id::text ILIKE ${term} OR s.session_id::text ILIKE ${term}
      OR s.landing_path ILIKE ${term} OR s.exit_path ILIKE ${term}
      OR EXISTS (SELECT 1 FROM users u WHERE u.user_id = s.user_id AND (u.email ILIKE ${term} OR u.username ILIKE ${term})))`);
  }
  return conditions.length ? Prisma.sql`WHERE ${Prisma.join(conditions, " AND ")}` : Prisma.empty;
}

export const visitorAnalyticsRepository = {
  async record(input: RecordVisitorEventInput) {
    const geo = input.geo;
    return prisma.$transaction(async (tx) => {
      const existing = await tx.visitor_sessions.findUnique({ where: { session_id: input.sessionId }, select: { visitor_id: true, first_seen_at: true } });
      if (existing && existing.visitor_id !== input.visitorId) throw new Error("SESSION_VISITOR_MISMATCH");
      const common = {
        user_id: input.userId, ip_address: input.ipAddress, exit_path: input.path,
        timezone: input.timezone, language: input.language, user_agent: input.userAgent,
        browser: input.browser, operating_system: input.operatingSystem, device_type: input.deviceType,
        screen_width: input.screenWidth, screen_height: input.screenHeight,
        country_code: geo.countryCode, country_name: geo.countryName, region: geo.region, region_code: geo.regionCode,
        city: geo.city, postal_code: geo.postalCode, latitude: geo.latitude, longitude: geo.longitude,
        geo_timezone: geo.timezone, geo_status: geo.status, geo_source: geo.source, geo_checked_at: geo.checkedAt,
        asn: geo.asn, isp_name: geo.ispName, isp_domain: geo.ispDomain, network_type: geo.networkType,
        is_anonymous: geo.isAnonymous, is_anycast: geo.isAnycast, is_hosting: geo.isHosting,
        is_mobile: geo.isMobile, is_satellite: geo.isSatellite,
      };
      if (existing) {
        await tx.visitor_sessions.update({ where: { session_id: input.sessionId }, data: {
          ...common, last_seen_at: new Date(), duration_seconds: Math.max(0, Math.round((Date.now() - existing.first_seen_at.getTime()) / 1000)), event_count: { increment: 1 },
          page_view_count: input.eventType === "page_view" ? { increment: 1 } : undefined,
        } });
      } else {
        await tx.visitor_sessions.create({ data: {
          session_id: input.sessionId, visitor_id: input.visitorId, landing_path: input.path,
          referrer: input.referrer, page_view_count: input.eventType === "page_view" ? 1 : 0,
          event_count: 1, ...common,
        } });
      }
      return tx.visitor_events.create({ data: {
        session_id: input.sessionId, visitor_id: input.visitorId, user_id: input.userId,
        event_type: input.eventType, path: input.path, page_title: input.pageTitle, referrer: input.referrer,
        ip_address: input.ipAddress, country_code: geo.countryCode, country_name: geo.countryName,
        region: geo.region, city: geo.city, timezone: geo.timezone || input.timezone,
        language: input.language, user_agent: input.userAgent, screen_width: input.screenWidth,
        screen_height: input.screenHeight, metadata: input.metadata,
      } });
    });
  },
  async listSessions(filters: SessionFilters) {
    const where = sessionWhere(filters);
    const summarySql = summaryWhere(filters);
    const [rows, summaryRows] = await Promise.all([
      prisma.visitor_sessions.findMany({ where, orderBy: orderBy[filters.sort], skip: (filters.page - 1) * filters.limit,
        take: filters.limit, include: { users: { select: { user_id: true, username: true, email: true } } } }),
      prisma.$queryRaw<Array<{ sessions: bigint; unique_visitors: bigint; authenticated_sessions: bigint; bounce_sessions: bigint; average_duration_seconds: number | null }>>(Prisma.sql`
        SELECT COUNT(*) sessions, COUNT(DISTINCT s.visitor_id) unique_visitors,
          COUNT(*) FILTER (WHERE s.user_id IS NOT NULL) authenticated_sessions,
          COUNT(*) FILTER (WHERE s.page_view_count <= 1) bounce_sessions,
          AVG(s.duration_seconds)::float average_duration_seconds
        FROM visitor_sessions s ${summarySql}`),
    ]);
    const summary = summaryRows[0];
    const total = Number(summary?.sessions ?? 0);
    return { rows, total, summary: { sessions: total, uniqueVisitors: Number(summary?.unique_visitors ?? 0),
      authenticatedSessions: Number(summary?.authenticated_sessions ?? 0), bounceSessions: Number(summary?.bounce_sessions ?? 0),
      averageDurationSeconds: Math.round(summary?.average_duration_seconds ?? 0) } };
  },
  getSession(sessionId: string) {
    return prisma.visitor_sessions.findUnique({ where: { session_id: sessionId }, include: { users: { select: { user_id: true, username: true, email: true } } } });
  },
  async getSessionEvents(sessionId: string, page: number, limit: number) {
    const where = { session_id: sessionId };
    const [rows, total] = await Promise.all([
      prisma.visitor_events.findMany({ where, orderBy: [{ created_at: "asc" }, { id: "asc" }], skip: (page - 1) * limit, take: limit }),
      prisma.visitor_events.count({ where }),
    ]);
    return { rows, total };
  },
  async facets() {
    const [countries, regions, cities] = await Promise.all([
      prisma.visitor_sessions.findMany({ where: { country_code: { not: null } }, distinct: ["country_code"], select: { country_code: true, country_name: true }, orderBy: { country_code: "asc" } }),
      prisma.visitor_sessions.findMany({ where: { region: { not: null } }, distinct: ["region"], select: { region: true }, orderBy: { region: "asc" } }),
      prisma.visitor_sessions.findMany({ where: { city: { not: null } }, distinct: ["city"], select: { city: true }, orderBy: { city: "asc" } }),
    ]);
    return { countries, regions, cities };
  },
  auditDetailView(actorId: number, sessionId: string, correlationId: string) {
    return prisma.admin_audit_logs.create({ data: { actor_id: actorId, action: "visitor.session.viewed", resource_type: "visitor_session", resource_id: sessionId, result: "success", correlation_id: correlationId } });
  },
  async deleteExpired(retentionDays: number) {
    const cutoff = new Date(Date.now() - retentionDays * 86_400_000);
    const sessions = await prisma.visitor_sessions.deleteMany({ where: { last_seen_at: { lt: cutoff } } });
    return { sessions: sessions.count };
  },
};
