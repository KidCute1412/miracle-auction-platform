import React, { useState, useEffect, useRef } from "react";
import { Crown, Flame, ShieldCheck, ArrowRight, Zap, RefreshCw } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { productService } from "@/services/product.service.ts";
import { formatVnd } from "@/lib/money";
import { slugify } from "@/utils/make_slug";
import Card3DTilt from "@/components/common/Card3DTilt";

export const Section3DPedestal: React.FC = () => {
  const [product, setProduct] = useState<any>(null);
  const [rotationY, setRotationY] = useState(15);
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(0);
  const startRotRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchSpotlight() {
      try {
        const response = await productService.getHighestPrice();
        if (response.data && response.data.length > 0) {
          setProduct(response.data[0]);
        }
      } catch (err) {
        console.error("Failed to fetch spotlight product", err);
      }
    }
    fetchSpotlight();
  }, []);

  // Smooth continuous rotation using requestAnimationFrame
  useEffect(() => {
    if (isDragging) return;
    let lastTime = performance.now();

    const animate = (now: number) => {
      const delta = now - lastTime;
      lastTime = now;
      setRotationY((prev) => (prev + delta * 0.015) % 360);
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isDragging]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    startXRef.current = e.clientX;
    startRotRef.current = rotationY;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - startXRef.current;
    setRotationY((startRotRef.current + deltaX * 0.3) % 360);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  if (!product) return null;

  const imageUrl = product.product_images?.[0] || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop";

  return (
    <section className="relative py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
      <div className="relative z-10 bg-card/40 backdrop-blur-2xl border border-accent/20 rounded-3xl p-8 md:p-12 shadow-xl">
        {/* Header Ribbon */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-border/40">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-card border border-accent/30 text-accent shadow-md">
              <Crown className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-ping" />
                <span className="text-[10px] font-mono font-bold tracking-[0.2em] text-accent uppercase">
                  SPOTLIGHT MASTERPIECE
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-heading font-black text-foreground uppercase tracking-tight">
                3D Exhibition Pedestal
              </h2>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 text-xs font-mono text-muted-foreground bg-card/80 border border-border/60 px-3.5 py-1.5 rounded-full select-none">
            <RefreshCw className="w-3.5 h-3.5 text-accent animate-spin" />
            <span>Interactive Drag & Rotate</span>
          </div>
        </div>

        {/* 3D Showcase Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Product Details */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-bold font-mono uppercase">
              <Flame className="w-3.5 h-3.5 text-accent" />
              <span>Highest Valuation Lot</span>
            </div>

            <h3 className="text-3xl md:text-4xl font-heading font-black text-foreground tracking-tight leading-tight">
              {product.product_name}
            </h3>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Certified authentic by leading heritage panels. High active interest on the live floor. Guaranteed settlement backed by multi-sig escrow guidelines.
            </p>

            {/* Price & Bid Stats Box */}
            <div className="grid grid-cols-2 gap-4 p-5 rounded-2xl bg-card/60 border border-accent/20 backdrop-blur-md">
              <div>
                <span className="text-[10px] font-mono uppercase text-muted-foreground tracking-wider block mb-1">
                  Current Highest Bid
                </span>
                <span className="text-xl md:text-2xl font-black font-mono text-accent">
                  {formatVnd(product.current_price || 0)}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-muted-foreground tracking-wider block mb-1">
                  Buy-It-Now Instant
                </span>
                <span className="text-xl md:text-2xl font-black font-mono text-foreground">
                  {product.buy_now_price ? formatVnd(product.buy_now_price) : "N/A"}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={() => navigate(`/product/${slugify(product.product_name)}-${product.product_id}`)}
                className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-black bg-accent rounded-xl hover:bg-accent/90 transition-all hover:scale-102 cursor-pointer shadow-md"
              >
                <Zap size={15} fill="black" />
                <span>Place Live Bid Now</span>
              </button>
              <Link
                to="/products"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-foreground border border-border/80 rounded-xl hover:border-accent/40 hover:bg-accent/5 transition-all"
              >
                <span>View Full Catalog</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* Right Column: 3D Interactive Rotating Pedestal */}
          <div className="lg:col-span-6 flex items-center justify-center">
            <Card3DTilt maxTiltDeg={5} scale={1.02} className="w-full max-w-[400px]">
              <div
                className="relative w-full aspect-square flex flex-col items-center justify-center cursor-grab active:cursor-grabbing select-none preserve-3d"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                {/* 3D Floating Product Image Frame */}
                <div
                  className="relative w-64 h-64 rounded-2xl p-2.5 bg-card border border-accent/30 shadow-2xl transition-transform duration-75 preserve-3d"
                  style={{
                    transform: `rotateY(${rotationY}deg) rotateX(6deg) translateZ(30px)`,
                    willChange: "transform",
                  }}
                >
                  <img
                    src={imageUrl}
                    alt={product.product_name}
                    className="w-full h-full object-cover rounded-xl shadow-inner pointer-events-none"
                  />

                  {/* Authenticity Badge overlay */}
                  <div
                    className="absolute top-3 right-3 bg-card/90 border border-accent/40 text-accent px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold flex items-center gap-1 shadow-md"
                    style={{ transform: "translateZ(20px)" }}
                  >
                    <ShieldCheck size={11} />
                    <span>VERIFIED</span>
                  </div>
                </div>

                {/* 3D Pedestal Base Platform */}
                <div
                  className="relative w-72 h-16 -mt-6 rounded-full border border-accent/20 bg-gradient-to-r from-card via-accent/15 to-card shadow-lg flex items-center justify-center pointer-events-none"
                  style={{ transform: "rotateX(70deg) translateZ(-15px)" }}
                >
                  <div className="w-56 h-12 rounded-full border border-dashed border-accent/40 animate-[spin_40s_linear_infinite]" />
                </div>
              </div>
            </Card3DTilt>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Section3DPedestal;
