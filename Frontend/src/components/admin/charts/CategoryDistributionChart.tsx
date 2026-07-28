import React, { useState } from "react";
import { PieChart } from "lucide-react";

export interface CategorySegment {
  name: string;
  value: number;
  color: string;
}

interface CategoryDistributionChartProps {
  data?: CategorySegment[];
}

const defaultCategories: CategorySegment[] = [
  { name: "Luxury Watches & Timepieces", value: 384000, color: "#F59E0B" },
  { name: "Fine Art & Sculptures", value: 245000, color: "#D97706" },
  { name: "Automobiles & Motor Cycles", value: 189000, color: "#B45309" },
  { name: "Electronics & Tech Artifacts", value: 124000, color: "#71717A" },
  { name: "Jewelry & Precious Gems", value: 98000, color: "#9CA3AF" },
];

export const CategoryDistributionChart: React.FC<CategoryDistributionChartProps> = ({
  data = defaultCategories,
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const totalValue = data.reduce((acc, item) => acc + item.value, 0) || 1;

  let accumulatedAngle = 0;
  const segments = data.map((item) => {
    const percentage = item.value / totalValue;
    const angle = percentage * 360;
    const startAngle = accumulatedAngle;
    const endAngle = accumulatedAngle + angle;
    accumulatedAngle = endAngle;

    return {
      ...item,
      percentage: Math.round(percentage * 100),
      startAngle,
      endAngle,
    };
  });

  const size = 190;
  const center = size / 2;
  const radius = 68;
  const strokeWidth = 20;

  const getArcPath = (startAngle: number, endAngle: number) => {
    const startRad = ((startAngle - 90) * Math.PI) / 180;
    const endRad = ((endAngle - 90) * Math.PI) / 180;

    const x1 = center + radius * Math.cos(startRad);
    const y1 = center + radius * Math.sin(startRad);
    const x2 = center + radius * Math.cos(endRad);
    const y2 = center + radius * Math.sin(endRad);

    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`;
  };

  const activeSegment = hoveredIdx !== null ? segments[hoveredIdx] : null;

  return (
    <div className="bg-card text-card-foreground border border-border/80 rounded-2xl p-5 shadow-md backdrop-blur-xl transition-colors duration-300 space-y-4">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <PieChart className="w-4 h-4 text-amber-500" />
          <h3 className="text-sm font-bold text-foreground font-heading">GMV Category Breakdown</h3>
        </div>
        <span className="text-[10px] font-mono font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full uppercase">
          5 SECTORS
        </span>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 py-1">
        {/* Donut Chart SVG */}
        <div className="relative w-44 h-44 flex items-center justify-center shrink-0">
          <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full transform -rotate-90">
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeOpacity={0.1}
              strokeWidth={strokeWidth}
            />

            {segments.map((seg, idx) => {
              const isHovered = hoveredIdx === idx;
              return (
                <path
                  key={idx}
                  d={getArcPath(seg.startAngle, seg.endAngle - 0.5)}
                  fill="none"
                  stroke={seg.color}
                  strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                  className="transition-all duration-200 cursor-pointer"
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                />
              );
            })}
          </svg>

          <div className="absolute inset-0 m-auto w-24 h-24 rounded-full bg-card border border-border flex flex-col items-center justify-center text-center p-2 pointer-events-none shadow-xs">
            {activeSegment ? (
              <>
                <span className="text-[9px] uppercase font-mono text-muted-foreground truncate max-w-[80px]">
                  {activeSegment.name}
                </span>
                <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400 mt-0.5">
                  ${(activeSegment.value / 1000).toFixed(0)}k
                </span>
                <span className="text-[9px] font-mono text-foreground font-semibold">
                  {activeSegment.percentage}% SHARE
                </span>
              </>
            ) : (
              <>
                <span className="text-[9px] uppercase font-mono text-muted-foreground">TOTAL GMV</span>
                <span className="text-xs font-mono font-bold text-foreground mt-0.5">
                  ${(totalValue / 1000).toFixed(0)}k
                </span>
                <span className="text-[9px] text-muted-foreground mt-0.5">Hover segment</span>
              </>
            )}
          </div>
        </div>

        {/* Legend List */}
        <div className="flex-1 space-y-2 w-full">
          {segments.map((seg, idx) => {
            const isHovered = hoveredIdx === idx;
            return (
              <div
                key={idx}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                className={`flex items-center justify-between p-2 rounded-xl border text-xs transition-all cursor-pointer ${
                  isHovered
                    ? "bg-amber-500/10 border-amber-500/40 text-foreground font-semibold"
                    : "bg-muted/50 border-border/60 text-muted-foreground hover:bg-muted"
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
                  <span className="truncate text-xs font-medium text-foreground">{seg.name}</span>
                </div>
                <div className="font-mono text-right shrink-0 ml-2 text-[11px]">
                  <span className="font-bold text-foreground">${(seg.value / 1000).toFixed(0)}k</span>
                  <span className="text-muted-foreground ml-1">({seg.percentage}%)</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
