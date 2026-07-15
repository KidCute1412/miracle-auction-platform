import { Zap, Lock, Trophy, BookOpen, Crown, ShieldCheck, Heart, Info } from "lucide-react";
import useIntersectionObserver from "@/hooks/useIntersectionObserver";
import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { productService } from "@/services/product.service.ts";
import BeautifulAuctioneer from "./BeautifulAuctioneer";
import { slugify } from "@/utils/make_slug";

// Scenic cosmic/nebula background with orbiting rings and floating stars/particles
const ScenicBackground = () => {
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; size: number; delay: number; duration: number }[]>([]);
  const [shootingStars, setShootingStars] = useState<{ id: number; top: number; left: number; delay: number; duration: number; length: number }[]>([]);

  useEffect(() => {
    // Fireflies / floating glow spots: more quantity, larger size, smooth floating
    const arr = Array.from({ length: 35 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 5 + 4, // Larger size: 4px to 9px
      delay: Math.random() * -10,  // Negative delay to start immediately at different phases
      duration: 6 + Math.random() * 8, // Longer duration for smooth floating
    }));
    setParticles(arr);

    // Redesigned shooting stars
    const stars = Array.from({ length: 6 }).map((_, i) => ({
      id: i,
      top: Math.random() * 40,      // Keep in upper/mid region
      left: 20 + Math.random() * 70, // Across the width
      delay: Math.random() * 12,     // Distributed delays
      duration: 3 + Math.random() * 3, // Faster and smoother duration
      length: 80 + Math.random() * 100, // Varying tail lengths
    }));
    setShootingStars(stars);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Shooting stars & Fireflies styles */}
      <style>{`
        @keyframes shoot {
          0% {
            transform: translate3d(0, 0, 0) rotate(-45deg) scale(0);
            opacity: 0;
          }
          2% {
            opacity: 1;
            transform: translate3d(0, 0, 0) rotate(-45deg) scale(1);
          }
          15% {
            transform: translate3d(-600px, 600px, 0) rotate(-45deg) scale(1);
            opacity: 0;
          }
          100% {
            transform: translate3d(-600px, 600px, 0) rotate(-45deg) scale(0);
            opacity: 0;
          }
        }

        .shooting-star-line {
          position: absolute;
          height: 2px;
          background: linear-gradient(to right, rgba(255, 255, 255, 1) 0%, rgba(226, 184, 59, 0.7) 30%, rgba(226, 184, 59, 0) 100%);
          transform-origin: left center;
          animation: shoot infinite cubic-bezier(0.25, 1, 0.5, 1);
          opacity: 0;
          transform: rotate(-45deg) scale(0);
        }

        .shooting-star-line::before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 5px;
          height: 5px;
          background: #ffffff;
          border-radius: 50%;
          box-shadow: 
            0 0 8px 2px #ffffff,
            0 0 16px 4px rgba(226, 184, 59, 0.8);
        }

        @keyframes float-firefly {
          0%, 100% {
            transform: translate(0, 0) scale(0.8);
            opacity: 0.15;
          }
          50% {
            transform: translate(25px, -35px) scale(1.2);
            opacity: 0.85;
          }
        }

        .firefly-spot {
          position: absolute;
          background: radial-gradient(circle, rgba(226, 184, 59, 1) 0%, rgba(226, 184, 59, 0.2) 60%, rgba(226, 184, 59, 0) 100%);
          border-radius: 50%;
          filter: drop-shadow(0 0 6px rgba(226, 184, 59, 0.8));
          animation: float-firefly infinite ease-in-out;
        }
      `}</style>

      {/* Render Shooting Stars */}
      {shootingStars.map((star) => (
        <div
          key={star.id}
          className="shooting-star-line"
          style={{
            top: `${star.top}%`,
            left: `${star.left}%`,
            width: `${star.length}px`,
            animationDelay: `${star.delay}s`,
            animationDuration: `${star.duration}s`,
          }}
        />
      ))}

      {/* Elegant orbiting dashed rings */}
      <div className="absolute inset-0 flex items-center justify-center opacity-20">
        <div className="absolute w-[900px] h-[900px] rounded-full border border-accent/40 border-dashed animate-[spin_120s_linear_infinite]" />
        <div className="absolute w-[600px] h-[600px] rounded-full border border-indigo-400/30 border-dashed animate-[spin_80s_linear_infinite_reverse]" />
        <div className="absolute w-[400px] h-[400px] rounded-full border border-accent/20 border-dotted animate-[spin_50s_linear_infinite]" />
      </div>

      {/* Floating starry firefly particles */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="firefly-spot"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
};

