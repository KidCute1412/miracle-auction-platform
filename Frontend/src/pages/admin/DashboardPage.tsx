import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  Users,
  ShoppingBag,
  ShieldCheck,
  Clock,
  RefreshCw,
  Zap,
  Layers,
  ChevronDown,
  Filter,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import type { DashboardRange } from "api-contracts";
import { Sparkline } from "@/components/admin/charts/Sparkline";
import { VanguardAreaChart, type DataPoint } from "@/components/admin/charts/VanguardAreaChart";
import { CategoryDistributionChart } from "@/components/admin/charts/CategoryDistributionChart";
import { BidDensityHeatmap } from "@/components/admin/charts/BidDensityHeatmap";

// Rich, High-Fidelity Mock Datasets for Instant Graph Visualization
const mockChartDataset: Record<DashboardRange, DataPoint[]> = {
  "7d": [
    { label: "Mon", revenue: 142000, bids: 820, overview: 45 },
    { label: "Tue", revenue: 168000, bids: 940, overview: 52 },
    { label: "Wed", revenue: 195000, bids: 1120, overview: 64 },
    { label: "Thu", revenue: 210000, bids: 1280, overview: 70 },
    { label: "Fri", revenue: 285000, bids: 1840, overview: 95 },
    { label: "Sat", revenue: 340000, bids: 2210, overview: 110 },
    { label: "Sun", revenue: 310000, bids: 1980, overview: 88 },
  ],
  "30d": [
    { label: "Day 1-5", revenue: 420000, bids: 2800, overview: 150 },
    { label: "Day 6-10", revenue: 580000, bids: 3600, overview: 190 },
    { label: "Day 11-15", revenue: 720000, bids: 4900, overview: 230 },
    { label: "Day 16-20", revenue: 890000, bids: 5800, overview: 280 },
    { label: "Day 21-25", revenue: 1050000, bids: 7100, overview: 340 },
    { label: "Day 26-30", revenue: 1248500, bids: 8400, overview: 410 },
  ],
  "3m": [
    { label: "May W1", revenue: 1100000, bids: 7200, overview: 380 },
    { label: "May W3", revenue: 1350000, bids: 8900, overview: 440 },
    { label: "Jun W1", revenue: 1680000, bids: 11200, overview: 520 },
    { label: "Jun W3", revenue: 1920000, bids: 13400, overview: 610 },
    { label: "Jul W1", revenue: 2350000, bids: 16800, overview: 780 },
    { label: "Jul W3", revenue: 2850000, bids: 19400, overview: 920 },
  ],
  "6m": [
    { label: "Feb", revenue: 1800000, bids: 11200, overview: 620 },
    { label: "Mar", revenue: 2100000, bids: 13400, overview: 710 },
    { label: "Apr", revenue: 2600000, bids: 16800, overview: 890 },
    { label: "May", revenue: 2950000, bids: 18900, overview: 980 },
    { label: "Jun", revenue: 3400000, bids: 21500, overview: 1120 },
    { label: "Jul", revenue: 4200000, bids: 26800, overview: 1380 },
  ],
  "1y": [
    { label: "Q3 '25", revenue: 5200000, bids: 34000, overview: 1850 },
    { label: "Q4 '25", revenue: 6800000, bids: 42500, overview: 2300 },
    { label: "Q1 '26", revenue: 8100000, bids: 51000, overview: 2750 },
    { label: "Q2 '26", revenue: 9900000, bids: 63000, overview: 3400 },
  ],
};

