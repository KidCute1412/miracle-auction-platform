import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  Users,
  ShoppingBag,
  ShieldCheck,
  Activity,
  Award,
  Bell,
  ArrowUpRight,
  ArrowDownRight,
  Compass,
  Zap,
  Layers,
  RefreshCw,
  Clock,
  Sparkles,
} from "lucide-react";
import { dashboardService } from "@/services/dashboard.service";

export default function DashboardPage() {
  const [time, setTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState("overview");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [range, setRange] = useState("6m");
  const [isTimeframeOpen, setIsTimeframeOpen] = useState(false);

  const rangeLabels: Record<string, string> = {
    "7d": "Last 7 Days",
    "30d": "Last 30 Days",
    "3m": "Last 3 Months",
    "6m": "Last 6 Months",
    "1y": "Last Year",
  };

  const [metrics, setMetrics] = useState({
    gmv: 0,
    activeUsers: 0,
    activeAuctions: 0,
    pendingVerifications: 0,
  });
  const [chartData, setChartData] = useState<{
    overview: Array<{ month: string; count: string | number }>;
    revenue: Array<{ month: string; count: string | number }>;
    bids: Array<{ month: string; count: string | number }>;
  }>({
    overview: [],
    revenue: [],
    bids: [],
  });
  const [activities, setActivities] = useState<any[]>([]);

  const fetchDashboardData = async (selectedRange: string) => {
    try {
      setIsRefreshing(true);
      const res = await dashboardService.getSummary({ range: selectedRange });
      if (res.code === "success" && res.data) {
        setMetrics(res.data.metrics);
        setChartData(res.data.chartData);
        setActivities(res.data.activities);
      }
    } catch (err) {
      console.error("Failed to load dashboard data", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    fetchDashboardData(range);
    return () => clearInterval(timer);
  }, [range]);

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await dashboardService.syncCache();
      setTimeout(() => {
        fetchDashboardData(range);
      }, 1500);
    } catch (err) {
      console.error("Failed to sync dashboard cache", err);
      setIsRefreshing(false);
    }
  };

  const currentChartItems = activeTab === "revenue"
    ? chartData.revenue
    : activeTab === "bids"
    ? chartData.bids
    : chartData.overview;

  const maxVal = Math.max(...currentChartItems.map(item => Number(item.count) || 0), 1);

  return (
    <div className="p-4 sm:p-8 space-y-8 text-foreground bg-background transition-colors duration-300 min-h-screen">
      {/* Top Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 text-xs font-semibold tracking-wider text-amber-500 bg-amber-500/10 rounded-full border border-amber-500/20 flex items-center gap-1 animate-pulse">
              <Sparkles className="w-3 h-3" /> ADMIN PORTAL
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-muted-foreground bg-clip-text text-transparent">
            System Intelligence
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Real-time auction statistics, user activities, and platform controls.
          </p>
        </div>

        {/* Info badges with interactive time */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-card/60 backdrop-blur-md px-4 py-2 rounded-xl border border-border/80 shadow-sm">
            <Clock className="w-4 h-4 text-primary" />
            <span className="text-sm font-mono tracking-widest text-foreground font-semibold">
              {time.toLocaleTimeString()}
            </span>
          </div>

          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/95 px-4 py-2 rounded-xl shadow-md hover:shadow-primary/25 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer text-sm font-medium"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
            <span>Sync Live Feed</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total GMV Card */}
        <div className="group relative bg-gradient-to-br from-card to-card/50 rounded-2xl p-6 border border-border hover:border-primary/30 transition-all duration-300 shadow-md hover:shadow-xl hover:shadow-primary/5 overflow-hidden">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-all duration-500" />
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-primary/10 text-primary rounded-xl group-hover:scale-110 transition-transform duration-300">
              <TrendingUp className="w-6 h-6" />
            </div>
            <span className="flex items-center gap-0.5 text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              <ArrowUpRight className="w-3 h-3" /> Live data
            </span>
          </div>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Gross Merchandise Value</p>
          <h3 className="text-2xl sm:text-3xl font-black mt-1">${metrics.gmv.toLocaleString()}</h3>
          <div className="w-full bg-border rounded-full h-1 mt-4 overflow-hidden">
            <div className="bg-primary h-full rounded-full w-[76%] transition-all duration-1000" />
          </div>
        </div>

        {/* Registered Users Card */}
        <div className="group relative bg-gradient-to-br from-card to-card/50 rounded-2xl p-6 border border-border hover:border-purple-500/30 transition-all duration-300 shadow-md hover:shadow-xl hover:shadow-purple-500/5 overflow-hidden">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl group-hover:bg-purple-500/10 transition-all duration-500" />
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-purple-500/10 text-purple-500 rounded-xl group-hover:scale-110 transition-transform duration-300">
              <Users className="w-6 h-6" />
            </div>
            <span className="flex items-center gap-0.5 text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              <ArrowUpRight className="w-3 h-3" /> Live data
            </span>
          </div>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Active Users</p>
          <h3 className="text-2xl sm:text-3xl font-black mt-1">{metrics.activeUsers.toLocaleString()}</h3>
          <div className="w-full bg-border rounded-full h-1 mt-4 overflow-hidden">
            <div className="bg-purple-500 h-full rounded-full w-[64%] transition-all duration-1000" />
          </div>
        </div>

        {/* Live Auctions Card */}
        <div className="group relative bg-gradient-to-br from-card to-card/50 rounded-2xl p-6 border border-border hover:border-orange-500/30 transition-all duration-300 shadow-md hover:shadow-xl hover:shadow-orange-500/5 overflow-hidden">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-orange-500/5 rounded-full blur-2xl group-hover:bg-orange-500/10 transition-all duration-500" />
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-orange-500/10 text-orange-500 rounded-xl group-hover:scale-110 transition-transform duration-300">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <span className="flex items-center gap-0.5 text-xs font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 animate-pulse">
              Active Now
            </span>
          </div>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Active Auctions</p>
          <h3 className="text-2xl sm:text-3xl font-black mt-1">{metrics.activeAuctions.toLocaleString()}</h3>
          <div className="w-full bg-border rounded-full h-1 mt-4 overflow-hidden">
            <div className="bg-orange-500 h-full rounded-full w-[91%] transition-all duration-1000" />
          </div>
        </div>

        {/* Seller Applications Card */}
        <div className="group relative bg-gradient-to-br from-card to-card/50 rounded-2xl p-6 border border-border hover:border-emerald-500/30 transition-all duration-300 shadow-md hover:shadow-xl hover:shadow-emerald-500/5 overflow-hidden">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all duration-500" />
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl group-hover:scale-110 transition-transform duration-300">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <span className="flex items-center gap-0.5 text-xs font-bold text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
              Action Required
            </span>
          </div>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Seller Verification Requests</p>
          <h3 className="text-2xl sm:text-3xl font-black mt-1">{metrics.pendingVerifications} Pending</h3>
          <div className="w-full bg-border rounded-full h-1 mt-4 overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full w-[42%] transition-all duration-1000" />
          </div>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Column 1 & 2: Platform Status Overview */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-card/75 border border-border rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6 border-b border-border pb-4">
              <div className="flex items-center gap-3">
                <Activity className="text-primary w-5 h-5 animate-pulse" />
                <h2 className="text-lg font-bold">Auction Platform Performance</h2>
              </div>
              {/* Controls Wrapper */}
              <div className="flex items-center gap-3">
                {/* Custom Timeframe Selector */}
                <div className="relative">
                  <button
                    onClick={() => setIsTimeframeOpen(!isTimeframeOpen)}
                    className="flex items-center gap-2 bg-card hover:bg-muted/80 text-foreground border border-border px-3 py-1.5 text-xs rounded-xl font-semibold transition-all duration-200 shadow-sm cursor-pointer"
                  >
                    <span>{rangeLabels[range]}</span>
                    <svg
                      className={`w-3.5 h-3.5 transition-transform duration-200 ${isTimeframeOpen ? "rotate-180" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {isTimeframeOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setIsTimeframeOpen(false)} />
                      <div className="absolute right-0 mt-2 w-40 bg-card/95 backdrop-blur-md border border-border rounded-xl shadow-xl py-1.5 z-20 animate-in fade-in slide-in-from-top-2 duration-150">
                        {Object.entries(rangeLabels).map(([key, label]) => (
                          <button
                            key={key}
                            onClick={() => {
                              setRange(key);
                              setIsTimeframeOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2 text-xs font-semibold hover:bg-primary hover:text-primary-foreground transition-all duration-150 first:rounded-t-lg last:rounded-b-lg ${
                              range === key ? "text-primary bg-primary/5" : "text-muted-foreground"
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Tab Selector */}
                <div className="flex bg-muted p-1 rounded-lg border border-border">
                  {["overview", "revenue", "bids"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-3 py-1 text-xs rounded-md font-semibold capitalize cursor-pointer transition-all duration-150 ${
                        activeTab === tab
                          ? "bg-card text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Performance charts mock using styled CSS elements */}
            <div className="h-64 flex flex-col justify-end gap-3 pt-4 px-2 relative">
              <div className="absolute top-4 left-4 flex gap-4 text-xs font-mono text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 bg-primary rounded-full" />
                  <span>Target Achievement</span>
                </div>
              </div>

              {/* Grid backdrop lines */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20 py-4">
                <div className="border-t border-muted-foreground" />
                <div className="border-t border-muted-foreground" />
                <div className="border-t border-muted-foreground" />
                <div className="border-t border-muted-foreground" />
              </div>

              <div className="flex items-end justify-between h-40 z-10">
                {currentChartItems.length > 0 ? (
                  currentChartItems.map((item, idx) => {
                    const val = Number(item.count) || 0;
                    const percent = maxVal > 0 ? (val / maxVal) * 100 : 0;
                    return (
                      <div key={idx} className="flex flex-col justify-end items-center gap-2 group w-full h-full text-center">
                        <div className="relative w-8 sm:w-10 bg-gradient-to-t from-primary/40 to-primary group-hover:from-accent/60 group-hover:to-accent rounded-t transition-all duration-500 ease-out" style={{ height: `${percent}%` }}>
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-[10px] font-mono py-0.5 px-1.5 rounded opacity-0 group-hover:opacity-100 shadow border border-border transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                            {activeTab === "revenue" ? `$${val.toLocaleString()}` : val}
                          </div>
                        </div>
                        <span className="text-[10px] font-mono text-muted-foreground uppercase">{item.month}</span>
                      </div>
                    );
                  })
                ) : (
                  <div className="w-full text-center py-8 text-xs text-muted-foreground">No data recorded.</div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions Panel */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-foreground">
              <Zap className="w-5 h-5 text-amber-500" /> Administrative Quick Commands
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex flex-col justify-between p-4 bg-muted/50 rounded-xl hover:bg-muted border border-border hover:border-primary/20 transition-all duration-200 group">
                <div>
                  <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">Audit Catalog</h3>
                  <p className="text-xs text-muted-foreground mt-1">Review flagged items and resolve listing disputes.</p>
                </div>
                <span className="text-xs font-semibold text-primary mt-4 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Access Portal <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </div>

              <div className="flex flex-col justify-between p-4 bg-muted/50 rounded-xl hover:bg-muted border border-border hover:border-purple-500/20 transition-all duration-200 group">
                <div>
                  <h3 className="font-semibold text-sm group-hover:text-purple-500 transition-colors">KYC Verifications</h3>
                  <p className="text-xs text-muted-foreground mt-1">Process professional credentials and seller limits.</p>
                </div>
                <span className="text-xs font-semibold text-purple-500 mt-4 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Process Requests <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </div>

              <div className="flex flex-col justify-between p-4 bg-muted/50 rounded-xl hover:bg-muted border border-border hover:border-orange-500/20 transition-all duration-200 group">
                <div>
                  <h3 className="font-semibold text-sm group-hover:text-orange-500 transition-colors">System Analytics</h3>
                  <p className="text-xs text-muted-foreground mt-1">Generate comprehensive billing and GMV logs.</p>
                </div>
                <span className="text-xs font-semibold text-orange-500 mt-4 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Export Reports <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Column 3: Activity Feed / Notifications */}
        <div className="space-y-8">
          {/* Realtime activities panel */}
          <div className="bg-card/90 border border-border rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-6 pb-2 border-b border-border">
                <div className="flex items-center gap-2">
                  <Bell className="text-primary w-4.5 h-4.5 animate-bounce" />
                  <h2 className="text-md font-bold">Activity Feed</h2>
                </div>
                <span className="text-[10px] font-bold tracking-widest text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1 uppercase">
                  Live connection
                </span>
              </div>

              <div className="space-y-4">
                {activities.length > 0 ? (
                  activities.map((act, idx) => (
                    <div key={idx} className="flex gap-3 text-xs border-b border-border/40 pb-3 last:border-0 last:pb-0 hover:bg-muted/10 p-1.5 rounded-lg transition-colors duration-150">
                      <div className="flex-1">
                        <p className="text-foreground font-semibold">
                          {act.user} <span className="text-muted-foreground font-normal">{act.action}</span>
                        </p>
                        <p className="text-muted-foreground/80 font-mono text-[10px] mt-0.5">{act.item}</p>
                        <span className="text-[10px] text-muted-foreground/60">{new Date(act.created_at).toLocaleTimeString()}</span>
                      </div>
                      <div className="text-right flex flex-col justify-center">
                        <span className={`font-mono font-bold ${act.color}`}>
                          {isNaN(Number(act.value)) ? act.value : `$${Number(act.value).toLocaleString()}`}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-muted-foreground text-center py-6">No recent activities.</div>
                )}
              </div>
            </div>
          </div>

          {/* Infrastructure Health Panel */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h2 className="text-md font-bold mb-4 flex items-center gap-2">
              <Layers className="w-4.5 h-4.5 text-primary" /> Platform Engine Status
            </h2>
            <div className="space-y-4 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-border/40">
                <span className="text-muted-foreground">Main Engine Core</span>
                <span className="text-emerald-500 font-semibold flex items-center gap-1">🟢 Operational</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-border/40">
                <span className="text-muted-foreground">WebSockets Node</span>
                <span className="text-emerald-500 font-semibold flex items-center gap-1">🟢 Operational</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-border/40">
                <span className="text-muted-foreground">Search Index Sync</span>
                <span className="text-purple-500 font-semibold flex items-center gap-1">🟣 Synced (99%)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Worker Thread Queue</span>
                <span className="text-emerald-500 font-semibold flex items-center gap-1">🟢 Idle (0 jobs)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
