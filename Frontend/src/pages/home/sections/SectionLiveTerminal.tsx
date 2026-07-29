import React, { useState, useEffect } from "react";
import { Activity, ShieldCheck, Radio, ArrowUpRight, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import Card3DTilt from "@/components/common/Card3DTilt";
import { productService } from "@/services/product.service.ts";
import { formatVnd } from "@/lib/money";
import { slugify } from "@/utils/make_slug";

interface ProductItem {
  product_id: number;
  product_name: string;
  current_price: number;
  price_owner_username?: string;
  bid_turns?: string | number;
  product_images?: string[];
}

export const SectionLiveTerminal: React.FC = () => {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [activePulse, setActivePulse] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLiveProducts() {
      try {
        const response = await productService.getMostBids();
        if (response.data && response.data.length > 0) {
          setProducts(response.data.slice(0, 3));
        }
      } catch (err) {
        console.error("Failed to fetch live activity products", err);
      } finally {
        setLoading(false);
      }
    }
    fetchLiveProducts();
  }, []);

  // Soft pulse indicator tick
  useEffect(() => {
    const interval = setInterval(() => {
      setActivePulse((prev) => !prev);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const maskName = (name?: string) => {
    if (!name) return "Anonymous";
    if (name.length <= 4) return name[0] + "***";
    return name.substring(0, 3) + "***";
  };

  return (
    <section className="relative py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10">
      <div className="bg-card/40 backdrop-blur-2xl border border-accent/20 rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-border/40 relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-card border border-accent/30 text-accent shadow-md">
              <Activity className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full bg-emerald-400 ${activePulse ? "animate-ping" : ""}`} />
                <span className="text-[10px] font-mono font-bold tracking-[0.2em] text-accent uppercase">
                  REALTIME BIDDING STREAM
                </span>
              </div>
              <h2 className="text-xl md:text-2xl font-heading font-black text-foreground uppercase tracking-tight">
                Active Bidding Floor
              </h2>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 text-xs font-mono px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
            <span>Synchronized Database Stream</span>
          </div>
        </div>

        {/* Live Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-40 rounded-2xl bg-card/20 border border-border/40 animate-pulse" />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
            {products.map((item) => {
              const targetUrl = `/product/${slugify(item.product_name)}-${item.product_id}`;

              return (
                <Card3DTilt key={item.product_id} maxTiltDeg={5} scale={1.02}>
                  <Link
                    to={targetUrl}
                    className="relative p-5 rounded-2xl bg-card/60 border border-accent/20 backdrop-blur-xl shadow-md hover:border-accent/40 transition-all duration-300 flex flex-col justify-between h-40 group block"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                          <TrendingUp className="w-3.5 h-3.5 text-accent" />
                          <span>Top Bidder: {maskName(item.price_owner_username)}</span>
                        </div>
                        <span className="text-[10px] font-mono text-accent font-bold px-2 py-0.5 rounded-full bg-accent/10 border border-accent/20">
                          {item.bid_turns ? `${item.bid_turns} Bids` : "Active"}
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-foreground/90 line-clamp-1 mb-2 group-hover:text-accent transition-colors font-heading">
                        {item.product_name}
                      </h4>

                      <div className="flex items-baseline gap-2">
                        <span className="text-lg font-black font-mono text-accent">
                          {formatVnd(item.current_price || 0)}
                        </span>
                        <span className="text-[9px] font-mono text-emerald-400 font-bold bg-emerald-400/10 px-2 py-0.5 rounded-full border border-emerald-400/20">
                          CURRENT PRICE
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2.5 border-t border-border/40 text-[10px] font-mono text-muted-foreground">
                      <span className="flex items-center gap-1 text-emerald-400 font-bold">
                        <ShieldCheck size={12} />
                        Verified Lot #{item.product_id}
                      </span>
                      <span className="flex items-center gap-0.5 text-accent font-bold group-hover:translate-x-0.5 transition-transform">
                        <span>Bid Now</span>
                        <ArrowUpRight size={12} />
                      </span>
                    </div>
                  </Link>
                </Card3DTilt>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-6 text-xs font-mono text-muted-foreground">
            No active bids currently streaming
          </div>
        )}
      </div>
    </section>
  );
};

export default SectionLiveTerminal;
