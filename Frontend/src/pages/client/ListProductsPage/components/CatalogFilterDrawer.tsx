import React, { useState, useEffect } from "react";
import { X, Search, RotateCcw } from "lucide-react";
import SelectComponent from "@/components/common/Select";
import type { FilterState } from "./ActiveFilterChips";

type CategoryItem = {
  cat_id: number;
  cat_name: string;
};

type SubCategoryItem = {
  cat2_id: number;
  cat2_name: string;
  cat1_id: number;
};

type CatalogFilterDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  categories: CategoryItem[];
  subCategories: SubCategoryItem[];
  onApplyFilters: (newFilters: Partial<FilterState>) => void;
  onClearAll: () => void;
};

export const CatalogFilterDrawer: React.FC<CatalogFilterDrawerProps> = ({
  isOpen,
  onClose,
  filters,
  categories,
  subCategories,
  onApplyFilters,
  onClearAll,
}) => {
  const [search, setSearch] = useState(filters.search || "");
  const [cat1, setCat1] = useState(filters.cat1_id || "");
  const [cat2, setCat2] = useState(filters.cat2_id || "");
  const [minPrice, setMinPrice] = useState(filters.min_price || "");
  const [maxPrice, setMaxPrice] = useState(filters.max_price || "");
  const [status, setStatus] = useState(filters.status || "active");
  const [sortBy, setSortBy] = useState(filters.sort_by || "time_asc");

  useEffect(() => {
    setSearch(filters.search || "");
    setCat1(filters.cat1_id || "");
    setCat2(filters.cat2_id || "");
    setMinPrice(filters.min_price || "");
    setMaxPrice(filters.max_price || "");
    setStatus(filters.status || "active");
    setSortBy(filters.sort_by || "time_asc");
  }, [filters, isOpen]);

  if (!isOpen) return null;

  const filteredSubCategories = cat1
    ? subCategories.filter((sub) => String(sub.cat1_id) === String(cat1))
    : subCategories;

  const handleApply = () => {
    onApplyFilters({
      search,
      cat1_id: cat1,
      cat2_id: cat2,
      min_price: minPrice,
      max_price: maxPrice,
      status,
      sort_by: sortBy,
    });
    onClose();
  };

  const cat1SelectItems = [
    { value: "all", content: "All Categories" },
    ...categories.map((c) => ({ value: String(c.cat_id), content: c.cat_name })),
  ];

  const cat2SelectItems = [
    { value: "all", content: "All Subcategories" },
    ...filteredSubCategories.map((sc) => ({ value: String(sc.cat2_id), content: sc.cat2_name })),
  ];

  const sortItems = [
    { value: "time_asc", content: "Ending Soonest" },
    { value: "time_desc", content: "Time: Longest Remaining" },
    { value: "price_asc", content: "Price: Low to High" },
    { value: "price_desc", content: "Price: High to Low" },
    { value: "created_desc", content: "Newest Listings" },
    { value: "bids_desc", content: "Most Bids" },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs transition-opacity duration-300 md:hidden">
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-card text-foreground border-l border-border p-6 shadow-2xl flex flex-col justify-between overflow-y-auto">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <h2 className="text-lg font-bold font-heading text-foreground">Filter Catalog</h2>
              <button
                type="button"
                onClick={onClose}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter inputs */}
            <div className="flex flex-col gap-5 py-6">
              {/* Keyword Search */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Keyword</label>
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search product title..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-muted/40 border border-border rounded-xl text-sm outline-none focus:border-accent text-foreground"
                  />
                </div>
              </div>

              {/* Parent Category */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Parent Category</label>
                <SelectComponent
                  items={cat1SelectItems}
                  placeholder="Select Parent Category"
                  value={cat1 || "all"}
                  setState={(val) => {
                    setCat1(val === "all" ? "" : val);
                    setCat2("");
                  }}
                />
              </div>

              {/* Subcategory */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Subcategory</label>
                <SelectComponent
                  items={cat2SelectItems}
                  placeholder="Select Subcategory"
                  value={cat2 || "all"}
                  setState={(val) => setCat2(val === "all" ? "" : val)}
                />
              </div>

              {/* Price Bounds */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Price Range (VND)</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Min Price"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="px-3 py-2 bg-muted/40 border border-border rounded-xl text-sm outline-none focus:border-accent text-foreground"
                  />
                  <input
                    type="number"
                    placeholder="Max Price"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="px-3 py-2 bg-muted/40 border border-border rounded-xl text-sm outline-none focus:border-accent text-foreground"
                  />
                </div>
              </div>

              {/* Status Pills */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Auction Status</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "active", label: "Active" },
                    { id: "buy_now", label: "Buy Now Available" },
                    { id: "ended", label: "Ended" },
                    { id: "all", label: "All Statuses" },
                  ].map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setStatus(st.id)}
                      className={`py-2 text-xs font-semibold rounded-xl border text-center cursor-pointer transition-all ${
                        status === st.id
                          ? "bg-accent text-accent-foreground border-accent font-bold"
                          : "bg-muted/40 border-border text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sorting */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Sort Order</label>
                <SelectComponent
                  items={sortItems}
                  placeholder="Select Sorting"
                  value={sortBy}
                  setState={setSortBy}
                />
              </div>
            </div>
          </div>

          {/* Footer CTA */}
          <div className="pt-4 border-t border-border flex gap-3">
            <button
              type="button"
              onClick={() => {
                onClearAll();
                onClose();
              }}
              className="flex-1 py-3 px-4 bg-muted/60 text-foreground font-semibold text-sm rounded-xl hover:bg-muted border border-border transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="flex-2 py-3 px-4 bg-accent text-accent-foreground font-bold text-sm rounded-xl hover:opacity-90 transition-all shadow-sm cursor-pointer"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
