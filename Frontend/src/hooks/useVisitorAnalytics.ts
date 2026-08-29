import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import type { VisitorEventType } from "api-contracts";
import { visitorAnalyticsService } from "@/services/visitor-analytics.service";

const VISITOR_ID_KEY = "auction_visitor_id";
const SESSION_KEY = "auction_visitor_session";
const SESSION_TIMEOUT_MS = 30 * 60 * 1000;

interface StoredSession { id: string; lastActivityAt: number; }

function identifier(key: string): string {
  const existing = localStorage.getItem(key);
  if (existing) return existing;
  const id = crypto.randomUUID();
  localStorage.setItem(key, id);
  return id;
}

export function getVisitorSessionId(now = Date.now()): string {
  try {
    const existing = JSON.parse(localStorage.getItem(SESSION_KEY) || "null") as StoredSession | null;
    if (existing?.id && now - existing.lastActivityAt < SESSION_TIMEOUT_MS) {
      localStorage.setItem(SESSION_KEY, JSON.stringify({ ...existing, lastActivityAt: now }));
      return existing.id;
    }
  } catch { /* Replace malformed browser state below. */ }
  const session = { id: crypto.randomUUID(), lastActivityAt: now };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session.id;
}

function context() {
  let timezone: string | null = null;
  try { timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || null; } catch { timezone = null; }
  return {
    sessionId: getVisitorSessionId(), visitorId: identifier(VISITOR_ID_KEY),
    path: `${window.location.pathname}${window.location.search}`, pageTitle: document.title,
    referrer: document.referrer || null, timezone, language: navigator.language || null,
    screenWidth: window.screen.width, screenHeight: window.screen.height,
  };
}

export async function trackVisitorEvent(eventType: VisitorEventType, metadata: Record<string, string | number | boolean> = {}): Promise<void> {
  if (navigator.doNotTrack === "1" || window.location.pathname.startsWith("/admin")) return;
  await visitorAnalyticsService.record({ ...context(), eventType, metadata }).catch(() => {
    // Analytics must never interrupt the visitor's primary workflow.
  });
}

export function useVisitorAnalytics() {
  const location = useLocation();
  const lastPath = useRef<string | null>(null);
  useEffect(() => {
    const path = `${location.pathname}${location.search}`;
    if (path.startsWith("/admin") || lastPath.current === path) return;
    lastPath.current = path;
    trackVisitorEvent("page_view");
    const productMatch = location.pathname.match(/^\/product\/([^/]+)/);
    if (productMatch?.[1]) trackVisitorEvent("product_view", { productId: productMatch[1] });
    const query = new URLSearchParams(location.search).get("query") || new URLSearchParams(location.search).get("search");
    if (location.pathname.includes("/products/search") && query) trackVisitorEvent("search_submitted", { query: query.slice(0, 200) });
    if (location.pathname === "/accounts/login") trackVisitorEvent("auth_started");
    if (location.pathname === "/accounts/register") trackVisitorEvent("registration_started");
  }, [location.pathname, location.search]);
}
