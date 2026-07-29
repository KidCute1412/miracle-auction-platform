import React from "react";
import { Lock, ShieldCheck, Zap, Truck, Award, CheckCircle2 } from "lucide-react";
import Card3DTilt from "@/components/common/Card3DTilt";

interface TrustPillar {
  icon: React.ElementType;
  title: string;
  badge: string;
  description: string;
  metrics: string;
}

const pillars: TrustPillar[] = [
  {
    icon: Lock,
    title: "Protected Escrow Vault",
    badge: "BANK-GRADE SSL",
    description: "Financial settlement is held in secured multi-signature escrow until item authentication and physical buyer delivery are confirmed.",
    metrics: "100% Settlement Guarantee",
  },
  {
    icon: ShieldCheck,
    title: "Verified Provenance",
    badge: "100% AUTHENTIC",
    description: "Every timepiece, fine art, and gem is independently appraised and certified by global horology & luxury heritage panels.",
    metrics: "Certified Certificate",
  },
  {
    icon: Zap,
    title: "Low Latency Matching",
    badge: "SUB-50MS SYNC",
    description: "High-speed WebSocket auction engine ensures instantaneous bid matching with zero delay and automated anti-sniping protection.",
    metrics: "< 50ms Latency Node",
  },
  {
    icon: Truck,
    title: "Global VIP Logistics",
    badge: "INSURED TRANSIT",
    description: "Armored, white-glove courier dispatch with full transit insurance coverage across 120+ international destinations.",
    metrics: "Fully Insured Express",
  },
];

export const SectionVault3D: React.FC = () => {
  return (
    <section className="relative py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-mono font-bold uppercase mb-3">
          <Award size={14} />
          <span>SECURITY & COMPLIANCE VAULT</span>
        </div>
        <h2 className="text-2xl md:text-4xl font-heading font-black text-foreground uppercase tracking-tight mb-3">
          Enterprise Trust Standards
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Engineered for high-net-worth collectors and premier auctioneers with bank-grade security protocols and multi-sig escrow.
        </p>
      </div>

      {/* 3D Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {pillars.map((item, i) => {
          const Icon = item.icon;
          return (
            <Card3DTilt key={i} maxTiltDeg={5} scale={1.02}>
              <div className="relative p-6 rounded-3xl bg-card/40 backdrop-blur-xl border border-accent/20 hover:border-accent/40 transition-all duration-300 flex flex-col justify-between h-full group">
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="p-3 rounded-2xl bg-card border border-accent/30 text-accent group-hover:scale-105 transition-all duration-300 shadow-md">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[9px] font-mono font-bold tracking-wider px-2.5 py-1 rounded-full bg-accent/10 text-accent border border-accent/20">
                      {item.badge}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-foreground mb-2 font-heading">
                    {item.title}
                  </h3>

                  <p className="text-xs text-muted-foreground leading-relaxed mb-6">
                    {item.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-border/40 flex items-center gap-2 text-[11px] font-mono font-bold text-accent">
                  <CheckCircle2 size={14} className="text-emerald-400" />
                  <span>{item.metrics}</span>
                </div>
              </div>
            </Card3DTilt>
          );
        })}
      </div>
    </section>
  );
};

export default SectionVault3D;
