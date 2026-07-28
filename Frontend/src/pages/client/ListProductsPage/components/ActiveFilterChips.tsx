import React from "react";
import { X, RotateCcw } from "lucide-react";

export type FilterState = {
  search: string;
  cat1_id: string;
  cat2_id: string;
  cat1_name?: string;
  cat2_name?: string;
  min_price: string;
  max_price: string;
  status: string;
  sort_by: string;
};

type ActiveFilterChipsProps = {
  filters: FilterState;
  onRemoveFilter: (key: keyof FilterState) => void;
  onClearAll: () => void;
};

export const ActiveFilterChips: React.FC<ActiveFilterChipsProps> = ({
  filters,
  onRemoveFilter,
  onClearAll,
}) => {
  const activeChips: { key: keyof FilterState; label: string }[] = [];

  if (filters.search) {
    activeChips.push({ key: "search", label: `Search: "${filters.search}"` });
  }
  if (filters.cat2_name) {
    activeChips.push({ key: "cat2_id", label: `Subcategory: ${filters.cat2_name}` });
  } else if (filters.cat1_name) {
    activeChips.push({ key: "cat1_id", label: `Category: ${filters.cat1_name}` });
  }

  if (filters.min_price || filters.max_price) {
    const minFormatted = filters.min_price ? `${Number(filters.min_price).toLocaleString("vi-VN")}đ` : "0đ";
    const maxFormatted = filters.max_price ? `${Number(filters.max_price).toLocaleString("vi-VN")}đ` : "∞";
    activeChips.push({ key: "min_price", label: `Price: ${minFormatted} - ${maxFormatted}` });
  }

  if (filters.status && filters.status !== "active") {
    let statusText = filters.status;
    if (filters.status === "buy_now") statusText = "Buy Now Available";
    else if (filters.status === "ended") statusText = "Ended Auctions";
    else if (filters.status === "all") statusText = "All Statuses";
    activeChips.push({ key: "status", label: `Status: ${statusText}` });
  }

  if (activeChips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 pt-3 pb-1 border-t border-border/50 transition-all">
      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mr-1">
        Active Filters:
      </span>
      {activeChips.map((chip) => (
        <span
          key={chip.key}
          className="inline-flex items-center gap-1.5 px-3 py-1 bg-accent/10 border border-accent/30 text-accent font-medium text-xs rounded-full shadow-xs transition-all hover:bg-accent/20"
        >
          {chip.label}
          <button
            type="button"
            onClick={() => onRemoveFilter(chip.key)}
            className="hover:bg-accent/20 rounded-full p-0.5 transition-colors focus:outline-none"
            aria-label={`Remove filter ${chip.label}`}
          >
            <X className="w-3 h-3 text-accent" />
          </button>
        </span>
      ))}

      <button
        type="button"
        onClick={onClearAll}
        className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors ml-auto cursor-pointer"
      >
        <RotateCcw className="w-3 h-3" />
        Clear All
      </button>
    </div>
  );
};
