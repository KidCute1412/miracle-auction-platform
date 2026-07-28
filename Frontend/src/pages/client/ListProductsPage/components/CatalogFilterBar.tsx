import React, { useState, useEffect } from "react";
import { Search, Filter } from "lucide-react";
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

type CatalogFilterBarProps = {
  filters: FilterState;
  categories: CategoryItem[];
  subCategories: SubCategoryItem[];
  onApplyFilters: (newFilters: Partial<FilterState>) => void;
  totalProductsCount: number;
  onOpenMobileDrawer?: () => void;
};

export const CatalogFilterBar: React.FC<CatalogFilterBarProps> = ({
  filters,
  categories,
  subCategories,
  onApplyFilters,
  totalProductsCount,
  onOpenMobileDrawer,
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
  }, [filters]);

  const filteredSubCategories = cat1
    ? subCategories.filter((sub) => String(sub.cat1_id) === String(cat1))
    : subCategories;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onApplyFilters({ search, cat1_id: cat1, cat2_id: cat2, min_price: minPrice, max_price: maxPrice, status, sort_by: sortBy });
  };

  const handleCategory1Change = (val: string) => {
    const selectedCat1 = val === "all" ? "" : val;
    setCat1(selectedCat1);
    setCat2("");
    onApplyFilters({ cat1_id: selectedCat1, cat2_id: "" });
  };

  const handleCategory2Change = (val: string) => {
    const selectedCat2 = val === "all" ? "" : val;
    setCat2(selectedCat2);
    onApplyFilters({ cat2_id: selectedCat2 });
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

  const cat1SelectItems = [
    { value: "all", content: "All Categories" },
    ...categories.map((c) => ({ value: String(c.cat_id), content: c.cat_name })),
  ];

  const cat2SelectItems = [
    { value: "all", content: "All Subcategories" },
    ...filteredSubCategories.map((sc) => ({ value: String(sc.cat2_id), content: sc.cat2_name })),
  ];

  return (
    <div className="bg-card border border-border/80 rounded-2xl p-4 md:p-6 shadow-sm transition-all duration-300">
      <div className="flex flex-col gap-4">
        {/* Row 1: Search keyword input & sort dropdown */}
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="relative flex-1">
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
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-accent text-accent-foreground hover:opacity-90 cursor-pointer px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-xs"
              >
                Search
              </button>
            </form>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-full md:w-56">
              <SelectComponent
                items={sortItems}
                placeholder="Sort products"
                value={sortBy}
                setState={handleSortChange}
              />
            </div>

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

        {/* Row 2: Desktop Filter Bar Controls */}
        <div className="hidden md:flex flex-wrap gap-3 items-center justify-between pt-2 border-t border-border/40">
          <div className="flex flex-wrap gap-3 items-center">
            {/* Parent category selector */}
            <div className="w-44">
              <SelectComponent
                items={cat1SelectItems}
                placeholder="Parent Category"
                value={cat1 || "all"}
                setState={handleCategory1Change}
              />
            </div>

            {/* Subcategory selector */}
            <div className="w-44">
              <SelectComponent
                items={cat2SelectItems}
                placeholder="Subcategory"
                value={cat2 || "all"}
                setState={handleCategory2Change}
              />
            </div>

            {/* Price bounds inputs */}
            <div className="flex items-center gap-1.5 bg-muted/30 border border-border rounded-xl px-3 py-1.5 text-xs text-foreground">
              <span className="text-muted-foreground font-medium">Price:</span>
              <input
                type="number"
                placeholder="Min đ"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-20 bg-transparent outline-none text-xs text-foreground placeholder:text-muted-foreground"
              />
              <span className="text-muted-foreground">-</span>
              <input
                type="number"
                placeholder="Max đ"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-20 bg-transparent outline-none text-xs text-foreground placeholder:text-muted-foreground"
              />
              <button
                type="button"
                onClick={() => onApplyFilters({ min_price: minPrice, max_price: maxPrice })}
                className="text-xs text-accent font-semibold hover:underline ml-1 cursor-pointer"
              >
                Apply
              </button>
            </div>
          </div>

          {/* Auction Status Pill Buttons */}
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
