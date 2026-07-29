import { Crown, Heart, Info } from "lucide-react";
import useIntersectionObserver from "@/hooks/useIntersectionObserver";
import { Link } from "react-router-dom";
import { useState, useRef } from "react";
import BussinessGirl from "./BussinessGirl/BussinessGirl";

// Minimalist Vanguard Elite Ambient Background
export const ScenicBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Elegant minimalist grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2b83b0a_1px,transparent_1px),linear-gradient(to_bottom,#e2b83b0a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

      {/* Subtle orbiting dashed rings */}
      <div className="absolute inset-0 flex items-center justify-center opacity-15">
        <div className="absolute w-[800px] h-[800px] rounded-full border border-accent/30 border-dashed animate-[spin_160s_linear_infinite]" />
        <div className="absolute w-[500px] h-[500px] rounded-full border border-accent/20 border-dotted animate-[spin_100s_linear_infinite_reverse]" />
      </div>
    </div>
  );
};

// Infinite scrolling ledger of prestige bids
export const PrestigeLedgerMarquee = () => {
  const items = [
    "Patek Philippe Grand Complications bid $185,000",
    "Rolex Daytona Paul Newman acquired for $142,500",
    "1888 Imperial Gold Coin Lot #104 bid $120,000",
    "Royal Sapphire Sceptre listed by Certified Node",
    "Audemars Piguet Royal Oak Jumbo bid $68,000",
  ];

  return (
    <div className="relative w-full bg-card/40 backdrop-blur-md py-3 overflow-hidden z-10 my-4 border-y border-border/30">
      <div className="flex whitespace-nowrap gap-16 animate-marquee">
        {[...items, ...items].map((text, i) => (
          <div key={i} className="flex items-center gap-2.5 text-xs font-semibold tracking-wider text-muted-foreground">
            <Crown className="w-3.5 h-3.5 text-accent animate-pulse" />
            <span>{text}</span>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 40s linear infinite;
        }
      `}</style>
    </div>
  );
};

// Enterprise Metrics Ribbon
export const EnterpriseMetricsRibbon = () => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 rounded-3xl bg-card/40 backdrop-blur-xl border border-accent/20 my-6 shadow-xl">
      <div className="text-center p-3 border-r border-border/40 last:border-none">
        <span className="text-xl md:text-3xl font-black font-mono text-accent block">$12.8M+</span>
        <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Total Sales Volume</span>
      </div>
      <div className="text-center p-3 border-r border-border/40 last:border-none font-mono">
        <span className="text-xl md:text-3xl font-black font-mono text-foreground block">450+</span>
        <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Active Verified Lots</span>
      </div>
      <div className="text-center p-3 border-r border-border/40 last:border-none">
        <span className="text-xl md:text-3xl font-black font-mono text-emerald-400 block">&lt; 50ms</span>
        <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">WebSocket Latency</span>
      </div>
      <div className="text-center p-3">
        <span className="text-xl md:text-3xl font-black font-mono text-accent block">99.8%</span>
        <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Escrow Success Rate</span>
      </div>
    </div>
  );
};

// Immersive Centerpiece Hero Layout
const Hero = () => {
  const { ref, hasIntersected } = useIntersectionObserver();
  const heroRef = useRef<HTMLDivElement>(null);
  const [isSmiling] = useState(false);

  return (
    <div
      ref={ref}
      className={`relative pt-12 pb-8 md:pt-16 md:pb-12 bg-transparent overflow-hidden transition-all duration-1000 ${
        hasIntersected ? "opacity-100" : "opacity-0"
      }`}
    >
      <style>{`
        @keyframes elegantFadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-elegant-reveal {
          opacity: 0;
          animation: elegantFadeInUp 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .delay-100 { animation-delay: 150ms; }
        .delay-200 { animation-delay: 300ms; }
        .delay-300 { animation-delay: 450ms; }
        .delay-400 { animation-delay: 600ms; }
        .delay-500 { animation-delay: 750ms; }
      `}</style>
      <ScenicBackground />

      <div ref={heroRef} className="container relative z-10 mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            {/* System Status Tech Coordinates / Decor Text */}
            <div className={`flex items-center gap-4 mb-3 text-[9px] font-mono tracking-[0.25em] text-muted-foreground/50 uppercase select-none ${hasIntersected ? "animate-elegant-reveal" : "opacity-0"}`}>
              <span>SECURE NODE // REALTIME ESCROW</span>
              <span className="w-1.5 h-1.5 rounded-full bg-accent/60 animate-ping" />
              <span>EST. 2026</span>
            </div>

            <div className={`inline-flex items-center gap-2 mb-6 bg-card/80 border border-accent/20 px-3.5 py-1.5 rounded-full ${hasIntersected ? "animate-elegant-reveal delay-100" : "opacity-0"}`}>
              <Crown className="w-4 h-4 text-accent animate-pulse" />
              <span className="text-[9px] font-mono font-bold tracking-widest text-foreground uppercase">
                MIRACLE AUCTION HOUSE
              </span>
            </div>

            <h1 className={`mb-4 text-4xl sm:text-6xl font-heading font-black leading-none text-foreground ${hasIntersected ? "animate-elegant-reveal delay-200" : "opacity-0"}`}>
              Miracle{" "}
              <span className="text-accent">
                Auction
              </span>
            </h1>

            <p className={`text-sm text-muted-foreground max-w-lg mb-8 leading-relaxed ${hasIntersected ? "animate-elegant-reveal delay-300" : "opacity-0"}`}>
              Acquire certified heritage art, precision horology, and estate jewels through a low-latency live bidding network with full escrow protection.
            </p>

            {/* Asymmetric, borderless, premium Website Introduction */}
            <div className={`w-full max-w-lg p-8 rounded-3xl bg-card/40 border border-accent/20 backdrop-blur-xl relative overflow-hidden group transition-all duration-500 hover:-translate-y-0.5 ${hasIntersected ? "animate-elegant-reveal delay-400" : "opacity-0"}`}>
              <div className="flex items-center gap-2.5 mb-4 relative z-10">
                <Crown className="w-4 h-4 text-accent" />
                <span className="text-[10px] font-bold tracking-widest text-accent uppercase font-mono">
                  MIRACLE ENTERPRISE ESCROW
                </span>
              </div>
              
              <h3 className="text-xl font-bold text-foreground mb-3 font-heading tracking-wide relative z-10">
                Certified Provenance & Live Settlement
              </h3>
              
              <div className="border-l-2 border-accent/40 pl-4 mb-6 relative z-10">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Every listed lot is independently appraised by certified horological and luxury panels. Financial settlement is guaranteed through multi-signature escrow.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 relative z-10">
                <Link
                  to="/about"
                  className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 text-xs font-bold uppercase tracking-wider text-black bg-accent rounded-xl hover:bg-accent/90 transition-all hover:scale-102 cursor-pointer"
                >
                  <Info size={14} />
                  <span>About Our House</span>
                </Link>
                <Link
                  to="/my-products?type=my-favorites"
                  className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 text-xs font-bold uppercase tracking-wider text-foreground border border-border/80 rounded-xl hover:border-accent/50 hover:bg-accent/5 transition-all cursor-pointer"
                >
                  <Heart className="text-accent" size={14} />
                  <span>Saved Favorites</span>
                </Link>
              </div>
            </div>
          </div>

          <div className={`lg:col-span-5 flex justify-center items-center relative ${hasIntersected ? "animate-elegant-reveal delay-500" : "opacity-0"}`}>
            <BussinessGirl isSmiling={isSmiling} containerRef={heroRef} />
          </div>

        </div>

        {/* Embedded Metrics Ribbon directly inside Hero flow */}
        <div className="mt-12">
          <EnterpriseMetricsRibbon />
        </div>
      </div>
    </div>
  );
};

function Section1() {
  return (
    <div className="bg-transparent text-foreground">
      <Hero />
      <PrestigeLedgerMarquee />
    </div>
  );
}

export default Section1;