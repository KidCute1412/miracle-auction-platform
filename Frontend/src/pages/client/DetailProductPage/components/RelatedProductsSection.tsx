import React, { useEffect, useState } from "react";
import ProductCard from "@/components/common/ProductCard";
import HorizontalBar from "@/components/common/HorizontalBar";
import { Package, Sparkles } from "lucide-react";
import Loading from "@/components/common/Loading";
import { productService } from "@/services/product.service.ts";

type Products = {
  product_id: number;
  product_images: string[];
  product_name: string;
  current_price: number;
  buy_now_price: number;
  start_time: any;
  end_time: any;
  price_owner_username: string;
  bid_turns: string;
};

export default function RelatedProductsSection({ category_id, product_id }: { category_id?: number; product_id?: number }) {
  const [products, setProducts] = useState<Products[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const result = await productService.getRelated(product_id!, { category_id, limit: 5 });
        setProducts(result.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    if (category_id) {
      fetchData();
    }
  }, [category_id, product_id]);

  if (isLoading) {
    return (
      <div className="bg-card rounded-xl border border-border p-8">
        <Loading className="static w-full h-32 bg-transparent" />
      </div>
    );
  }

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <div className="rounded-xl overflow-hidden mb-[100px] border border-border bg-card">
      {/* Header Section */}
      <div className="relative px-8 py-6 bg-muted/50 border-b border-border">
        <div className="relative flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 bg-accent/10 rounded-lg">
            <Sparkles className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground tracking-tight">
              Related Products
            </h2>
            <p className="text-muted-foreground text-sm mt-0.5">
              Discover {products.length} similar products in this category
            </p>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="px-8 py-8 bg-card">
        <HorizontalBar className="h-[450px]">
          {products.map((item, index) => (
            <div 
              key={item.product_id} 
              className="flex justify-center px-2 animate__animated animate__fadeInUp"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <ProductCard
                className="scale-90 hover:scale-95 transition-transform duration-300 shadow-sm hover:shadow-md"
                product_image={item.product_images ? item.product_images[0] : ""}
                product_id={item.product_id}
                product_name={item.product_name}
                current_price={item.current_price}
                buy_now_price={item.buy_now_price}
                start_time={item.start_time}
                end_time={item.end_time}
                price_owner_username={item.price_owner_username}
                bid_turns={item.bid_turns}
              />
            </div>
          ))}
        </HorizontalBar>
      </div>

      {/* Empty State - Fallback */}
      {products.length === 0 && (
        <div className="px-8 py-12 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
              <Package className="w-8 h-8 text-muted-foreground/50" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            No Related Products
          </h3>
          <p className="text-muted-foreground text-sm">
            There are no similar products in this category at the moment.
          </p>
        </div>
      )}
    </div>
  );
}
