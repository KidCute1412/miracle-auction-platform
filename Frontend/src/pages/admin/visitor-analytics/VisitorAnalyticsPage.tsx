import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Activity, Clock3, Copy, Eye, FilterX, Globe2, RefreshCw, Search, UserCheck, Users } from "lucide-react";
import type { VisitorEventType, VisitorSession, VisitorSessionsResponse, VisitorTimelineEvent } from "api-contracts";
import { visitorAnalyticsService, type VisitorSessionFilters } from "@/services/visitor-analytics.service";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import PaginationComponent from "@/components/common/Pagination";

const dateTime = new Intl.DateTimeFormat("en-GB", { dateStyle: "short", timeStyle: "medium" });
const eventLabels: Record<VisitorEventType, string> = {
  page_view: "Page view", product_view: "Product view", search_submitted: "Search submitted",
  favorite_toggled: "Favorite toggled", auth_started: "Login started", auth_succeeded: "Login succeeded",
  registration_started: "Registration started", bid_started: "Bid started",
};
const rangeOptions = [["24h", "Last 24 hours"], ["7d", "Last 7 days"], ["30d", "Last 30 days"], ["90d", "Last 90 days"], ["custom", "Custom range"]] as const;

function duration(seconds: number) {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
}
function Metric({ icon: Icon, label, value }: { icon: typeof Globe2; label: string; value: string | number }) {
  return <div className="rounded-xl border border-border bg-glass p-4 shadow-sm"><Icon className="mb-3 size-5 text-accent" /><p className="font-heading text-2xl font-bold">{value}</p><p className="mt-1 text-xs text-muted-foreground">{label}</p></div>;
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><dt className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</dt><dd className="mt-1 break-words text-sm">{children || "—"}</dd></div>;
}

