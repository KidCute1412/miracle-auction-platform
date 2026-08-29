import type {
  VisitorEventType, VisitorSessionResponse,
  VisitorSessionsResponse, VisitorTimelineResponse,
} from "api-contracts";
import { ADMIN_PATH } from "@/lib/admin-path";
import { apiRequest } from "./api.client";

export interface VisitorEventPayload {
  sessionId: string; visitorId: string; eventType: VisitorEventType; path: string;
  pageTitle: string; referrer: string | null; timezone: string | null; language: string | null;
  screenWidth: number; screenHeight: number; metadata: Record<string, string | number | boolean>;
}
export interface VisitorSessionFilters {
  page?: number; limit?: 25 | 50 | 100; search?: string; range?: "24h" | "7d" | "30d" | "90d" | "custom";
  authenticated?: boolean; eventType?: VisitorEventType;
  sort?: "last_seen_desc" | "first_seen_desc" | "duration_desc" | "events_desc";
  from?: string; to?: string;
}

export const visitorAnalyticsService = {
  record(payload: VisitorEventPayload): Promise<{ success: true; data: { accepted: true } }> {
    return apiRequest("/analytics/events", { method: "POST", body: payload });
  },
  list(filters: VisitorSessionFilters): Promise<VisitorSessionsResponse> {
    return apiRequest(`/${ADMIN_PATH}/visitor-analytics/sessions`, { params: {
      page: filters.page, limit: filters.limit, search: filters.search, range: filters.range,
      authenticated: filters.authenticated, eventType: filters.eventType,
      sort: filters.sort, from: filters.from, to: filters.to,
    } });
  },
  getSession(sessionId: string): Promise<VisitorSessionResponse> {
    return apiRequest(`/${ADMIN_PATH}/visitor-analytics/sessions/${sessionId}`);
  },
  getTimeline(sessionId: string, page = 1, limit = 50): Promise<VisitorTimelineResponse> {
    return apiRequest(`/${ADMIN_PATH}/visitor-analytics/sessions/${sessionId}/events`, { params: { page, limit } });
  },
};
