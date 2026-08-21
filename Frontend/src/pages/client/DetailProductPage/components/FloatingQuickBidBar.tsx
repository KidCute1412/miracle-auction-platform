import { useState } from "react";
import { TrendingUp, Clock, Zap } from "lucide-react";
import { formatVnd, moneyBigInt } from "@/lib/money";
import { bidService, isDurabilityUnconfirmed } from "@/services/bid.service";
import { ApiClientError } from "@/services/api.client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface FloatingQuickBidBarProps {
  product_id?: number;
  current_price?: string | number;
  step_price?: string | number;
  buy_now_price?: string | number;
  timeLeft?: string;
  auctionPhase?: string;
  onBidSuccess?: (data: any) => void;
}

export default function FloatingQuickBidBar({
  product_id,
  current_price,
  step_price,
  timeLeft,
  auctionPhase = "ACTIVE",
  onBidSuccess,
}: FloatingQuickBidBarProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeStep, setActiveStep] = useState<number | null>(null);

  if (auctionPhase !== "ACTIVE" || !product_id) return null;

  const handleQuickBid = async (multiplier: number) => {
    try {
      setIsSubmitting(true);
      setActiveStep(multiplier);
      const minBid = moneyBigInt(current_price) + moneyBigInt(step_price);
      const targetBid = minBid + moneyBigInt(step_price) * BigInt(multiplier - 1);

      const res = await bidService.play({
        product_id,
        max_price: targetBid.toString(),
      });

      if (res.status === "success" && res.data) {
        toast.success(`Quick bid of ${formatVnd(targetBid)} VND placed!`);
        onBidSuccess?.(res.data);
      } else {
        toast.error("Failed to place quick bid");
      }
    } catch (e: unknown) {
      const message = e instanceof ApiClientError ? e.message : "Failed to place bid";
      if (isDurabilityUnconfirmed(e)) {
        toast.warning("Bid was accepted by the primary server but replica confirmation is still pending. Do not submit a new bid.");
      } else if (message !== "Not logged in") {
        toast.error(message);
      }
    } finally {
      setIsSubmitting(false);
      setActiveStep(null);
    }
  };

  const minNextBid = moneyBigInt(current_price) + moneyBigInt(step_price);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-4xl animate-in slide-in-from-bottom-8 fade-in duration-500">
      <div className="relative overflow-hidden rounded-2xl bg-card/85 backdrop-blur-xl border border-accent/40 shadow-[0_15px_40px_-10px_oklch(0.78_0.09_75_/_25%)] p-3 md:p-4 flex flex-wrap md:flex-nowrap items-center justify-between gap-3">
        {/* Shimmer ambient glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-2xl pointer-events-none"></div>

        {/* Current Price & Countdown */}
        <div className="flex items-center gap-4 min-w-[200px]">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-accent/15 rounded-lg border border-accent/30 text-accent">
              <TrendingUp className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Current Price</p>
              <p className="text-lg md:text-xl font-extrabold text-accent font-heading">
                {formatVnd(current_price)} <span className="text-xs font-normal">VND</span>
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 pl-4 border-l border-border/60 text-muted-foreground text-xs font-medium">
            <Clock className="w-4 h-4 text-red-500 animate-spin-slow" />
            <span className="text-foreground font-semibold">{timeLeft}</span>
          </div>
        </div>

        {/* Quick Step Buttons */}
        <div className="flex items-center gap-2 flex-1 justify-end">
          <button
            onClick={() => handleQuickBid(1)}
            disabled={isSubmitting}
            className={cn(
              "px-3 py-2 text-xs md:text-sm font-semibold rounded-xl border border-accent/30 bg-accent/10 text-foreground hover:bg-accent/20 hover:border-accent transition-all active:scale-95 flex items-center gap-1 cursor-pointer",
              activeStep === 1 && "animate-pulse ring-2 ring-accent"
            )}
          >
            <span>Min ({formatVnd(minNextBid)})</span>
          </button>

          <button
            onClick={() => handleQuickBid(2)}
            disabled={isSubmitting}
            className={cn(
              "hidden sm:flex px-3 py-2 text-xs md:text-sm font-semibold rounded-xl border border-amber-500/30 bg-amber-500/10 text-foreground hover:bg-amber-500/20 hover:border-amber-500 transition-all active:scale-95 items-center gap-1 cursor-pointer",
              activeStep === 2 && "animate-pulse ring-2 ring-amber-500"
            )}
          >
            <span>+2 Step</span>
          </button>

          <button
            onClick={() => {
              const element = document.getElementById("bidForm");
              if (element) {
                element.scrollIntoView({ behavior: "smooth", block: "center" });
                const input = document.getElementById("max_price");
                if (input) input.focus();
              }
            }}
            className="group relative overflow-hidden bg-accent cursor-pointer text-white px-4 py-2.5 rounded-xl font-bold text-xs md:text-sm shadow-md hover:shadow-[0_0_20px_oklch(0.78_0.09_75_/_40%)] hover:scale-[1.03] active:scale-95 transition-all duration-300 flex items-center gap-1.5 whitespace-nowrap"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-transparent via-white/25 to-transparent -skew-x-12 group-hover:animate-[shine_1.5s_ease-in-out_infinite] pointer-events-none"></div>
            <Zap className="w-4 h-4" />
            <span>Custom Bid</span>
          </button>
        </div>
      </div>
    </div>
  );
}
