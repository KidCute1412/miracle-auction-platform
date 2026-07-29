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

  // Auto slow rotation when idle
  useEffect(() => {
    if (isDragging) return;
    const timer = setInterval(() => {
      setRotationY((prev) => (prev + 0.4) % 360);
    }, 50);
    return () => clearInterval(timer);
  }, [isDragging]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    startXRef.current = e.clientX;
    startRotRef.current = rotationY;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - startXRef.current;
    setRotationY((startRotRef.current + deltaX * 0.5) % 360);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  if (!product) return null;

  const imageUrl = product.product_images?.[0] || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop";

  return (
    <section className="relative py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
      {/* Ambient background volumetric glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-accent/10 dark:bg-accent/[0.04] rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 bg-card/40 backdrop-blur-2xl border border-accent/20 rounded-3xl p-8 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
        {/* Header Ribbon */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-border/40">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-accent/10 text-accent border border-accent/30 shadow-lg shadow-accent/10">
              <Crown className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-[10px] font-mono font-bold tracking-[0.25em] text-accent uppercase">
                  SPOTLIGHT MASTERPIECE // LOT #001
                </span>
              </div>
              <h2 className="text-2xl md:text-4xl font-heading font-black text-foreground uppercase tracking-tight">
                3D Exhibition Showcase
              </h2>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 text-xs font-mono text-muted-foreground bg-card/80 border border-border/60 px-4 py-2 rounded-full select-none">
            <RefreshCw className="w-3.5 h-3.5 text-accent animate-spin" />
            <span>Interactive 360° Drag & Rotate</span>
          </div>
        </div>

        {/* 3D Showcase Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Product Details */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-accent/15 border border-accent/30 text-accent text-xs font-bold font-mono uppercase">
              <Flame className="w-4 h-4 fill-accent" />
              <span>Highest Valued Masterpiece</span>
            </div>

            <h3 className="text-3xl md:text-5xl font-heading font-black text-foreground tracking-tight leading-tight">
              {product.product_name}
            </h3>

            <p className="text-sm text-muted-foreground leading-relaxed">
              Certified authentic by leading panels. Currently experiencing intense bidding activity on the live node floor. Guaranteed settlement backed by multi-sig escrow guidelines.
            </p>

            {/* Price & Bid Stats Box */}
            <div className="grid grid-cols-2 gap-4 p-6 rounded-2xl bg-card/60 border border-accent/20 backdrop-blur-md">
              <div>
                <span className="text-[10px] font-mono uppercase text-muted-foreground tracking-wider block mb-1">
                  Current Highest Bid
                </span>
                <span className="text-2xl md:text-3xl font-black font-mono text-accent">
                  {formatVnd(product.current_price || 0)}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-muted-foreground tracking-wider block mb-1">
                  Buy-It-Now Instant
                </span>
                <span className="text-2xl md:text-3xl font-black font-mono text-foreground">
                  {product.buy_now_price ? formatVnd(product.buy_now_price) : "N/A"}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <button
                onClick={() => navigate(`/product/${slugify(product.product_name)}-${product.product_id}`)}
                className="flex-1 inline-flex items-center justify-center gap-2 px-8 py-4 text-xs font-bold uppercase tracking-wider text-black bg-accent rounded-2xl hover:bg-accent/90 transition-all hover:scale-105 shadow-lg shadow-accent/20 cursor-pointer"
              >
                <Zap size={16} fill="black" />
                <span>Place Live Bid Now</span>
              </button>
              <Link
                to="/products"
                className="inline-flex items-center justify-center gap-2 px-6 py-4 text-xs font-bold uppercase tracking-wider text-foreground border border-border/80 rounded-2xl hover:border-accent/50 hover:bg-accent/5 transition-all"
              >
                <span>View Full Catalog</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* Right Column: 3D Interactive Rotating Pedestal */}
          <div className="lg:col-span-6 flex items-center justify-center">
            <Card3DTilt maxTiltDeg={15} scale={1.04} className="w-full max-w-[420px]">
              <div
                className="relative w-full aspect-square flex flex-col items-center justify-center cursor-grab active:cursor-grabbing select-none preserve-3d"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                {/* 3D Volumetric Top Spotlight Cone */}
                <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-64 h-64 bg-gradient-to-b from-accent/30 via-accent/5 to-transparent rounded-full blur-2xl pointer-events-none" />

                {/* 3D Floating Product Image Frame */}
                <div
                  className="relative w-72 h-72 rounded-2xl p-3 bg-gradient-to-b from-accent/30 via-card/80 to-card border border-accent/40 shadow-2xl transition-transform duration-75 preserve-3d"
                  style={{
                    transform: `rotateY(${rotationY}deg) rotateX(8deg) translateZ(40px)`,
                  }}
                >
                  <img
                    src={imageUrl}
                    alt={product.product_name}
                    className="w-full h-full object-cover rounded-xl shadow-inner pointer-events-none"
                  />

                  {/* Authenticity Badge overlay */}
                  <div
                    className="absolute top-4 right-4 bg-card/90 border border-accent/40 text-accent px-3 py-1 rounded-full text-[10px] font-mono font-bold flex items-center gap-1 shadow-md"
                    style={{ transform: "translateZ(30px)" }}
                  >
                    <ShieldCheck size={12} />
                    <span>VERIFIED</span>
                  </div>
                </div>

                {/* 3D Pedestal Base Platform */}
                <div
                  className="relative w-80 h-20 -mt-8 rounded-full border border-accent/30 bg-gradient-to-r from-card via-accent/20 to-card shadow-[0_15px_35px_rgba(226,184,59,0.2)] flex items-center justify-center pointer-events-none"
                  style={{ transform: "rotateX(70deg) translateZ(-20px)" }}
                >
                  <div className="w-64 h-14 rounded-full border border-dashed border-accent/50 animate-[spin_30s_linear_infinite]" />
                  <div className="absolute w-44 h-10 rounded-full bg-accent/20 blur-md" />
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
