import HorizontalBar from "@/components/common/HorizontalBar";
import ProductCard from "@/components/common/ProductCard";
import { useEffect, useState } from "react";
import { Clock, TrendingUp, DollarSign } from "lucide-react";
import { productService } from "@/services/product.service.ts";

function Section2() {
  return (
    <div className="relative py-16 px-4 sm:px-6 lg:px-8 text-foreground bg-background transition-colors duration-300">
      {/* Background ambient light effects */}
      <div className="absolute top-1/4 left-10 w-96 h-96 bg-accent/5 dark:bg-accent/[0.01] rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-2/4 right-10 w-96 h-96 bg-accent/5 dark:bg-accent/[0.01] rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-20 w-96 h-96 bg-accent/5 dark:bg-accent/[0.01] rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-16">
        <Section21 />
        <Section22 />
        <Section23 />
      </div>
    </div>
  );
}

type Products = {
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

function Section21() {
  const [products, setProducts] = useState<Products[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await productService.getEndingSoon();
        setProducts(response.data);
      } catch (err) {
        console.error(err);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Premium Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-border/60">
        <div className="flex items-start gap-4">
          <div className="relative flex-shrink-0">
            <div className="absolute -inset-1 bg-gradient-to-r from-accent to-accent-foreground/50 rounded-2xl blur opacity-25" />
            <div className="relative bg-card border border-accent/25 p-3 rounded-2xl shadow-lg shadow-accent/5">
              <Clock className="w-6 h-6 text-accent animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              <span className="text-[10px] font-bold tracking-widest text-accent uppercase font-mono">
                URGENT LISTINGS
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-heading font-black text-foreground tracking-tight uppercase">
              Ending Soon
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Place your bids before time runs out and lock in your win
            </p>
          </div>
        </div>
      </div>

      {/* Products Carousel */}
      <div className="relative">
        <HorizontalBar className="h-[490px] rounded-3xl bg-accent/[0.015] dark:bg-accent/[0.003] border border-accent/10 shadow-[0_8px_30px_rgba(226,184,59,0.01)]">
          {products && products.length > 0 ? (
            products.map((item, index) => (
              <div key={index} className="flex justify-center px-3 py-4">
                <ProductCard
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
            ))
          ) : (
            <div className="flex items-center justify-center w-full h-full text-muted-foreground text-sm">
              No auctions ending soon
            </div>
          )}
        </HorizontalBar>
      </div>
    </div>
  );
}

function Section22() {
  const [products, setProducts] = useState<Products[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await productService.getMostBids();
        setProducts(response.data);
      } catch (err) {
        console.error(err);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Premium Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-border/60">
        <div className="flex items-start gap-4">
          <div className="relative flex-shrink-0">
            <div className="absolute -inset-1 bg-gradient-to-r from-accent to-accent-foreground/50 rounded-2xl blur opacity-25" />
            <div className="relative bg-card border border-accent/25 p-3 rounded-2xl shadow-lg shadow-accent/5">
              <TrendingUp className="w-6 h-6 text-accent animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              <span className="text-[10px] font-bold tracking-widest text-accent uppercase font-mono">
                HOT DEALS
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-heading font-black text-foreground tracking-tight uppercase">
              Most Bids
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Most popular items gaining high interaction and intense bidding action
            </p>
          </div>
        </div>
      </div>

      {/* Products Carousel */}
      <div className="relative">
        <HorizontalBar className="h-[490px] rounded-3xl bg-accent/[0.015] dark:bg-accent/[0.003] border border-accent/10 shadow-[0_8px_30px_rgba(226,184,59,0.01)]">
          {products && products.length > 0 ? (
            products.map((item, index) => (
              <div key={index} className="flex justify-center px-3 py-4">
                <ProductCard
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
            ))
          ) : (
            <div className="flex items-center justify-center w-full h-full text-muted-foreground text-sm">
              No highly active auctions at this moment
            </div>
          )}
        </HorizontalBar>
      </div>
    </div>
  );
}

function Section23() {
  const [products, setProducts] = useState<Products[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await productService.getHighestPrice();
        setProducts(response.data);
      } catch (err) {
        console.error(err);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Premium Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-border/60">
        <div className="flex items-start gap-4">
          <div className="relative flex-shrink-0">
            <div className="absolute -inset-1 bg-gradient-to-r from-accent to-accent-foreground/50 rounded-2xl blur opacity-25" />
            <div className="relative bg-card border border-accent/25 p-3 rounded-2xl shadow-lg shadow-accent/5">
              <DollarSign className="w-6 h-6 text-accent animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              <span className="text-[10px] font-bold tracking-widest text-accent uppercase font-mono">
                EXCLUSIVE MASTERPIECES
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-heading font-black text-foreground tracking-tight uppercase">
              Highest Price
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              The premium, high-value, and luxurious items currently listed on the marketplace
            </p>
          </div>
        </div>
      </div>

      {/* Products Carousel */}
      <div className="relative">
        <HorizontalBar className="h-[490px] rounded-3xl bg-accent/[0.015] dark:bg-accent/[0.003] border border-accent/10 shadow-[0_8px_30px_rgba(226,184,59,0.01)]">
          {products && products.length > 0 ? (
            products.map((item, index) => (
              <div key={index} className="flex justify-center px-3 py-4">
                <ProductCard
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
            ))
          ) : (
            <div className="flex items-center justify-center w-full h-full text-muted-foreground text-sm">
              No high value items listed yet
            </div>
          )}
        </HorizontalBar>
      </div>
    </div>
  );
}

export default Section2;