// Infinite scrolling ledger of prestige bids
const PrestigeLedgerMarquee = () => {
  const items = [
    "Lord Sterling bid $185,000 on Miracle Celestial Astrolabe",
    "Duchess Claire acquired Doge of Venice Medal for $42,500",
    "Countess Sarah bid $120,000 on Astral Chronometer",
    "Archduke Franz listed Royal Sapphire Sceptre",
    "Baroness Vance bid $68,000 on Sovereign Astrolabe",
  ];

  return (
    <div className="relative w-full bg-card/40 backdrop-blur-md py-4 overflow-hidden z-10 my-6">
      <div className="flex whitespace-nowrap gap-16 animate-marquee">
        {[...items, ...items].map((text, i) => (
          <div key={i} className="flex items-center gap-2.5 text-xs font-semibold tracking-wider text-muted-foreground">
            <Crown className="w-4 h-4 text-accent animate-pulse" />
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
          animation: marquee 35s linear infinite;
        }
      `}</style>
    </div>
  );
};



// Trust Pillars
const VanguardTrustPillars = () => {
  const { ref, hasIntersected } = useIntersectionObserver();

  return (
    <div
      ref={ref}
      className={`relative bg-card/20 backdrop-blur-md py-12 px-6 rounded-3xl mx-4 my-8 transition-all duration-1000 ${
        hasIntersected ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-2xl bg-card/40 hover:bg-card/60 transition-all duration-300 group">
            <Zap className="w-6 h-6 text-accent mb-4 transition-transform group-hover:scale-110" />
            <h4 className="text-sm font-bold text-foreground mb-2">Real-Time Bidding</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Instantaneous live bid matching powered by fully optimized, low-latency Socket.io protocols.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-card/40 hover:bg-card/60 transition-all duration-300 group">
            <Lock className="w-6 h-6 text-accent mb-4 transition-transform group-hover:scale-110" />
            <h4 className="text-sm font-bold text-foreground mb-2">Protected Escrow Vault</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Complete financial settlement backed by secure multi-signature escrow guidelines.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-card/40 hover:bg-card/60 transition-all duration-300 group">
            <Trophy className="w-6 h-6 text-accent mb-4 transition-transform group-hover:scale-110" />
            <h4 className="text-sm font-bold text-foreground mb-2">Verified Provenance</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              All artifacts are guaranteed authentic and certified by leading global horology & jewelry panels.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Immersive Centerpiece Hero Layout
const Hero = () => {
  const { ref, hasIntersected } = useIntersectionObserver();
  const heroRef = useRef<HTMLDivElement>(null);
  const [isSmiling, setIsSmiling] = useState(false);
  const [featuredProduct, setFeaturedProduct] = useState<any>(null);

  useEffect(() => {
    async function fetchFeatured() {
      try {
        const response = await productService.getHighestPrice();
        if (response.data && response.data.length > 0) {
          setFeaturedProduct(response.data[0]);
        }
      } catch (error) {
        console.error("Failed to fetch featured product", error);
      }
    }
    fetchFeatured();
  }, []);

  return (
    <div
      ref={ref}
      className={`relative py-16 md:py-20 bg-transparent overflow-hidden transition-all duration-1000 ${
        hasIntersected ? "opacity-100" : "opacity-0"
      }`}
    >
      <style>{`
        @keyframes elegantFadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes shimmer-sweep-btn {
          0% { left: -150%; }
          50% { left: 150%; }
          100% { left: 150%; }
        }
        .animate-elegant-reveal {
          opacity: 0;
          animation: elegantFadeInUp 1.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .gold-glow-text {
          background: #e2b83b;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          display: inline-block;
          cursor: default;
          filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.15));
        }
        .dark .gold-glow-text {
          background: linear-gradient(135deg, #e2b83b 0%, #fff6d6 50%, #e2b83b 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          filter: none;
        }
        .gold-glow-text:hover {
          transform: translateY(-3px) scale(1.05);
          filter: drop-shadow(0 0 10px rgba(226, 184, 59, 0.7));
        }
        .animate-shimmer-button {
          position: relative;
          overflow: hidden;
        }
        .animate-shimmer-button::after {
          content: '';
          position: absolute;
          top: 0;
          left: -150%;
          width: 50%;
          height: 100%;
          background: linear-gradient(
            to right,
            transparent,
            rgba(255, 255, 255, 0.15),
            transparent
          );
          transform: skewX(-25deg);
          animation: shimmer-sweep-btn 4s infinite ease-in-out;
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
            <div className={`flex items-center gap-4 mb-3 text-[9px] font-mono tracking-[0.25em] text-muted-foreground/35 uppercase select-none ${hasIntersected ? "animate-elegant-reveal" : "opacity-0"}`}>
              <span>LOC: 21.0285° N, 105.8542° E</span>
              <span className="w-1.5 h-1.5 rounded-full bg-accent/40 animate-ping" />
              <span>EST. 2026 // SECURE NODE</span>
            </div>

            <div className={`inline-flex items-center gap-2 mb-6 bg-card px-3.5 py-1.5 rounded-full ${hasIntersected ? "animate-elegant-reveal delay-100" : "opacity-0"}`}>
              <Crown className="w-4 h-4 text-accent animate-pulse" />
              <span className="text-[9px] font-black tracking-widest text-card-foreground uppercase">
                VANGUARD ELITE HALL
              </span>
            </div>

            <h1 className={`mb-4 text-4xl sm:text-6xl font-heading font-black leading-none text-foreground ${hasIntersected ? "animate-elegant-reveal delay-200" : "opacity-0"}`}>
              Miracle{" "}
              <span className="gold-glow-text">
                Auction
              </span>
            </h1>

            <p className={`text-sm text-muted-foreground max-w-lg mb-8 leading-relaxed ${hasIntersected ? "animate-elegant-reveal delay-300" : "opacity-0"}`}>
              Acquire verified heritage art, precision horology, and state jewels through an elite bidding network. Meet our AI auctioneer, always ready to facilitate your secure bidding escrow.
            </p>

            {/* Asymmetric, borderless, premium Website Introduction */}
            <div className={`w-full max-w-lg p-8 rounded-3xl rounded-tr-[80px] rounded-bl-[80px] bg-card/35 backdrop-blur-xl relative overflow-hidden group transition-all duration-500 hover:-translate-y-1 ${hasIntersected ? "animate-elegant-reveal delay-400" : "opacity-0"}`}>
              {/* Decorative elements */}
              <div className="absolute -top-12 -left-12 w-32 h-32 bg-accent/10 rounded-full blur-2xl pointer-events-none group-hover:bg-accent/15 transition-all duration-500" />
              <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-accent/5 rounded-full blur-xl pointer-events-none" />
              
              {/* Huge stylized watermark in background */}
              <div className="absolute right-6 bottom-2 text-7xl font-black text-foreground/[0.03] select-none pointer-events-none tracking-tighter uppercase font-heading">
                Miracle
              </div>
              
              <div className="flex items-center gap-2.5 mb-4 relative z-10">
                <Crown className="w-5 h-5 text-accent animate-pulse" />
                <span className="text-[10px] font-bold tracking-widest text-accent uppercase font-mono">
                  ABOUT MIRACLE AUCTION
                </span>
              </div>
              
              <h3 className="text-2xl font-black text-foreground mb-4 font-heading tracking-wide relative z-10">
                Where Heritage Meets Masterpiece
              </h3>
              
              <div className="border-l-2 border-accent/40 pl-4 mb-6 relative z-10">
                <p className="text-xs text-muted-foreground leading-relaxed font-light">
                  Welcome to <strong className="text-foreground font-semibold">Miracle Auction</strong> – the premier online bidding house for exclusive heritage art, precision horology, and rare artifacts. Each item is independently certified and secure escrow is fully guaranteed.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 relative z-10">
                <Link
                  to="/about"
                  className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 text-xs font-bold uppercase tracking-wider text-black bg-accent rounded-xl hover:bg-accent/90 transition-all hover:scale-105 shadow-sm cursor-pointer animate-shimmer-button"
                >
                  <Info size={14} />
                  <span>About Us</span>
                </Link>
                <Link
                  to="/my-products?type=my-favorites"
                  className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 text-xs font-bold uppercase tracking-wider text-accent border border-accent/20 rounded-xl hover:border-accent hover:bg-accent/5 transition-all hover:scale-105 cursor-pointer"
                >
                  <Heart className="fill-accent/10" size={14} />
                  <span>My Favorites</span>
                </Link>
              </div>
            </div>
          </div>

          <div className={`lg:col-span-5 flex justify-center items-center relative ${hasIntersected ? "animate-elegant-reveal delay-500" : "opacity-0"}`}>
            <BeautifulAuctioneer isSmiling={isSmiling} containerRef={heroRef} />
          </div>

        </div>
      </div>
    </div>
  );
};

function Section1() {
  return (
    <div className="bg-transparent text-foreground pb-12">
      <Hero />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <PrestigeLedgerMarquee />
        <VanguardTrustPillars />
      </div>
    </div>
  );
}

export default Section1;