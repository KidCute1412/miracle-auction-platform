import React, { useState } from "react";
import { TrendingUp, BarChart2, ShieldAlert } from "lucide-react";

export interface DataPoint {
  label: string;
  revenue: number;
  bids: number;
  overview: number;
}

interface VanguardAreaChartProps {
  data: DataPoint[];
  activeTab: "overview" | "revenue" | "bids" | "overlay";
  setActiveTab: (tab: "overview" | "revenue" | "bids" | "overlay") => void;
  rangeLabel: string;
}

export const VanguardAreaChart: React.FC<VanguardAreaChartProps> = ({
  data,
  activeTab,
  setActiveTab,
  rangeLabel,
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [viewStyle, setViewStyle] = useState<"bezier" | "bar">("bezier");

  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center border border-dashed border-border rounded-2xl p-8 text-center text-muted-foreground bg-card/50">
        <ShieldAlert className="w-6 h-6 text-amber-500 mb-2" />
        <p className="font-semibold text-xs text-foreground">Telemetry feed buffering...</p>
        <p className="text-xs text-muted-foreground mt-1">Select another timeframe or sync live data feed.</p>
      </div>
    );
  }

  const getPrimaryVal = (item: DataPoint) => {
    if (activeTab === "revenue") return item.revenue;
    if (activeTab === "bids") return item.bids;
    if (activeTab === "overview") return item.overview;
    return item.revenue;
  };

  const getSecondaryVal = (item: DataPoint) => item.bids;

  const primaryValues = data.map(getPrimaryVal);
  const maxPrimary = Math.max(...primaryValues, 1);
  const totalPrimary = primaryValues.reduce((acc, curr) => acc + curr, 0);
  const avgPrimary = Math.round(totalPrimary / data.length);

  const half = Math.floor(data.length / 2);
  const firstHalfAvg = data.slice(0, half).reduce((acc, d) => acc + getPrimaryVal(d), 0) / (half || 1);
  const secondHalfAvg = data.slice(half).reduce((acc, d) => acc + getPrimaryVal(d), 0) / (data.length - half || 1);
  const growthPercent = firstHalfAvg > 0 ? (((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100).toFixed(1) : "0.0";
  const isPositive = Number(growthPercent) >= 0;

  // SVG Geometry
  const svgWidth = 800;
  const svgHeight = 240;
  const paddingX = 45;
  const paddingTop = 25;
  const paddingBottom = 35;

  const chartW = svgWidth - paddingX * 2;
  const chartH = svgHeight - paddingTop - paddingBottom;

  const points = data.map((item, idx) => {
    const x = paddingX + (idx / Math.max(data.length - 1, 1)) * chartW;
    const val = getPrimaryVal(item);
    const y = svgHeight - paddingBottom - (val / maxPrimary) * chartH;
    return { x, y, val, label: item.label, raw: item };
  });

  const secondaryMax = Math.max(...data.map(getSecondaryVal), 1);
  const secondaryPoints = data.map((item, idx) => {
    const x = paddingX + (idx / Math.max(data.length - 1, 1)) * chartW;
    const val = getSecondaryVal(item);
    const y = svgHeight - paddingBottom - (val / secondaryMax) * chartH;
    return { x, y, val };
  });

  const createBezierPath = (pts: { x: number; y: number }[]) => {
    if (pts.length === 0) return "";
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const curr = pts[i];
      const next = pts[i + 1];
      const cpX = (curr.x + next.x) / 2;
      d += ` C ${cpX} ${curr.y}, ${cpX} ${next.y}, ${next.x} ${next.y}`;
    }
    return d;
  };

  const primaryPathD = createBezierPath(points);
  const primaryAreaD = `${primaryPathD} L ${points[points.length - 1].x} ${svgHeight - paddingBottom} L ${points[0].x} ${svgHeight - paddingBottom} Z`;
  const secondaryPathD = createBezierPath(secondaryPoints);

  const hoveredData = hoveredIdx !== null ? data[hoveredIdx] : null;

  return (
    <div className="bg-card text-card-foreground border border-border/80 rounded-2xl p-5 sm:p-6 shadow-md backdrop-blur-xl transition-colors duration-300 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold tracking-tight text-foreground font-heading">
              Platform Financial & Bidding Telemetry
            </h3>
            <span className="text-[10px] font-mono font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full uppercase">
              {rangeLabel}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Monetary aggregation, bidding activity, and period-over-period trend analysis.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Tab Selector */}
          <div className="flex bg-muted p-1 rounded-xl border border-border">
            {(["revenue", "bids", "overview", "overlay"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 text-xs rounded-lg font-semibold capitalize cursor-pointer transition-all duration-200 ${
                  activeTab === tab
                    ? "bg-card text-amber-600 dark:text-amber-400 border border-amber-500/30 shadow-xs font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab === "revenue"
                  ? "GMV Revenue"
                  : tab === "bids"
                  ? "Bids Count"
                  : tab === "overview"
                  ? "Listings"
                  : "Dual Overlay"}
              </button>
            ))}
          </div>

          {/* View mode toggle */}
          <div className="flex bg-muted p-1 rounded-xl border border-border">
            <button
              onClick={() => setViewStyle("bezier")}
              title="Vanguard Bezier Curve"
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewStyle === "bezier"
                  ? "bg-card text-amber-600 dark:text-amber-400 shadow-xs border border-border"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <TrendingUp className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewStyle("bar")}
              title="Vanguard Bar Spectrum"
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewStyle === "bar"
                  ? "bg-card text-amber-600 dark:text-amber-400 shadow-xs border border-border"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <BarChart2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="relative">
        <div className="w-full overflow-x-auto">
          <div className="min-w-[650px] relative">
            <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto select-none overflow-visible">
              <defs>
                <linearGradient id="vanguardAreaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.3} />
                  <stop offset="60%" stopColor="#F59E0B" stopOpacity={0.08} />
                  <stop offset="100%" stopColor="#F59E0B" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {[0, 0.33, 0.66, 1].map((ratio, i) => {
                const y = paddingTop + ratio * chartH;
                const gridVal = Math.round(maxPrimary * (1 - ratio));
                return (
                  <g key={i}>
                    <line
                      x1={paddingX}
                      y1={y}
                      x2={svgWidth - paddingX}
                      y2={y}
                      stroke="currentColor"
                      strokeOpacity={0.1}
                      strokeDasharray="3 3"
                    />
                    <text
                      x={paddingX - 10}
                      y={y + 3}
                      fill="currentColor"
                      className="text-[10px] font-mono fill-muted-foreground"
                      textAnchor="end"
                    >
                      {activeTab === "revenue" ? `$${gridVal >= 1000 ? `${(gridVal / 1000).toFixed(0)}k` : gridVal}` : gridVal}
                    </text>
                  </g>
                );
              })}

              {viewStyle === "bezier" ? (
                <>
                  {activeTab === "overlay" && (
                    <path
                      d={secondaryPathD}
                      fill="none"
                      stroke="#10B981"
                      strokeWidth={2}
                      strokeDasharray="4 3"
                    />
                  )}

                  <path d={primaryAreaD} fill="url(#vanguardAreaGrad)" />

                  <path
                    d={primaryPathD}
                    fill="none"
                    stroke="#F59E0B"
                    strokeWidth={2.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {points.map((pt, idx) => {
                    const isHovered = hoveredIdx === idx;
                    return (
                      <circle
                        key={idx}
                        cx={pt.x}
                        cy={pt.y}
                        r={isHovered ? 6 : 3.5}
                        fill="#F59E0B"
                        stroke="currentColor"
                        className="text-card transition-all duration-150 cursor-pointer"
                        strokeWidth={2}
                      />
                    );
                  })}
                </>
              ) : (
                <g>
                  {points.map((pt, idx) => {
                    const barWidth = Math.max(chartW / data.length - 14, 10);
                    const barH = svgHeight - paddingBottom - pt.y;
                    const isHovered = hoveredIdx === idx;

                    return (
                      <rect
                        key={idx}
                        x={pt.x - barWidth / 2}
                        y={pt.y}
                        width={barWidth}
                        height={Math.max(barH, 2)}
                        rx={4}
                        fill="#F59E0B"
                        fillOpacity={isHovered ? 0.9 : 0.65}
                        className="transition-all duration-150 cursor-pointer"
                      />
                    );
                  })}
                </g>
              )}

              {/* X Labels */}
              {points.map((pt, idx) => (
                <text
                  key={idx}
                  x={pt.x}
                  y={svgHeight - 10}
                  fill="currentColor"
                  className={`text-[10px] font-mono uppercase ${
                    hoveredIdx === idx ? "fill-amber-500 font-bold" : "fill-muted-foreground"
                  }`}
                  textAnchor="middle"
                >
                  {pt.label}
                </text>
              ))}

              {/* Crosshair */}
              {hoveredIdx !== null && (
                <line
                  x1={points[hoveredIdx].x}
                  y1={paddingTop}
                  x2={points[hoveredIdx].x}
                  y2={svgHeight - paddingBottom}
                  stroke="#F59E0B"
                  strokeWidth={1.5}
                  strokeDasharray="3 3"
                />
              )}

              {/* Hover Rectangles */}
              {points.map((pt, idx) => {
                const rectW = chartW / data.length;
                return (
                  <rect
                    key={idx}
                    x={pt.x - rectW / 2}
                    y={0}
                    width={rectW}
                    height={svgHeight}
                    fill="transparent"
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredIdx(idx)}
                    onMouseLeave={() => setHoveredIdx(null)}
                  />
                );
              })}
            </svg>
          </div>
        </div>

        {/* Floating Tooltip */}
        {hoveredData && hoveredIdx !== null && (
          <div className="absolute top-2 right-4 bg-popover text-popover-foreground border border-border rounded-xl p-3 shadow-xl text-xs z-10 pointer-events-none min-w-[190px] animate-in fade-in zoom-in-95 duration-150">
            <div className="text-[11px] font-mono text-amber-600 dark:text-amber-400 font-bold border-b border-border pb-1 mb-1.5 flex justify-between">
              <span>{hoveredData.label}</span>
              <span className="text-muted-foreground text-[10px]">TELEMETRY</span>
            </div>
            <div className="space-y-1 font-mono text-[11px]">
              <div className="flex justify-between text-foreground">
                <span className="text-muted-foreground">GMV Revenue:</span>
                <span className="font-bold text-amber-600 dark:text-amber-400">${hoveredData.revenue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-foreground">
                <span className="text-muted-foreground">Bids Placed:</span>
                <span className="font-bold">${hoveredData.bids.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-foreground">
                <span className="text-muted-foreground">Listings:</span>
                <span className="font-bold">${hoveredData.overview.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Telemetry Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-muted/50 border border-border rounded-xl p-3.5 text-xs">
        <div>
          <span className="text-[10px] font-mono text-muted-foreground uppercase block">
            Total ({activeTab.toUpperCase()})
          </span>
          <span className="text-sm font-mono font-black text-amber-600 dark:text-amber-400 mt-0.5 block">
            {activeTab === "revenue" ? `$${totalPrimary.toLocaleString()}` : totalPrimary.toLocaleString()}
          </span>
        </div>
        <div>
          <span className="text-[10px] font-mono text-muted-foreground uppercase block">Interval Average</span>
          <span className="text-sm font-mono font-black text-foreground mt-0.5 block">
            {activeTab === "revenue" ? `$${avgPrimary.toLocaleString()}` : avgPrimary.toLocaleString()}
          </span>
        </div>
        <div>
          <span className="text-[10px] font-mono text-muted-foreground uppercase block">Peak Value</span>
          <span className="text-sm font-mono font-black text-emerald-600 dark:text-emerald-400 mt-0.5 block">
            {activeTab === "revenue" ? `$${maxPrimary.toLocaleString()}` : maxPrimary.toLocaleString()}
          </span>
        </div>
        <div>
          <span className="text-[10px] font-mono text-muted-foreground uppercase block">Growth Velocity</span>
          <span className={`text-sm font-mono font-black mt-0.5 block ${isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
            {isPositive ? `+${growthPercent}%` : `${growthPercent}%`}
          </span>
        </div>
      </div>
    </div>
  );
};
