import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { usePreventBodyLock } from "@/hooks/usePreventBodyLock";
import { useBreadcrumb } from "@/contexts/BreadcrumbContext";
import { categoryService } from "@/services/category.service.ts";
import { productService, type ProductFilterParams } from "@/services/product.service.ts";
import { CategoryPillsBar } from "./components/CategoryPillsBar";
import { CatalogFilterBar } from "./components/CatalogFilterBar";
import { CatalogFilterDrawer } from "./components/CatalogFilterDrawer";
import { ActiveFilterChips, type FilterState } from "./components/ActiveFilterChips";
import { ProductGrid, type ProductItem } from "./components/ProductGrid";
import type { CategoryNode } from "@/hooks/useCategory";
import { slugify } from "@/utils/make_slug";

export default function ListProductsPage() {
  usePreventBodyLock();
  const [searchParams, setSearchParams] = useSearchParams();
  const { setBreadcrumbs } = useBreadcrumb();

  const [categoryTree, setCategoryTree] = useState<CategoryNode[]>([]);
  const [products, setProducts] = useState<ProductItem[]>();
  const [isLoading, setLoading] = useState(true);
  const [isMobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(Number(searchParams.get("page")) || 1);
  const [numberOfPages, setNumberOfPages] = useState(1);
  const [totalQuantity, setTotalQuantity] = useState(0);

  const rawCat1 = searchParams.get("cat1_id") || "";
  const rawCat2 = searchParams.get("cat2_id") || "";

  // Auto-resolve parent Cat1 ID if URL only has cat2_id
  let resolvedCat1Id = rawCat1;
  const resolvedCat2Id = rawCat2;

  if (rawCat2 && categoryTree.length > 0) {
    for (const parent of categoryTree) {
      if (parent.children?.some((c) => String(c.id) === String(rawCat2))) {
        resolvedCat1Id = String(parent.id);
        break;
      }
    }
  }

  const filterState: FilterState = {
    search: searchParams.get("search") || searchParams.get("query") || "",
    cat1_id: resolvedCat1Id,
    cat2_id: resolvedCat2Id,
    min_price: searchParams.get("min_price") || "",
    max_price: searchParams.get("max_price") || "",
    status: searchParams.get("status") || "active",
    sort_by: searchParams.get("sort_by") || "time_asc",
  };

  // Fetch Category Tree definition
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await categoryService.getAllClient();
        if (res?.data) {
          setCategoryTree(res.data);
        }
      } catch (err) {
        console.error("Error fetching category tree:", err);
      }
    };
    fetchCategories();
  }, []);

  // Sync Navigation Breadcrumb
  useEffect(() => {
    if (resolvedCat2Id && categoryTree.length > 0) {
      let cat2Name = "";
      let cat1Name = "";
      let cat1IdNum = 0;

      for (const parent of categoryTree) {
        const matchSub = parent.children?.find((c) => String(c.id) === String(resolvedCat2Id));
        if (matchSub) {
          cat2Name = matchSub.name;
          cat1Name = parent.name;
          cat1IdNum = parent.id;
          break;
        }
      }

      if (cat2Name && cat1Name) {
        setBreadcrumbs([
          { label: "Home", path: "/" },
          { label: "Categories", path: "/categories" },
          {
            label: cat1Name,
            path: `/categories/${slugify(cat1Name)}-${cat1IdNum}`,
          },
          { label: cat2Name, path: null },
        ]);
        return;
      }
    }

    if (resolvedCat1Id && categoryTree.length > 0) {
      const matchCat1 = categoryTree.find((c) => String(c.id) === String(resolvedCat1Id));
      if (matchCat1) {
        setBreadcrumbs([
          { label: "Home", path: "/" },
          { label: "Categories", path: "/categories" },
          { label: matchCat1.name, path: null },
        ]);
        return;
      }
    }

    setBreadcrumbs([
      { label: "Home", path: "/" },
      { label: "Products Catalog", path: null },
    ]);
  }, [resolvedCat1Id, resolvedCat2Id, categoryTree, setBreadcrumbs]);

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

  const handleSelectCategoryPills = (cat1Id: string, cat2Id: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", "1");

    if (cat1Id) params.set("cat1_id", cat1Id);
    else params.delete("cat1_id");

    if (cat2Id) params.set("cat2_id", cat2Id);
    else params.delete("cat2_id");

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

        {/* 1-Click Category Navigation Pills Bar */}
        {categoryTree.length > 0 && (
          <div className="mb-6">
            <CategoryPillsBar
              categoryTree={categoryTree}
              activeCat1Id={resolvedCat1Id}
              activeCat2Id={resolvedCat2Id}
              onSelectCategory={handleSelectCategoryPills}
            />
          </div>
        )}

        {/* Filter Bar & Active Filter Badges */}
        <div className="space-y-3 mb-8">
          <CatalogFilterBar
            filters={filterState}
            categoryTree={categoryTree}
            onApplyFilters={handleApplyFilters}
            totalProductsCount={totalQuantity}
            onOpenMobileDrawer={() => setMobileDrawerOpen(true)}
          />

          <ActiveFilterChips
            filters={filterState}
            categoryTree={categoryTree}
            onRemoveFilter={handleRemoveSingleFilter}
            onClearAll={handleClearAllFilters}
          />
        </div>

        {/* Mobile Filter Drawer Sheet */}
        <CatalogFilterDrawer
          isOpen={isMobileDrawerOpen}
          onClose={() => setMobileDrawerOpen(false)}
          filters={filterState}
          categoryTree={categoryTree}
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
