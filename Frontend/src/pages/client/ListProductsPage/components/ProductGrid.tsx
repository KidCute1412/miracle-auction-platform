import React from "react";
import ProductCard from "@/components/common/ProductCard";
import PaginationComponent from "@/components/common/Pagination";
import Loading from "@/components/common/Loading";
import { SearchX, RotateCcw } from "lucide-react";
import type { ViewMode } from "./CatalogFilterBar";

export type ProductItem = {
  product_id: number;
  product_images: string[];
  product_name: string;
  current_price: number;
  buy_now_price: number;
  start_time: any;
  end_time: any;
  price_owner_username: string;
  price_owner_id: number;
  bid_turns: string;
};

type ProductGridProps = {
  products: ProductItem[] | undefined;
  isLoading: boolean;
  numberOfPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  onClearFilters?: () => void;
  viewMode?: ViewMode;
};

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  isLoading,
  numberOfPages,
  currentPage,
  onPageChange,
  onClearFilters,
  viewMode = "grid-3",
}) => {
  if (isLoading) {
    return <Loading />;
  }

  if (!products || products.length === 0) {
    return (
      <div className="bg-card border border-border/80 rounded-2xl p-12 text-center my-6 shadow-sm transition-all">
        <div className="max-w-md mx-auto flex flex-col items-center">
          <div className="w-16 h-16 bg-muted/50 border border-border rounded-full flex items-center justify-center mb-4">
            <SearchX className="w-8 h-8 text-muted-foreground animate-bounce" />
          </div>
          <h3 className="text-xl font-bold font-heading text-foreground mb-2">
            No products match your criteria
          </h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-xs">
            Try adjusting your search terms, price range, or category filters to find available auctions.
          </p>
          {onClearFilters && (
            <button
              type="button"
              onClick={onClearFilters}
              className="bg-accent text-accent-foreground hover:opacity-90 px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-xs cursor-pointer flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Reset All Filters
            </button>
          )}
        </div>
      </div>
    );
  }

  const gridClass =
    viewMode === "grid-4"
      ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5"
      : viewMode === "list"
      ? "flex flex-col gap-4"
      : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6";

  return (
    <div className="space-y-8">
      {/* Product grid container */}
      <div className={gridClass}>
        {products.map((item) => (
          <div key={item.product_id} className="flex justify-center">
            <ProductCard
              className="w-full transition-transform duration-200 hover:-translate-y-1"
              product_image={item.product_images ? item.product_images[0] : ""}
              product_id={item.product_id}
              product_name={item.product_name}
              current_price={item.current_price}
              buy_now_price={item.buy_now_price}
              start_time={item.start_time}
              end_time={item.end_time}
              price_owner_username={item.price_owner_username}
              price_owner_id={item.price_owner_id}
              bid_turns={item.bid_turns}
            />
          </div>
        ))}
      </div>

      {/* Pagination control */}
      {numberOfPages > 1 && (
        <div className="flex justify-center pt-6 pb-2">
          <PaginationComponent
            numberOfPages={numberOfPages}
            currentPage={currentPage}
            controlPage={onPageChange}
          />
        </div>
      )}
    </div>
  );
};
