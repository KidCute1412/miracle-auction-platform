import React, { useState, useEffect } from "react";
import { Search, Filter, LayoutGrid, Grid3x3, List, DollarSign } from "lucide-react";
import SelectComponent from "@/components/common/Select";
import { CascadingCategorySelect } from "./CascadingCategorySelect";
import { FormattedPriceInput } from "./FormattedPriceInput";
import type { FilterState } from "./ActiveFilterChips";
import type { CategoryNode } from "@/hooks/useCategory";

export type ViewMode = "grid-3" | "grid-4" | "list";

type CatalogFilterBarProps = {
  filters: FilterState;
  categoryTree: CategoryNode[];
  onApplyFilters: (newFilters: Partial<FilterState>) => void;
  totalProductsCount: number;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onOpenMobileDrawer?: () => void;
};

export const CatalogFilterBar: React.FC<CatalogFilterBarProps> = ({
  filters,
  categoryTree,
  onApplyFilters,
  totalProductsCount,
  viewMode,
  onViewModeChange,
  onOpenMobileDrawer,
}) => {
  const [search, setSearch] = useState(filters.search || "");
  const [status, setStatus] = useState(filters.status || "active");
  const [sortBy, setSortBy] = useState(filters.sort_by || "time_asc");
  const [isPricePopoverOpen, setPricePopoverOpen] = useState(false);

  useEffect(() => {
    setSearch(filters.search || "");
    setStatus(filters.status || "active");
    setSortBy(filters.sort_by || "time_asc");
  }, [filters]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onApplyFilters({ search });
  };

  const handleCategorySelect = (cat1Id: string, cat2Id: string) => {
    onApplyFilters({ cat1_id: cat1Id, cat2_id: cat2Id });
  };

  const handlePriceApply = (min: string, max: string) => {
    onApplyFilters({ min_price: min, max_price: max });
    setPricePopoverOpen(false);
  };

  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus);
    onApplyFilters({ status: newStatus });
  };

  const handleSortChange = (newSort: string) => {
    setSortBy(newSort);
    onApplyFilters({ sort_by: newSort });
  };

  const sortItems = [
    { value: "time_asc", content: "Ending Soonest" },
    { value: "time_desc", content: "Time: Longest Remaining" },
    { value: "price_asc", content: "Price: Low to High" },
    { value: "price_desc", content: "Price: High to Low" },
    { value: "created_desc", content: "Newest Listings" },
    { value: "bids_desc", content: "Most Bids" },
  ];

  const isPriceActive = filters.min_price !== "" || filters.max_price !== "";

  return (
    <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-sm transition-all duration-300">
      <div className="flex flex-col gap-4">
        {/* Row 1: Search keyword input & Sort & View Mode Toggles */}
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="relative flex-1 max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <form onSubmit={handleSearchSubmit}>
              <input
                type="text"
                placeholder="Search products by keyword..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-24 py-2.5 bg-muted/40 border border-border rounded-xl outline-none focus:border-accent focus:bg-background transition-all duration-200 text-sm text-foreground"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-accent text-accent-foreground hover:opacity-90 cursor-pointer px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs"
              >
                Search
              </button>
            </form>
          </div>

          <div className="flex items-center gap-3">
            {/* Sort selector */}
            <div className="w-48 sm:w-52">
              <SelectComponent
                items={sortItems}
                placeholder="Sort products"
                value={sortBy}
                setState={handleSortChange}
              />
            </div>

            {/* View Density Switcher */}
            <div className="hidden sm:flex items-center gap-1 bg-muted/40 p-1 rounded-xl border border-border">
              <button
                type="button"
                onClick={() => onViewModeChange("grid-3")}
                title="3-Column Grid"
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === "grid-3"
                    ? "bg-accent text-accent-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Grid3x3 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => onViewModeChange("grid-4")}
                title="4-Column Grid"
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === "grid-4"
                    ? "bg-accent text-accent-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => onViewModeChange("list")}
                title="List View"
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === "list"
                    ? "bg-accent text-accent-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* Mobile Filter Sheet Trigger */}
            {onOpenMobileDrawer && (
              <button
                type="button"
                onClick={onOpenMobileDrawer}
                className="md:hidden flex items-center justify-center gap-2 px-3 py-2 bg-muted/60 border border-border rounded-xl text-sm font-semibold text-foreground cursor-pointer"
              >
                <Filter className="w-4 h-4 text-accent" />
                Filters
              </button>
            )}
          </div>
        </div>

        {/* Row 2: Cascading Category Dropdown + Formatted Price Filter + Status Selector */}
        <div className="hidden md:flex flex-wrap gap-3 items-center justify-between pt-3 border-t border-border/40">
          <div className="flex flex-wrap gap-3 items-center">
            {/* Cascading Category Selector */}
            <CascadingCategorySelect
              categoryTree={categoryTree}
              activeCat1Id={filters.cat1_id}
              activeCat2Id={filters.cat2_id}
              onSelectCategory={handleCategorySelect}
            />

            {/* Formatted Price Filter Popover / Box */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setPricePopoverOpen(!isPricePopoverOpen)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                  isPriceActive
                    ? "bg-accent/15 border-accent text-accent font-bold"
                    : "bg-muted/40 border-border text-foreground hover:bg-muted/60"
                }`}
              >
                <DollarSign className="w-3.5 h-3.5 text-accent" />
                Price Filter
              </button>

              {isPricePopoverOpen && (
                <div className="absolute left-0 top-full mt-2 w-80 bg-card border border-border rounded-2xl p-3 shadow-xl z-30 animate-fadeIn">
                  <FormattedPriceInput
                    minPrice={filters.min_price}
                    maxPrice={filters.max_price}
                    onApplyPrice={handlePriceApply}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Auction Status Pills */}
          <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-xl border border-border">
            {[
              { id: "active", label: "Active" },
              { id: "buy_now", label: "Buy Now" },
              { id: "ended", label: "Ended" },
              { id: "all", label: "All" },
            ].map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => handleStatusChange(st.id)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg cursor-pointer transition-all ${
                  status === st.id
                    ? "bg-accent text-accent-foreground shadow-xs font-bold"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        {/* Count summary */}
        <div className="flex justify-between items-center text-xs font-medium text-muted-foreground pt-1">
          <span>Found <strong className="text-accent font-semibold">{totalProductsCount}</strong> product{totalProductsCount !== 1 ? "s" : ""}</span>
        </div>
      </div>
    </div>
  );
};
