import { useEffect, useMemo, useState } from "react";
import { Activity, AlertTriangle, Database, Download, Radio, RefreshCw, ShieldCheck, ShoppingBag, Users } from "lucide-react";
import type { AuditLog, DashboardDlqItem, DashboardRange } from "api-contracts";
import { BidDensityHeatmap } from "@/components/admin/charts/BidDensityHeatmap";
import { CategoryDistributionChart } from "@/components/admin/charts/CategoryDistributionChart";
import { VanguardAreaChart, type DataPoint } from "@/components/admin/charts/VanguardAreaChart";
import { useAdminDashboardSocket } from "@/hooks/useAdminDashboardSocket";
import { useDashboardData } from "@/hooks/useDashboardData";
import { dashboardService } from "@/services/dashboard.service";

const ranges: Record<DashboardRange, string> = {
  "7d": "Last 7 days", "30d": "Last 30 days", "3m": "Last 3 months", "6m": "Last 6 months", "1y": "Last year",
};
const colors = ["#F59E0B", "#D97706", "#B45309", "#78716C", "#A8A29E", "#FBBF24"];
const formatVnd = (value: number) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(value);

export default function DashboardPage() {
  const [range, setRange] = useState<DashboardRange>("6m");
  const [tab, setTab] = useState<"overview" | "operations" | "audit">("overview");
  const [chartTab, setChartTab] = useState<"overview" | "revenue" | "bids" | "overlay">("revenue");
  const [socketVersion, setSocketVersion] = useState(0);
  const socketState = useAdminDashboardSocket((event) => setSocketVersion(event.version));
  const { summary, operations, loading, error, refresh } = useDashboardData(range, socketState !== "connected");
  const [sync, setSync] = useState<{ baseline: number; state: "waiting" | "delayed" } | null>(null);
  const [audit, setAudit] = useState<AuditLog[]>([]);
  const [dlq, setDlq] = useState<DashboardDlqItem[]>([]);
  const [secondaryError, setSecondaryError] = useState<string | null>(null);

  useEffect(() => {
    if (socketVersion > 0) void refresh(true);
  }, [socketVersion, refresh]);
  useEffect(() => {
    if (sync && summary && summary.metadata.version > sync.baseline) setSync(null);
  }, [summary, sync]);
  useEffect(() => {
    if (!sync || sync.state !== "waiting") return;
    const timer = window.setTimeout(() => setSync((current) => current ? { ...current, state: "delayed" } : null), 30_000);
    return () => window.clearTimeout(timer);
  }, [sync]);
  useEffect(() => {
    if (tab !== "audit") return;
    Promise.all([dashboardService.getAuditLogs({ page: 1, limit: 50 }), dashboardService.getDlq({ page: 1, limit: 50 })])
      .then(([auditResponse, dlqResponse]) => { setAudit(auditResponse.data); setDlq(dlqResponse.data); setSecondaryError(null); })
      .catch((reason: unknown) => setSecondaryError(reason instanceof Error ? reason.message : "Audit data is unavailable"));
  }, [tab]);

  const chartData = useMemo<DataPoint[]>(() => summary?.series.map((point) => ({
    label: point.label, revenue: point.completedOrderGmvVnd, bids: point.bids, overview: point.auctions,
  })) ?? [], [summary]);

  async function requestSync() {
    const response = await dashboardService.syncCache();
    setSync({ baseline: response.data.baselineVersion, state: "waiting" });
  }

  if (loading && !summary) return <div className="p-10 text-muted-foreground">Loading measured analytics…</div>;
  if (error && !summary) return <div className="m-8 p-6 border border-rose-500/30 rounded-2xl text-rose-500"><AlertTriangle className="inline w-4 mr-2" />{error}<button onClick={() => void refresh()} className="ml-4 underline">Retry</button></div>;
  if (!summary) return null;

  const metrics = summary.metrics;
  const stale = summary.metadata.state === "stale";
  const cards = [
    { label: "Completed-order GMV", value: formatVnd(metrics.completedOrderGmvVnd), icon: Database },
    { label: "Active bidders", value: metrics.activeBidders.toLocaleString(), icon: Users },
    { label: "Enabled accounts", value: metrics.enabledAccounts.toLocaleString(), icon: ShieldCheck },
    { label: "Active auctions", value: metrics.activeAuctions.toLocaleString(), icon: ShoppingBag },
  ];

  return <main className="p-4 sm:p-8 space-y-6 bg-background min-h-screen">
    <header className="flex flex-wrap gap-4 justify-between items-end border-b border-border pb-5">
      <div>
        <p className="text-[10px] tracking-[.2em] text-amber-500 font-mono">VANGUARD INTELLIGENCE</p>
        <h1 className="text-3xl font-black">Admin Analytics</h1>
        <div className="flex gap-2 mt-2 text-xs">
          <span className={socketState === "connected" ? "text-emerald-500" : "text-amber-500"}><Radio className="inline w-3 mr-1" />{socketState === "connected" ? "Realtime connected" : "Polling fallback"}</span>
          <span className={stale ? "text-amber-500" : "text-muted-foreground"}>Snapshot v{summary.metadata.version} · {Math.round(summary.metadata.freshnessMs / 1000)}s old</span>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <select value={range} onChange={(event) => setRange(event.target.value as DashboardRange)} className="bg-card border border-border rounded-xl px-3 py-2 text-xs">{Object.entries(ranges).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select>
        <a href={dashboardService.exportUrl(tab === "audit" ? "audit" : "analytics", range)} className="border border-border rounded-xl px-3 py-2 text-xs"><Download className="inline w-3 mr-1" />CSV</a>
        <button onClick={() => void requestSync()} disabled={sync?.state === "waiting"} className="bg-amber-500 text-slate-950 rounded-xl px-4 py-2 text-xs font-bold disabled:opacity-60"><RefreshCw className={`inline w-3 mr-1 ${sync?.state === "waiting" ? "animate-spin" : ""}`} />{sync?.state === "waiting" ? "Waiting for version…" : sync?.state === "delayed" ? "Queued / delayed" : "Sync telemetry"}</button>
      </div>
    </header>

    {stale && <div className="border border-amber-500/30 bg-amber-500/10 rounded-xl p-3 text-xs text-amber-600"><AlertTriangle className="inline w-4 mr-2" />Data is older than the configured freshness threshold. Scheduled recovery and polling remain active.</div>}
    {error && <div className="text-xs text-amber-500">Partial refresh failure: {error}</div>}

    <nav className="flex gap-2">{(["overview", "operations", "audit"] as const).map((item) => <button key={item} onClick={() => setTab(item)} className={`px-4 py-2 rounded-xl text-xs capitalize ${tab === item ? "bg-amber-500 text-slate-950 font-bold" : "bg-card border border-border"}`}>{item === "audit" ? "Audit / DLQ" : item}</button>)}</nav>

    {tab === "overview" && <>
      <section className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">{cards.map(({ label, value, icon: Icon }) => <article key={label} className="bg-card border border-border rounded-2xl p-5"><Icon className="w-5 text-amber-500 mb-4" /><p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p><strong className="text-2xl font-mono">{value}</strong></article>)}</section>
      <section className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
        {[["Pending orders", metrics.pendingOrders], ["Finished orders", metrics.finishedOrders], ["Rejected orders", metrics.rejectedOrders], ["Seller verifications", metrics.pendingSellerVerifications], ["Sell-through", `${metrics.sellThroughRate}%`]].map(([label, value]) => <div key={label} className="bg-card border border-border rounded-xl p-4"><span className="text-muted-foreground">{label}</span><b className="block text-lg mt-1">{value}</b></div>)}
      </section>
      <VanguardAreaChart data={chartData} activeTab={chartTab} setActiveTab={setChartTab} rangeLabel={ranges[range]} />
      <section className="grid lg:grid-cols-2 gap-6">
        <CategoryDistributionChart data={summary.categoryDistribution.map((point, index) => ({ name: point.category, value: point.auctions, color: colors[index % colors.length] }))} />
        <BidDensityHeatmap rangeLabel={ranges[range]} data={summary.bidHeatmap} />
      </section>
    </>}

    {tab === "operations" && operations && <section className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
      {[
        ["PostgreSQL", operations.postgres.available, operations.postgres.latencyMs === null ? "Unavailable" : `${operations.postgres.latencyMs} ms`],
        ["Redis", operations.redis.available, operations.redis.latencyMs === null ? "Unavailable" : `${operations.redis.latencyMs} ms`],
        ["Kafka", operations.kafka.available, operations.kafka.latencyMs === null ? "Unavailable" : `${operations.kafka.latencyMs} ms`],
        ["Auction worker", operations.workers.auctionWorker.available, operations.workers.auctionWorker.ageMs === null ? "No heartbeat" : `${Math.round(operations.workers.auctionWorker.ageMs / 1000)}s ago · lag ${operations.projectionLag ?? "?"}`],
        ["Outbox relay", operations.workers.outboxRelay.available, `${operations.outboxPending} pending / ${operations.outboxRetrying} retrying / ${operations.outboxTerminal} terminal`],
        ["Async worker", operations.workers.asyncWorker.available, operations.workers.asyncWorker.ageMs === null ? "No heartbeat" : `${Math.round(operations.workers.asyncWorker.ageMs / 1000)}s ago`],
        ["Email queue", operations.emailPending === 0, `${operations.emailPending} pending / ${operations.emailRetrying} retrying / ${operations.emailTerminal} terminal`],
        ["Outbox", operations.outboxPending === 0, `${operations.outboxPending} pending · ${operations.outboxRetrying} retrying`],
        ["DLQ / sockets", operations.dlqCount === 0, `${operations.dlqCount} terminal · ${operations.adminSocketCount} admins`],
      ].map(([label, ok, value]) => <article key={String(label)} className="bg-card border border-border rounded-2xl p-5"><Activity className={`w-5 mb-4 ${ok ? "text-emerald-500" : "text-amber-500"}`} /><p className="font-bold">{label}</p><p className="text-xs text-muted-foreground mt-1">{value}</p></article>)}
    </section>}

    {tab === "audit" && <section className="grid xl:grid-cols-2 gap-6">
      {secondaryError && <p className="text-rose-500">{secondaryError}</p>}
      <div className="bg-card border border-border rounded-2xl p-5 overflow-x-auto"><h2 className="font-bold mb-4">Admin audit log</h2>{audit.length === 0 ? <p className="text-sm text-muted-foreground">No matching audit records.</p> : <table className="w-full text-xs"><thead><tr className="text-left text-muted-foreground"><th>Time</th><th>Action</th><th>Resource</th><th>Result</th></tr></thead><tbody>{audit.map((item) => <tr key={item.id} className="border-t border-border"><td className="py-3">{new Date(item.createdAt).toLocaleString()}</td><td>{item.action}</td><td>{item.resourceType} {item.resourceId}</td><td>{item.result}</td></tr>)}</tbody></table>}</div>
      <div className="bg-card border border-border rounded-2xl p-5 overflow-x-auto"><h2 className="font-bold mb-4">Async / outbox DLQ</h2>{dlq.length === 0 ? <p className="text-sm text-muted-foreground">No terminal events.</p> : <table className="w-full text-xs"><thead><tr className="text-left text-muted-foreground"><th>Kind</th><th>Event</th><th>Attempts</th><th>Error</th><th /></tr></thead><tbody>{dlq.map((item) => <tr key={`${item.kind}:${item.eventId}`} className="border-t border-border"><td>{item.kind}</td><td className="py-3">{item.eventType}</td><td>{item.attempts}</td><td className="max-w-48 truncate">{item.lastError}</td><td><button onClick={() => void dashboardService.retryDlq(item.eventId, item.kind)} className="text-amber-500 underline">Retry</button></td></tr>)}</tbody></table>}</div>
    </section>}
  </main>;
}
