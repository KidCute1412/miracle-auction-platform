import HorizontalBar from "@/components/common/HorizontalBar";
import ProductCard from "@/components/common/ProductCard";
import Card3DTilt from "@/components/common/Card3DTilt";
import { useEffect, useState } from "react";
import { Clock, TrendingUp, DollarSign } from "lucide-react";
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
  price_owner_id: number;
  bid_turns: string;
};

export function Section2() {
  const [activeTab, setActiveTab] = useState<"ending" | "bids" | "price">("ending");
  const [endingProducts, setEndingProducts] = useState<Products[]>([]);
  const [bidsProducts, setBidsProducts] = useState<Products[]>([]);
  const [priceProducts, setPriceProducts] = useState<Products[]>([]);

  useEffect(() => {
    async function fetchAll() {
      try {
        const [resEnding, resBids, resPrice] = await Promise.all([
          productService.getEndingSoon(),
          productService.getMostBids(),
          productService.getHighestPrice(),
        ]);
        setEndingProducts(resEnding.data || []);
        setBidsProducts(resBids.data || []);
        setPriceProducts(resPrice.data || []);
      } catch (err) {
        console.error("Error loading products", err);
      }
    }
    fetchAll();
  }, []);

  const getActiveProducts = () => {
    if (activeTab === "ending") return endingProducts;
    if (activeTab === "bids") return bidsProducts;
    return priceProducts;
  };

  const activeList = getActiveProducts();

  return (
    <section className="relative py-16 px-4 sm:px-6 lg:px-8 text-foreground bg-background transition-colors duration-300">
      {/* Background ambient light effects */}
      <div className="absolute top-1/4 left-10 w-96 h-96 bg-accent/5 dark:bg-accent/[0.01] rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-accent/5 dark:bg-accent/[0.01] rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header & Interactive Tab Controls */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border/60">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span className="text-[10px] font-mono font-bold tracking-[0.2em] text-accent uppercase">
                UNIFIED MARKETPLACE RAIL
              </span>
            </div>
            <h2 className="text-2xl md:text-4xl font-heading font-black text-foreground tracking-tight uppercase">
              Curated Live Auctions
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Explore high-demand lots with 3D tilt interaction and real-time bid tracking
            </p>
          </div>

          {/* Tab Controls */}
          <div className="inline-flex p-1.5 rounded-2xl bg-card border border-border/60 backdrop-blur-xl shadow-md">
            <button
              onClick={() => setActiveTab("ending")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === "ending"
                  ? "bg-accent text-black shadow-md shadow-accent/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/5"
              }`}
            >
              <Clock size={14} />
              <span>Ending Soon</span>
            </button>
            <button
              onClick={() => setActiveTab("bids")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === "bids"
                  ? "bg-accent text-black shadow-md shadow-accent/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/5"
              }`}
            >
              <TrendingUp size={14} />
              <span>Most Active</span>
            </button>
            <button
              onClick={() => setActiveTab("price")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === "price"
                  ? "bg-accent text-black shadow-md shadow-accent/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/5"
              }`}
            >
              <DollarSign size={14} />
              <span>Highest Value</span>
            </button>
          </div>
        </div>

        {/* 3D Wrapped Products Carousel */}
        <div className="relative">
          <HorizontalBar className="h-[490px] rounded-3xl bg-accent/[0.015] dark:bg-accent/[0.003] border border-accent/10 shadow-[0_8px_30px_rgba(226,184,59,0.01)]">
            {activeList && activeList.length > 0 ? (
              activeList.map((item, index) => (
                <div key={index} className="flex justify-center px-3 py-4">
                  <Card3DTilt maxTiltDeg={8} scale={1.02}>
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
                  </Card3DTilt>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center w-full h-full text-muted-foreground text-sm font-mono">
                No active lots found in this section
              </div>
            )}
          </HorizontalBar>
        </div>
      </div>
    </section>
  );
}

export default Section2;