function SessionDetail({ sessionId, open, onOpenChange }: { sessionId: string | null; open: boolean; onOpenChange: (open: boolean) => void }) {
  const [session, setSession] = useState<VisitorSession | null>(null);
  const [events, setEvents] = useState<VisitorTimelineEvent[]>([]);
  const [eventPage, setEventPage] = useState(1);
  const [eventPages, setEventPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !sessionId) return;
    let active = true;
    setLoading(true); setError(null); setEvents([]); setEventPage(1);
    Promise.all([visitorAnalyticsService.getSession(sessionId), visitorAnalyticsService.getTimeline(sessionId, 1, 50)])
      .then(([detail, timeline]) => { if (active) { setSession(detail.data); setEvents(timeline.data); setEventPages(timeline.meta.totalPages); } })
      .catch((cause) => { if (active) setError(cause instanceof Error ? cause.message : "Could not load session details"); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [open, sessionId]);

  const loadMore = async () => {
    if (!sessionId || eventPage >= eventPages) return;
    const next = eventPage + 1;
    const result = await visitorAnalyticsService.getTimeline(sessionId, next, 50);
    setEvents((current) => [...current, ...result.data]); setEventPage(next);
  };

  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent>
    <div className="border-b border-border bg-gradient-to-r from-accent/15 via-card to-card px-6 py-5 pr-14">
      <DialogTitle className="font-heading text-2xl font-bold">Visitor Session Details</DialogTitle>
      <DialogDescription className="mt-1 text-sm text-muted-foreground">Review the visitor identity, device, and recorded activity.</DialogDescription>
    </div>
    {loading && <div className="p-12 text-center text-muted-foreground">Loading session details...</div>}
    {error && <div role="alert" className="m-6 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-destructive">{error}</div>}
    {!loading && session && <div className="space-y-6 p-6">
      <div className="grid gap-5 rounded-xl border border-border bg-muted/20 p-4 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="Visitor ID"><span className="font-mono text-xs">{session.visitorId}</span></Field>
        <Field label="Session ID"><span className="font-mono text-xs">{session.sessionId}</span></Field>
        <Field label="Account">{session.user ? `${session.user.username} · ${session.user.email}` : "Anonymous"}</Field>
        <Field label="Duration">{duration(session.durationSeconds)}</Field>
      </div>
      <section className="rounded-xl border border-border p-4"><h3 className="mb-4 font-heading font-semibold">IP & Device</h3>
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="IP Address"><span className="inline-flex items-center gap-2 font-mono">{session.ipAddress}<button aria-label="Copy IP" onClick={() => void navigator.clipboard.writeText(session.ipAddress)} className="text-muted-foreground hover:text-accent"><Copy className="size-3.5" /></button></span></Field>
          <Field label="Device">{session.device.type}</Field><Field label="Operating System">{session.device.operatingSystem}</Field><Field label="Browser">{session.device.browser}</Field>
          <Field label="Screen">{session.device.screen}</Field><Field label="Language">{session.device.language}</Field><Field label="Timezone">{session.device.timezone}</Field>
        </dl>
      </section>
      <section className="rounded-xl border border-border p-4"><h3 className="mb-4 flex items-center gap-2 font-heading font-semibold"><Activity className="size-4 text-accent" /> Timeline ({session.eventCount} events)</h3>
        <ol className="relative ml-2 space-y-4 border-l border-border pl-5">
          {events.map((event) => <li key={event.id} className="relative"><span className="absolute -left-[25px] top-1.5 size-2 rounded-full bg-accent shadow-gold-glow" />
            <div className="flex flex-wrap items-center justify-between gap-2"><span className="font-medium">{eventLabels[event.eventType]}</span><time className="text-xs text-muted-foreground">{dateTime.format(new Date(event.createdAt))}</time></div>
            <p className="mt-1 break-all text-sm text-muted-foreground">{event.path}</p>
            {Object.keys(event.metadata).length > 0 && <pre className="mt-2 overflow-x-auto rounded bg-muted p-2 text-xs">{JSON.stringify(event.metadata, null, 2)}</pre>}
          </li>)}
        </ol>
        {eventPage < eventPages && <button onClick={() => void loadMore()} className="mt-5 w-full rounded-lg border border-border py-2 text-sm hover:border-accent">Load More Events</button>}
      </section>
      <details className="rounded-xl border border-border p-4"><summary className="cursor-pointer font-medium">Full User-Agent and Referrer</summary><p className="mt-3 break-all font-mono text-xs text-muted-foreground">{session.device.userAgent || "—"}</p><p className="mt-2 break-all text-xs text-muted-foreground">{session.referrer || "Direct traffic"}</p></details>
    </div>}
  </DialogContent></Dialog>;
}

export default function VisitorAnalyticsPage() {
  const [params, setParams] = useSearchParams();
  const [response, setResponse] = useState<VisitorSessionsResponse | null>(null);
  const [draftSearch, setDraftSearch] = useState(params.get("search") || "");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const page = Math.max(1, Number(params.get("page") || 1));
  const limit = ([25, 50, 100].includes(Number(params.get("limit"))) ? Number(params.get("limit")) : 25) as 25 | 50 | 100;

  const filters = useMemo<VisitorSessionFilters>(() => ({
    page, limit, search: params.get("search") || undefined,
    range: (params.get("range") as VisitorSessionFilters["range"]) || "7d",
    authenticated: params.get("authenticated") === null ? undefined : params.get("authenticated") === "true",
    eventType: (params.get("eventType") as VisitorEventType) || undefined,
    sort: (params.get("sort") as VisitorSessionFilters["sort"]) || "last_seen_desc",
    from: params.get("from") || undefined, to: params.get("to") || undefined,
  }), [limit, page, params]);

  const update = (key: string, value?: string) => setParams((current) => {
    const next = new URLSearchParams(current); if (value) next.set(key, value); else next.delete(key);
    if (key !== "page") next.set("page", "1"); return next;
  });
  const load = useCallback(async () => {
    if (filters.range === "custom" && (!filters.from || !filters.to)) {
      setLoading(false);
      return;
    }
    setLoading(true); setError(null);
    try { setResponse(await visitorAnalyticsService.list(filters)); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Could not load visitor sessions"); }
    finally { setLoading(false); }
  }, [filters]);
  useEffect(() => { void load(); }, [load]);

  const activeFilters = [["search", filters.search], ["authenticated", filters.authenticated === undefined ? undefined : filters.authenticated ? "Authenticated" : "Anonymous"],
    ["eventType", filters.eventType ? eventLabels[filters.eventType] : undefined]] as const;
  const summary = response?.summary;
  const totalPages = response?.meta.totalPages || 0;
  const start = response && response.meta.total > 0 ? (page - 1) * limit + 1 : 0;
  const end = response ? Math.min(page * limit, response.meta.total) : 0;

  return <section className="space-y-5" aria-labelledby="visitor-title">
    <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="font-mono text-xs uppercase tracking-[0.25em] text-accent">Traffic intelligence</p><h1 id="visitor-title" className="font-heading text-3xl font-bold">Visitor Analytics</h1><p className="mt-1 text-sm text-muted-foreground">Monitor visitor sessions, IP addresses, devices, and journeys.</p></div>
      <button onClick={() => void load()} disabled={loading} className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm hover:border-accent disabled:opacity-50"><RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} /> Refresh</button></div>
    <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 xl:grid-cols-5">
      <Metric icon={Globe2} label="Sessions" value={summary?.sessions ?? "—"} /><Metric icon={Users} label="Unique Visitors" value={summary?.uniqueVisitors ?? "—"} />
      <Metric icon={UserCheck} label="Authenticated" value={summary?.authenticatedSessions ?? "—"} /><Metric icon={Eye} label="Bounce Sessions" value={summary?.bounceSessions ?? "—"} />
      <div className="col-span-2 sm:col-span-1"><Metric icon={Clock3} label="Average Duration" value={summary ? duration(summary.averageDurationSeconds) : "—"} /></div>
    </div>
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <form className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-[minmax(260px,1fr)_repeat(5,minmax(140px,auto))]" onSubmit={(event) => { event.preventDefault(); update("search", draftSearch.trim() || undefined); }}>
        <label className="relative sm:col-span-2 lg:col-span-3 xl:col-span-1"><span className="sr-only">Search sessions</span><Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" /><input value={draftSearch} onChange={(event) => setDraftSearch(event.target.value)} placeholder="IP, visitor ID, username, email, URL..." className="h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm focus-visible:ring-2 focus-visible:ring-ring" /></label>
        <Select value={filters.range} onValueChange={(value) => update("range", value)}><SelectTrigger className="w-full"><SelectValue /></SelectTrigger><SelectContent>{rangeOptions.map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent></Select>
        <Select value={filters.authenticated === undefined ? "all" : filters.authenticated ? "true" : "false"} onValueChange={(value) => update("authenticated", value === "all" ? undefined : value)}><SelectTrigger className="w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All Visitors</SelectItem><SelectItem value="true">Authenticated</SelectItem><SelectItem value="false">Anonymous</SelectItem></SelectContent></Select>
        <Select value={filters.eventType || "all"} onValueChange={(value) => update("eventType", value === "all" ? undefined : value)}><SelectTrigger className="w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All Events</SelectItem>{Object.entries(eventLabels).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent></Select>
        <Select value={filters.sort} onValueChange={(value) => update("sort", value)}><SelectTrigger className="w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="last_seen_desc">Recently Active</SelectItem><SelectItem value="first_seen_desc">Recently Started</SelectItem><SelectItem value="duration_desc">Longest Duration</SelectItem><SelectItem value="events_desc">Most Events</SelectItem></SelectContent></Select>
        <button className="h-9 rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground sm:col-span-2 lg:col-span-3 xl:col-span-1 cursor-pointer hover:opacity-90 transition-opacity">Search</button>
      </form>
      {filters.range === "custom" && <div className="mt-3 flex flex-wrap gap-3"><label className="text-xs text-muted-foreground">From<input type="datetime-local" value={filters.from || ""} onChange={(event) => update("from", event.target.value)} className="ml-2 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground" /></label><label className="text-xs text-muted-foreground">To<input type="datetime-local" value={filters.to || ""} onChange={(event) => update("to", event.target.value)} className="ml-2 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground" /></label></div>}
      {activeFilters.some(([, value]) => value) && <div className="mt-3 flex flex-wrap items-center gap-2">{activeFilters.filter(([, value]) => value).map(([key, value]) => <button key={key} onClick={() => update(key)} className="rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs text-accent">{key}: {String(value)} ×</button>)}<button onClick={() => { setDraftSearch(""); setParams({ range: "7d", page: "1" }); }} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"><FilterX className="size-3.5" /> Clear All</button></div>}
    </div>
    {error && <div role="alert" className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-destructive">{error}</div>}
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto"><table className="w-full min-w-[1100px] text-left text-sm">
      <thead className="border-b border-border bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground"><tr><th className="px-4 py-3">Activity</th><th className="px-4 py-3">Visitor / Account</th><th className="px-4 py-3">IP Address</th><th className="px-4 py-3">Journey</th><th className="px-4 py-3">Device</th><th className="px-4 py-3 text-right">Events</th></tr></thead>
      <tbody className="divide-y divide-border">{loading && <tr><td colSpan={6} className="px-4 py-14 text-center text-muted-foreground">Loading visitor sessions...</td></tr>}
        {!loading && response?.data.length === 0 && <tr><td colSpan={6} className="px-4 py-14 text-center text-muted-foreground">No sessions match the current filters.</td></tr>}
        {!loading && response?.data.map((item) => <tr key={item.sessionId} tabIndex={0} role="button" aria-label={`Open session ${item.sessionId}`} onClick={() => setSelectedSession(item.sessionId)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); setSelectedSession(item.sessionId); } }} className="cursor-pointer align-top outline-none transition-colors hover:bg-muted/35 focus-visible:bg-accent/10">
          <td className="whitespace-nowrap px-4 py-3"><div className="font-medium">{dateTime.format(new Date(item.lastSeenAt))}</div><div className="mt-1 text-xs text-muted-foreground">{duration(item.durationSeconds)}</div></td>
          <td className="px-4 py-3"><div className="font-mono text-xs">{item.visitorId.slice(0, 8)}…</div>{item.user ? <><div className="mt-1 font-medium">{item.user.username}</div><div className="text-xs text-muted-foreground">{item.user.email}</div></> : <span className="mt-2 inline-block rounded-full bg-muted px-2 py-0.5 text-xs">Anonymous</span>}</td>
          <td className="px-4 py-3 font-mono">{item.ipAddress}</td>
          <td className="max-w-xs px-4 py-3"><div className="truncate font-medium" title={item.landingPath}>{item.landingPath}</div><div className="mt-1 truncate text-xs text-muted-foreground" title={item.exitPath}>→ {item.exitPath}</div></td>
          <td className="px-4 py-3"><div>{[item.device.type, item.device.operatingSystem].filter(Boolean).join(" · ") || "—"}</div><div className="mt-1 text-xs text-muted-foreground">{item.device.browser || "Unknown browser"} · {item.device.screen || "—"}</div></td>
          <td className="px-4 py-3 text-right"><div className="font-semibold">{item.eventCount}</div><div className="text-xs text-muted-foreground">{item.pageViewCount} pages</div></td>
        </tr>)}</tbody></table></div>

      {/* Mobile/Tablet Card View */}
      <div className="lg:hidden divide-y divide-border">
        {loading && (
          <div className="p-8 text-center text-muted-foreground text-sm">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent mx-auto mb-2" />
            Loading visitor sessions...
          </div>
        )}
        {!loading && response?.data.length === 0 && (
          <div className="p-8 text-center text-muted-foreground text-sm">
            No sessions match the current filters.
          </div>
        )}
        {!loading && response?.data.map((item) => (
          <div
            key={item.sessionId}
            className="p-4 space-y-3 hover:bg-muted/10 transition-colors text-left"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="font-semibold text-sm text-foreground">
                  {dateTime.format(new Date(item.lastSeenAt))}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  Duration: <span className="font-mono text-accent">{duration(item.durationSeconds)}</span>
                </div>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-accent/15 text-accent border border-accent/30">
                  {item.eventCount} events
                </span>
                <div className="text-[10px] text-muted-foreground mt-0.5">
                  {item.pageViewCount} pages
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-muted/30 p-2.5 rounded-lg border border-border/50">
              <div>
                <span className="text-muted-foreground block text-[10px] uppercase font-bold tracking-wider">Account / Visitor</span>
                {item.user ? (
                  <div className="font-medium text-foreground truncate mt-0.5">
                    {item.user.username} <span className="text-muted-foreground text-[11px]">({item.user.email})</span>
                  </div>
                ) : (
                  <div className="font-mono text-muted-foreground mt-0.5">
                    {item.visitorId.slice(0, 12)}… <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded ml-1">Anon</span>
                  </div>
                )}
              </div>

              <div>
                <span className="text-muted-foreground block text-[10px] uppercase font-bold tracking-wider">IP Address</span>
                <div className="font-mono text-foreground mt-0.5 flex items-center gap-1.5">
                  <span>IP: {item.ipAddress}</span>
                  <button
                    type="button"
                    aria-label="Copy IP"
                    onClick={() => {
                      void navigator.clipboard.writeText(item.ipAddress);
                    }}
                    className="text-muted-foreground hover:text-accent p-0.5 rounded cursor-pointer"
                  >
                    <Copy className="size-3" />
                  </button>
                </div>
              </div>
            </div>

            <div className="text-xs space-y-1 text-muted-foreground">
              <div className="truncate">
                <span className="font-medium text-foreground">Journey: </span>
                <span title={item.landingPath}>{item.landingPath}</span>
                <span className="mx-1 text-accent">→</span>
                <span title={item.exitPath}>{item.exitPath}</span>
              </div>
              <div className="text-[11px] truncate">
                {[item.device.type, item.device.operatingSystem, item.device.browser].filter(Boolean).join(" · ") || "—"}
              </div>
            </div>

            <div className="pt-2 border-t border-border/50 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedSession(item.sessionId)}
                className="text-xs font-semibold text-accent hover:underline cursor-pointer flex items-center gap-1 py-1"
              >
                Inspect Session Timeline →
              </button>
            </div>
          </div>
        ))}
      </div>
      {!loading && response && <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3 text-sm"><span className="text-muted-foreground">Showing {start}–{end} of {response.meta.total}</span><Select value={String(limit)} onValueChange={(value) => update("limit", value)}><SelectTrigger size="sm"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="25">25 per page</SelectItem><SelectItem value="50">50 per page</SelectItem><SelectItem value="100">100 per page</SelectItem></SelectContent></Select></div>}
    </div>
    {!loading && response && <PaginationComponent numberOfPages={totalPages} currentPage={page} isPageLoading={loading} />}
    <p className="text-xs text-muted-foreground">Browsers with Do Not Track enabled are not recorded.</p>
    <SessionDetail sessionId={selectedSession} open={selectedSession !== null} onOpenChange={(open) => { if (!open) setSelectedSession(null); }} />
  </section>;
}
