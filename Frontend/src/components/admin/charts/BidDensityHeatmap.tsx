import React, { useState } from "react";
import { Clock, HelpCircle } from "lucide-react";

interface BidDensityHeatmapProps {
  rangeLabel?: string;
  rangeKey?: string;
}

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const timeSlots = ["00-04h", "04-08h", "08-12h", "12-16h", "16-20h", "20-24h"];

// Density matrices per range key
const densityDataset: Record<string, number[][]> = {
  "7d": [
    [12, 5, 45, 120, 240, 480],
    [15, 8, 52, 140, 310, 520],
    [18, 10, 60, 160, 380, 640],
    [22, 12, 75, 190, 420, 710],
    [30, 15, 95, 260, 590, 890],
    [45, 20, 140, 340, 720, 960],
    [35, 18, 110, 290, 640, 880],
  ],
  "30d": [
    [48, 20, 180, 480, 960, 1920],
    [60, 32, 208, 560, 1240, 2080],
    [72, 40, 240, 640, 1520, 2560],
    [88, 48, 300, 760, 1680, 2840],
    [120, 60, 380, 1040, 2360, 3560],
    [180, 80, 560, 1360, 2880, 3840],
    [140, 72, 440, 1160, 2560, 3520],
  ],
  "3m": [
    [140, 60, 540, 1440, 2880, 5760],
    [180, 96, 624, 1680, 3720, 6240],
    [216, 120, 720, 1920, 4560, 7680],
    [264, 144, 900, 2280, 5040, 8520],
    [360, 180, 1140, 3120, 7080, 10680],
    [540, 240, 1680, 4080, 8640, 11520],
    [420, 216, 1320, 3480, 7680, 10560],
  ],
  "6m": [
    [280, 120, 1080, 2880, 5760, 11520],
    [360, 192, 1248, 3360, 7440, 12480],
    [432, 240, 1440, 3840, 9120, 15360],
    [528, 288, 1800, 4560, 10080, 17040],
    [720, 360, 2280, 6240, 14160, 21360],
    [1080, 480, 3360, 8160, 17280, 23040],
    [840, 432, 2640, 6960, 15360, 21120],
  ],
  "1y": [
    [560, 240, 2160, 5760, 11520, 23040],
    [720, 384, 2496, 6720, 14880, 24960],
    [864, 480, 2880, 7680, 18240, 30720],
    [1056, 576, 3600, 9120, 20160, 34080],
    [1440, 720, 4560, 12480, 28320, 42720],
    [2160, 960, 6720, 16320, 34560, 46080],
    [1680, 864, 5280, 13920, 30720, 42240],
  ],
};

export const BidDensityHeatmap: React.FC<BidDensityHeatmapProps> = ({
  rangeLabel = "Last 7 Days",
  rangeKey = "6m",
}) => {
  const [hoveredCell, setHoveredCell] = useState<{ day: string; slot: string; value: number } | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const densityMatrix = densityDataset[rangeKey] || densityDataset["6m"];
  const maxVal = Math.max(...densityMatrix.flat(), 1);

  const getHeatColor = (value: number) => {
    const ratio = value / maxVal;
    if (ratio < 0.1) return "bg-muted/40 border-border/40 text-muted-foreground";
    if (ratio < 0.25) return "bg-amber-500/20 border-amber-500/30 text-amber-700 dark:text-amber-300 font-medium";
    if (ratio < 0.5) return "bg-amber-500/40 border-amber-500/50 text-amber-900 dark:text-amber-200 font-bold";
    if (ratio < 0.75) return "bg-amber-500/70 border-amber-500 text-slate-950 font-bold";
    return "bg-amber-500 border-amber-400 text-slate-950 font-black shadow-xs";
  };

  return (
    <div className="bg-card text-card-foreground border border-border/80 rounded-2xl p-5 shadow-md backdrop-blur-xl transition-colors duration-300 space-y-4">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-bold text-foreground font-heading">Bidding Traffic Density</h3>
            <button
              onClick={() => setShowExplanation(!showExplanation)}
              className="text-muted-foreground hover:text-amber-500 transition-colors cursor-pointer"
              title="What is Bidding Traffic Density?"
            >
              <HelpCircle className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Hourly bid placement volume by day of week ({rangeLabel} calculation).
          </p>
        </div>
        <span className="text-[10px] font-mono font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full uppercase">
          PEAK: SAT 20-24h
        </span>
      </div>

      {showExplanation && (
        <div className="bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 p-3 rounded-xl text-xs space-y-1 animate-in fade-in duration-200">
          <p className="font-bold flex items-center gap-1">
            💡 How Bidding Traffic Density Works:
          </p>
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            Yes! For whatever timeframe range you select ({rangeLabel}), this matrix aggregates bid volume across 4-hour timeblocks for each day of the week (Monday to Sunday). It shows admins exactly when user bidding traffic peaks (e.g. Saturday 20:00–24:00) to help optimize auction close schedules and system anti-sniping readiness.
          </p>
        </div>
      )}

      <div className="w-full overflow-x-auto">
        <div className="min-w-[480px]">
          {/* Header Row */}
          <div className="grid grid-cols-7 gap-1 mb-1 text-center">
            <div className="text-[10px] font-mono text-muted-foreground text-left pl-1">DAY \ TIME</div>
            {timeSlots.map((slot, i) => (
              <div key={i} className="text-[10px] font-mono text-muted-foreground">
                {slot}
              </div>
            ))}
          </div>

          {/* Matrix Rows */}
          {days.map((day, dayIdx) => (
            <div key={dayIdx} className="grid grid-cols-7 gap-1 mb-1 items-center">
              <div className="text-xs font-mono font-bold text-foreground pl-1">{day}</div>
              {timeSlots.map((slot, slotIdx) => {
                const val = densityMatrix[dayIdx]?.[slotIdx] || 0;
                return (
                  <div
                    key={slotIdx}
                    onMouseEnter={() => setHoveredCell({ day, slot, value: val })}
                    onMouseLeave={() => setHoveredCell(null)}
                    className={`h-7 rounded-lg border flex items-center justify-center text-[10px] font-mono transition-all cursor-pointer ${getHeatColor(
                      val
                    )}`}
                  >
                    {val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend & Hover Info */}
      <div className="flex items-center justify-between pt-1 text-xs border-t border-border">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-[10px]">Density Scale:</span>
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <div className="w-2.5 h-2.5 rounded bg-muted border border-border" /> Low
            <div className="w-2.5 h-2.5 rounded bg-amber-500/40 ml-2" /> Medium
            <div className="w-2.5 h-2.5 rounded bg-amber-500 ml-2" /> Peak Traffic
          </div>
        </div>

        {hoveredCell ? (
          <div className="text-amber-600 dark:text-amber-400 font-mono text-[11px] font-bold">
            {hoveredCell.day} {hoveredCell.slot}: {hoveredCell.value.toLocaleString()} Bids
          </div>
        ) : (
          <div className="text-muted-foreground text-[10px] italic">Hover cell to inspect bid count</div>
        )}
      </div>
    </div>
  );
};