export default function DashboardPage() {
  const [time, setTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState<"overview" | "revenue" | "bids" | "overlay">("revenue");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [range, setRange] = useState<DashboardRange>("6m");
  const [isTimeframeOpen, setIsTimeframeOpen] = useState(false);

  const rangeLabels: Record<DashboardRange, string> = {
    "7d": "Last 7 Days",
    "30d": "Last 30 Days",
    "3m": "Last 3 Months",
    "6m": "Last 6 Months",
    "1y": "Last Year",
  };

  const metrics = {
    gmv: 1248500,
    activeUsers: 14290,
    activeAuctions: 324,
    pendingVerifications: 14,
  };

  const [chartData, setChartData] = useState<DataPoint[]>(mockChartDataset["6m"]);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setChartData(mockChartDataset[range] || mockChartDataset["6m"]);
  }, [range]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setChartData(mockChartDataset[range] || mockChartDataset["6m"]);
      setIsRefreshing(false);
    }, 800);
  };

  return (
    <div className="p-4 sm:p-8 space-y-6 bg-background text-foreground min-h-screen transition-colors duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 text-xs font-mono font-bold tracking-wider text-amber-600 dark:text-amber-400 bg-amber-500/10 rounded-full border border-amber-500/30 flex items-center gap-1.5 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" /> VANGUARD INTELLIGENCE PORTAL
            </span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-foreground font-heading">
            System Dashboard & Telemetry
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Real-time auction platform performance, financial outputs, and bidding telemetry.
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Timeframe Filter Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsTimeframeOpen(!isTimeframeOpen)}
              className="flex items-center gap-2 bg-card hover:bg-muted text-foreground border border-border px-3.5 py-2 rounded-xl font-semibold text-xs transition-all shadow-xs cursor-pointer"
            >
              <Filter className="w-3.5 h-3.5 text-amber-500" />
              <span>{rangeLabels[range]}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isTimeframeOpen ? "rotate-180" : ""}`} />
            </button>
            {isTimeframeOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsTimeframeOpen(false)} />
                <div className="absolute right-0 mt-1.5 w-44 bg-card/95 backdrop-blur-xl border border-border rounded-xl shadow-xl py-1.5 z-20 animate-in fade-in zoom-in-95 duration-150">
                  {Object.entries(rangeLabels).map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => {
                        setRange(key as DashboardRange);
                        setIsTimeframeOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2 text-xs font-semibold hover:bg-amber-500/10 hover:text-amber-600 dark:hover:text-amber-400 transition-colors flex items-center justify-between ${
                        range === key ? "text-amber-600 dark:text-amber-400 bg-amber-500/5 font-bold" : "text-muted-foreground"
                      }`}
                    >
                      <span>{label}</span>
                      {range === key && <span>✓</span>}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Live Clock */}
          <div className="flex items-center gap-2 bg-card/70 backdrop-blur-md border border-border px-3.5 py-2 rounded-xl text-xs font-mono font-bold text-foreground shadow-xs">
            <Clock className="w-4 h-4 text-amber-500" />
            <span>{time.toLocaleTimeString()}</span>
          </div>

          {/* Sync Button */}
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 py-2 rounded-xl text-xs font-extrabold shadow-md hover:shadow-amber-500/20 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            <span>Sync Telemetry</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* GMV Card */}
        <div className="group relative bg-card/75 border border-border/80 hover:border-amber-500/40 rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
          <div className="flex justify-between items-start mb-3">
            <div className="p-2.5 bg-amber-500/10 text-amber-500 rounded-xl border border-amber-500/20 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="flex items-center gap-0.5 text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              <ArrowUpRight className="w-3 h-3" /> +18.4%
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground font-mono font-semibold uppercase tracking-wider">
            Gross Merchandise Value
          </p>
          <h3 className="text-2xl sm:text-3xl font-mono font-black mt-1 text-foreground">
            ${metrics.gmv.toLocaleString()}
          </h3>
          <div className="mt-4 flex items-end justify-between pt-2 border-t border-border">
            <span className="text-[10px] text-muted-foreground font-mono">Velocity curve</span>
            <Sparkline data={[650000, 720000, 810000, 940000, 1100000, metrics.gmv]} color="#F59E0B" />
          </div>
        </div>

        {/* Active Users Card */}
        <div className="group relative bg-card/75 border border-border/80 hover:border-amber-500/40 rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
          <div className="flex justify-between items-start mb-3">
            <div className="p-2.5 bg-amber-500/10 text-amber-500 rounded-xl border border-amber-500/20 group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
            <span className="flex items-center gap-0.5 text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              <ArrowUpRight className="w-3 h-3" /> +12.1%
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground font-mono font-semibold uppercase tracking-wider">
            Active Verified Users
          </p>
          <h3 className="text-2xl sm:text-3xl font-mono font-black mt-1 text-foreground">
            {metrics.activeUsers.toLocaleString()}
          </h3>
          <div className="mt-4 flex items-end justify-between pt-2 border-t border-border">
            <span className="text-[10px] text-muted-foreground font-mono">User growth</span>
            <Sparkline data={[9800, 10500, 11400, 12200, 13100, metrics.activeUsers]} color="#F59E0B" />
          </div>
        </div>

        {/* Active Auctions Card */}
        <div className="group relative bg-card/75 border border-border/80 hover:border-amber-500/40 rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
          <div className="flex justify-between items-start mb-3">
            <div className="p-2.5 bg-amber-500/10 text-amber-500 rounded-xl border border-amber-500/20 group-hover:scale-110 transition-transform">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 animate-pulse">
              LIVE NOW
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground font-mono font-semibold uppercase tracking-wider">
            Live Auction Catalogs
          </p>
          <h3 className="text-2xl sm:text-3xl font-mono font-black mt-1 text-foreground">
            {metrics.activeAuctions.toLocaleString()}
          </h3>
          <div className="mt-4 flex items-end justify-between pt-2 border-t border-border">
            <span className="text-[10px] text-muted-foreground font-mono">Catalog volume</span>
            <Sparkline data={[180, 210, 240, 290, 310, metrics.activeAuctions]} color="#F59E0B" />
          </div>
        </div>

        {/* Seller Verifications Card */}
        <div className="group relative bg-card/75 border border-border/80 hover:border-amber-500/40 rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
          <div className="flex justify-between items-start mb-3">
            <div className="p-2.5 bg-amber-500/10 text-amber-500 rounded-xl border border-amber-500/20 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
              ACTION REQUIRED
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground font-mono font-semibold uppercase tracking-wider">
            Pending KYC Verifications
          </p>
          <h3 className="text-2xl sm:text-3xl font-mono font-black mt-1 text-foreground">
            {metrics.pendingVerifications} Requests
          </h3>
          <div className="mt-4 flex items-end justify-between pt-2 border-t border-border">
            <span className="text-[10px] text-muted-foreground font-mono">Queue backlog</span>
            <Sparkline data={[35, 28, 22, 19, 16, metrics.pendingVerifications]} color="#F59E0B" />
          </div>
        </div>
      </div>

      {/* Main Vanguard Area Chart */}
      <VanguardAreaChart
        data={chartData}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        rangeLabel={rangeLabels[range]}
      />

      {/* Grid Row 2: Secondary Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <CategoryDistributionChart />
        <BidDensityHeatmap rangeLabel={rangeLabels[range]} rangeKey={range} />
      </div>

      {/* Grid Row 3: Command Deck & Engine Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-card border border-border/80 rounded-2xl p-6 shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h2 className="text-base font-bold flex items-center gap-2 text-foreground font-heading">
              <Zap className="w-4.5 h-4.5 text-amber-500" /> Administrative Command Deck
            </h2>
            <span className="text-[10px] font-mono text-muted-foreground uppercase">QUICK ACTIONS</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-muted/40 hover:bg-muted p-4 rounded-xl border border-border/80 hover:border-amber-500/30 transition-all cursor-pointer group">
              <h3 className="font-bold text-sm text-foreground group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors flex items-center justify-between">
                Audit Catalog <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
              </h3>
              <p className="text-xs text-muted-foreground mt-1">Review flagged items and anti-sniping disputes.</p>
            </div>

            <div className="bg-muted/40 hover:bg-muted p-4 rounded-xl border border-border/80 hover:border-amber-500/30 transition-all cursor-pointer group">
              <h3 className="font-bold text-sm text-foreground group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors flex items-center justify-between">
                KYC Verifications <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
              </h3>
              <p className="text-xs text-muted-foreground mt-1">Process credentials & seller limits ({metrics.pendingVerifications}).</p>
            </div>

            <div className="bg-muted/40 hover:bg-muted p-4 rounded-xl border border-border/80 hover:border-amber-500/30 transition-all cursor-pointer group">
              <h3 className="font-bold text-sm text-foreground group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors flex items-center justify-between">
                Export Reports <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
              </h3>
              <p className="text-xs text-muted-foreground mt-1">Generate comprehensive billing and GMV logs.</p>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h2 className="text-base font-bold flex items-center gap-2 text-foreground font-heading">
              <Layers className="w-4.5 h-4.5 text-amber-500" /> Infrastructure Engine
            </h2>
            <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
              HEALTH 99.9%
            </span>
          </div>

          <div className="space-y-3 text-xs font-mono">
            <div className="flex justify-between items-center pb-2 border-b border-border/40">
              <span className="text-muted-foreground font-sans">PostgreSQL Database</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">1.2ms Latency</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-border/40">
              <span className="text-muted-foreground font-sans">Socket.io Relay Node</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">1,420 Conns</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-border/40">
              <span className="text-muted-foreground font-sans">Redis Cache Invalidation</span>
              <span className="text-amber-600 dark:text-amber-400 font-bold">0.4ms Latency</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground font-sans">Kafka Worker Queue</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">Idle (0 backlog)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
