import React, { useState, useEffect } from "react";
import { Activity, ShieldCheck, UserCheck, Radio, Globe } from "lucide-react";
import Card3DTilt from "@/components/common/Card3DTilt";
import { formatVnd } from "@/lib/money";

interface LiveBidEvent {
  id: string;
  bidder: string;
  location: string;
  item: string;
  price: number;
  timeAgo: string;
}

const recentActivityList: LiveBidEvent[] = [
  { id: "1", bidder: "Collector Sterling", location: "London, UK", item: "Patek Philippe Grand Complication", price: 1850000000, timeAgo: "12s ago" },
  { id: "2", bidder: "Collector Claire", location: "Paris, FR", item: "Rolex Daytona Paul Newman 1968", price: 620000000, timeAgo: "34s ago" },
  { id: "3", bidder: "Archduke Franz", location: "Vienna, AT", item: "Royal Sapphire Sceptre Lot 402", price: 2450000000, timeAgo: "1m ago" },
];

export const SectionLiveTerminal: React.FC = () => {
  const [bids] = useState<LiveBidEvent[]>(recentActivityList);
  const [activePulse, setActivePulse] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setActivePulse(false);
      setTimeout(() => setActivePulse(true), 100);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

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
                  LIVE SOCKET NODE STREAM
                </span>
              </div>
              <h2 className="text-xl md:text-2xl font-heading font-black text-foreground uppercase tracking-tight">
                Real-Time Bidding Activity
              </h2>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 text-xs font-mono px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
            <span>Sub-50ms Synchronized Node</span>
          </div>
        </div>

        {/* 3D Stacked Live Bids Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
          {bids.map((bid) => (
            <Card3DTilt key={bid.id} maxTiltDeg={5} scale={1.02}>
              <div className="relative p-5 rounded-2xl bg-card/60 border border-accent/20 backdrop-blur-xl shadow-md hover:border-accent/40 transition-all duration-300 flex flex-col justify-between h-40">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                      <UserCheck className="w-3.5 h-3.5 text-accent" />
                      <span>{bid.bidder}</span>
                    </div>
                    <span className="text-[10px] font-mono text-muted-foreground flex items-center gap-1">
                      <Globe size={10} />
                      {bid.location}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-foreground/90 line-clamp-1 mb-2">
                    {bid.item}
                  </h4>

                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-black font-mono text-accent">
                      {formatVnd(bid.price)}
                    </span>
                    <span className="text-[9px] font-mono text-emerald-400 font-bold bg-emerald-400/10 px-2 py-0.5 rounded-full border border-emerald-400/20">
                      + HIGHEST BID
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2.5 border-t border-border/40 text-[10px] font-mono text-muted-foreground">
                  <span className="flex items-center gap-1 text-emerald-400 font-bold">
                    <ShieldCheck size={12} />
                    Verified Escrow
                  </span>
                  <span>{bid.timeAgo}</span>
                </div>
              </div>
            </Card3DTilt>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SectionLiveTerminal;
