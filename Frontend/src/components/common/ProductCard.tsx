import { cn } from "@/lib/utils";
import { DateTime } from "luxon";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { slugify } from "@/utils/make_slug";
import AddToLove from "@/components/common/AddToLove";
import useIntersectionObserver from "@/hooks/useIntersectionObserver";
import { useAuth } from "@/routes/ProtectedRouter";

type Products = {
  product_id?: number;
  product_image?: string;
  product_name?: string;
  current_price?: number;
  buy_now_price?: number;
  start_time?: any;
  end_time?: any;
  price_owner_username?: string;
  price_owner_id?: number;
  bid_turns?: string;
};

function ProductCard({
  product_image,
  product_id,
  product_name,
  current_price,
  buy_now_price,
  start_time,
  end_time,
  price_owner_username,
  price_owner_id,
  bid_turns,
  ...data
}: Products & { className?: string } & { onClick?: () => void }) {
  const navigate = useNavigate();
  const [formattedStartTime, setFormatStartTime] = useState("");
  const [timeLeft, setTimeLeft] = useState("");
  const [isUrgent, setIsUrgent] = useState(false);
  const { auth } = useAuth();

  const startDate = DateTime.fromISO(start_time, { zone: "Asia/Ho_Chi_Minh" });
  const endDate = DateTime.fromISO(end_time, { zone: "Asia/Ho_Chi_Minh" });

  const handleClickProduct = (productId?: number, productName?: string) => {
    const slug = slugify(productName ?? "");
    navigate(`/product/${slug}-${productId}`);
  };

  const formatStartTime = () => {
    if (start_time) {
      setFormatStartTime(startDate.toFormat("dd-MM-yyyy HH:mm"));
    }
  };

  const formatEndTime = () => {
    if (!end_time) return;

    const present_time = DateTime.now().setZone("Asia/Ho_Chi_Minh");
    const endDateValid = DateTime.isDateTime(endDate)
      ? endDate
      : DateTime.fromISO(end_time, { zone: "Asia/Ho_Chi_Minh" });

    if (!endDateValid.isValid) {
      setTimeLeft("");
      return;
    }

    const diff = endDateValid.diff(present_time, ["days", "hours", "minutes", "seconds"]).toObject();
    const diffSeconds = endDateValid.diff(present_time, "seconds").seconds;

    const days = diff.days ?? 0;
    const hours = diff.hours ?? 0;
    const minutes = diff.minutes ?? 0;
    const seconds = diff.seconds ?? 0;

    setIsUrgent(diffSeconds > 0 && diffSeconds < 300);

    if (diffSeconds <= 0) {
      setTimeLeft("Ended");
    } else if (days >= 1) {
      setTimeLeft(`${Math.floor(days)}d ${Math.floor(hours)}h left`);
    } else if (hours >= 1) {
      setTimeLeft(`${Math.floor(hours)}h ${Math.floor(minutes)}m left`);
    } else {
      setTimeLeft(`${Math.floor(minutes)}m ${Math.floor(seconds)}s left`);
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      formatEndTime();
    }, 1000);
    formatStartTime();
    formatEndTime();
    return () => clearInterval(timer);
  });

  const maskName = (name: string) => {
    const len = name.length;
    if (len >= 20) {
      return name.substring(0, 10) + "*****";
    }
    const thirdLen = Math.floor(len / 2);
    return name.substring(0, len - thirdLen) + "*****";
  };

  const { ref, hasIntersected } = useIntersectionObserver();

  return (
    <div
      ref={ref}
      className={cn(
        "group relative w-80 h-112 cursor-pointer overflow-hidden rounded-2xl flex flex-col items-center shrink-0 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
        "bg-card/40 backdrop-blur-xl border border-border",
        "hover:scale-[1.015] hover:shadow-gold-glow hover:border-accent/30",
        hasIntersected ? "animate__animated animate__fadeInUp" : "opacity-0",
        data.className
      )}
      onClick={
        data.onClick ??
        (() => {
          handleClickProduct(product_id ?? 0, product_name ?? "");
        })
      }
    >
      {/* Background radial highlight */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-accent/20 to-transparent rounded-full blur-xl"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-primary/20 to-transparent rounded-full blur-xl"></div>
      </div>

      {/* Product Image Cover */}
      <div className="relative w-full h-[48%] shrink-0 overflow-hidden rounded-t-2xl border-b border-border">
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute top-0 right-0 z-20"
        >
          <AddToLove product_id={product_id ?? 1} className="min-w-[70px]" />
        </div>

        <img
          src={product_image}
          loading="lazy"
          alt={product_name}
          className="w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-105 group-hover:brightness-110"
        />

        <div className="absolute inset-0 bg-background/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
            <div className="w-10 h-10 rounded-full bg-background/50 backdrop-blur-md border border-accent/35 flex items-center justify-center">
              <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Product Title Section */}
      <div className="relative text-lg font-heading font-bold mx-4 mt-3 flex h-[12%] leading-snug grow-0 self-start limit-to-2-lines text-foreground group-hover:text-accent transition-colors duration-300">
        {product_name ?? "Product Name"}
      </div>

      {/* Accent Separator */}
      <div className="relative w-[90%] h-px bg-gradient-to-r from-transparent via-border to-transparent group-hover:via-accent/40 transition-colors duration-300 my-2"></div>

      {/* Detail Attributes */}
      <div className="relative flex-1 mx-4 w-[calc(100%-2rem)] pb-4 grid grid-cols-2 gap-2 text-xs">
        <div>
          <div className="font-semibold text-muted-foreground">Current Bid:</div>
          <span className="text-foreground font-medium">{current_price?.toLocaleString() ?? "0"} VND</span>
        </div>
        <div>
          <div className="font-semibold text-muted-foreground">Buy Now:</div>
          <span className="text-foreground font-medium">{buy_now_price?.toLocaleString() ?? "0"} VND</span>
        </div>
        <div>
          <div className="font-semibold text-muted-foreground">Posted:</div>
          <span className="text-foreground/85">{formattedStartTime}</span>
        </div>
        <div>
          <div className="font-semibold text-muted-foreground">Ends In:</div>
          <span
            className={cn(
              "font-medium transition-colors inline-block",
              isUrgent ? "text-red-500 animate-heartbeat font-bold" : "text-chart-2"
            )}
          >
            {timeLeft}
          </span>
        </div>
        <div>
          <div className="font-semibold text-muted-foreground">Top Bidder:</div>
          <span className="text-foreground font-medium">
            {price_owner_username ? (
              price_owner_id === auth?.user_id ? (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-accent/15 text-accent font-semibold border border-accent/30">
                  You
                </span>
              ) : (
                maskName(price_owner_username)
              )
            ) : (
              "-"
            )}
          </span>
        </div>
        <div>
          <div className="font-semibold text-muted-foreground">Bids:</div>
          <span className="text-foreground/85 font-medium">{bid_turns}</span>
        </div>
      </div>

      {/* Shine Hover Effect */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none overflow-hidden">
        <div className="absolute -inset-1 bg-gradient-to-r from-transparent via-accent/10 to-transparent -skew-x-12 group-hover:animate-[shine_1.2s_ease-in-out_infinite]"></div>
      </div>
    </div>
  );
}

export default ProductCard;
