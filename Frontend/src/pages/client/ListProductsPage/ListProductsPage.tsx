import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { usePreventBodyLock } from "@/hooks/usePreventBodyLock";
import { useBreadcrumb } from "@/contexts/BreadcrumbContext";
import { categoryService } from "@/services/category.service.ts";
import { productService, type ProductFilterParams } from "@/services/product.service.ts";
import { CatalogFilterBar } from "./components/CatalogFilterBar";
import { CatalogFilterDrawer } from "./components/CatalogFilterDrawer";
import { ActiveFilterChips, type FilterState } from "./components/ActiveFilterChips";
import { ProductGrid, type ProductItem } from "./components/ProductGrid";
import { slugify } from "@/utils/make_slug";

export default function ListProductsPage() {
  usePreventBodyLock();
  const [searchParams, setSearchParams] = useSearchParams();
  const { setBreadcrumbs } = useBreadcrumb();

  const [categories, setCategories] = useState<{ cat_id: number; cat_name: string }[]>([]);
  const [subCategories, setSubCategories] = useState<{ cat2_id: number; cat2_name: string; cat1_id: number }[]>([]);
  const [products, setProducts] = useState<ProductItem[]>();
  const [isLoading, setLoading] = useState(true);
  const [isMobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(Number(searchParams.get("page")) || 1);
  const [numberOfPages, setNumberOfPages] = useState(1);
  const [totalQuantity, setTotalQuantity] = useState(0);

  const filterState: FilterState = {
    search: searchParams.get("search") || searchParams.get("query") || "",
    cat1_id: searchParams.get("cat1_id") || "",
    cat2_id: searchParams.get("cat2_id") || "",
    min_price: searchParams.get("min_price") || "",
    max_price: searchParams.get("max_price") || "",
    status: searchParams.get("status") || "active",
    sort_by: searchParams.get("sort_by") || "time_asc",
  };

  // Fetch Category level 1 & 2 definitions for dropdowns
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const [cat1Res, cat2Res] = await Promise.all([
          categoryService.getLevel1(),
          categoryService.getLevel2NoSlug(),
        ]);
        if (cat1Res?.data) setCategories(cat1Res.data);
        if (cat2Res?.data) setSubCategories(cat2Res.data);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };
    fetchCategories();
  }, []);

  // Update Navigation Breadcrumb based on selection
  useEffect(() => {
    const cat2_id = searchParams.get("cat2_id");
    const cat1_id = searchParams.get("cat1_id");

    if (cat2_id) {
      categoryService.getClientCat2(Number(cat2_id))
        .then((res) => {
          if (res?.data) {
            setBreadcrumbs([
              { label: "Home", path: "/" },
              { label: "Categories", path: "/categories" },
              {
                label: res.data.cat1_name,
                path: `/categories/${slugify(res.data.cat1_name)}-${res.data.cat1_id}`,
              },
              { label: res.data.cat2_name, path: null },
            ]);
            filterState.cat2_name = res.data.cat2_name;
            filterState.cat1_name = res.data.cat1_name;
          }
        })
        .catch(() => {});
    } else if (cat1_id && categories.length > 0) {
      const matchCat1 = categories.find((c) => String(c.cat_id) === String(cat1_id));
      if (matchCat1) {
        setBreadcrumbs([
          { label: "Home", path: "/" },
          { label: "Categories", path: "/categories" },
          { label: matchCat1.cat_name, path: null },
        ]);
      }
    } else {
      setBreadcrumbs([
        { label: "Home", path: "/" },
        { label: "Products Catalog", path: null },
      ]);
    }
  }, [searchParams, categories, setBreadcrumbs]);

  // Fetch product catalog items matching active filters
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const params: ProductFilterParams = {
        page: Number(searchParams.get("page")) || 1,
        limit: 6,
        search: searchParams.get("search") || searchParams.get("query") || undefined,
        cat1_id: searchParams.get("cat1_id") || undefined,
        cat2_id: searchParams.get("cat2_id") || undefined,
        min_price: searchParams.get("min_price") || undefined,
        max_price: searchParams.get("max_price") || undefined,
        status: searchParams.get("status") || "active",
        sort_by: searchParams.get("sort_by") || "time_asc",
      };

      const res = await productService.getPageList(params);

      if (res && (res.status === "success" || res.data)) {
        setProducts(res.data);
        setNumberOfPages(res.meta?.totalPages || res.numberOfPages || 1);
        setTotalQuantity(res.meta?.total || res.quantity || 0);
        setCurrentPage(Number(res.meta?.page || searchParams.get("page") || 1));
      } else {
        toast.error("Failed to load products");
      }
    } catch (err: any) {
      toast.error(err.message || "Server connection error");
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleApplyFilters = (newFilters: Partial<FilterState>) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", "1"); // Reset to page 1 on new filter apply

    Object.entries(newFilters).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== "") {
        params.set(key, String(val));
      } else {
        params.delete(key);
      }
    });

    setSearchParams(params);
  };

  const handleRemoveSingleFilter = (key: keyof FilterState) => {
    const params = new URLSearchParams(searchParams);
    params.delete(key);
    if (key === "cat1_id") params.delete("cat2_id");
    params.set("page", "1");
    setSearchParams(params);
  };

  const handleClearAllFilters = () => {
    setSearchParams({ page: "1", status: "active", sort_by: "time_asc" });
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    const params = new URLSearchParams(searchParams);
    params.set("page", String(newPage));
    setSearchParams(params);
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Title Header */}
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-heading font-extrabold text-foreground tracking-tight mb-2">
            Auction Product Catalog
          </h1>
          <p className="text-sm text-muted-foreground">
            Explore live auctions, place bids, or buy immediately across all product categories
          </p>
        </div>

        {/* Filter Bar & Active Filter Badges */}
        <div className="space-y-3 mb-8">
          <CatalogFilterBar
            filters={filterState}
            categories={categories}
            subCategories={subCategories}
            onApplyFilters={handleApplyFilters}
            totalProductsCount={totalQuantity}
            onOpenMobileDrawer={() => setMobileDrawerOpen(true)}
          />

          <ActiveFilterChips
            filters={filterState}
            onRemoveFilter={handleRemoveSingleFilter}
            onClearAll={handleClearAllFilters}
          />
        </div>

        {/* Mobile Filter Drawer Sheet */}
        <CatalogFilterDrawer
          isOpen={isMobileDrawerOpen}
          onClose={() => setMobileDrawerOpen(false)}
          filters={filterState}
          categories={categories}
          subCategories={subCategories}
          onApplyFilters={handleApplyFilters}
          onClearAll={handleClearAllFilters}
        />

        {/* Product Grid View */}
        <ProductGrid
          products={products}
          isLoading={isLoading}
          numberOfPages={numberOfPages}
          currentPage={currentPage}
          onPageChange={handlePageChange}
          onClearFilters={handleClearAllFilters}
        />
      </div>
    </div>
  );
}
