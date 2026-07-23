import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { NumericFormat } from "react-number-format";
import { TrendingUp, AlertCircle, Zap, ChevronDown, X, AlertTriangle, CheckCircle } from "lucide-react";
import JustValidate from "just-validate";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { bidService } from "@/services/bid.service";
import { ApiClientError } from "@/services/api.client";
import type { BidRequest } from "api-contracts";
import { formatVnd, moneyBigInt } from "@/lib/money.ts";

export default function PlayBidSection({ product_id, current_price, step_price, buy_now_price }: {
  product_id?: number;
  current_price?: string | number;
  step_price?: string | number;
  buy_now_price?: string | number;
}) {
  const [isSubmit, setIsSubmit] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [bidValue, setBidValue] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
  const [successBidAmount, setSuccessBidAmount] = useState("0");
  const [pendingBidData, setPendingBidData] = useState<BidRequest | null>(null);
  const [isFlashing, setIsFlashing] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    if (showSuggestions) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showSuggestions]);
  
  useEffect(() => {
    if (!product_id || !formRef.current) return;
    const validate = new JustValidate(formRef.current);
    validate.addField(
      "#max_price", [
        { rule: "required", errorMessage: "Please enter your bid price!" },
        {
          validator: (value: string) => {
            const numericValue = value.replace(/,/g, "");
            try {
              return BigInt(numericValue) >= moneyBigInt(current_price) + moneyBigInt(step_price);
            } catch {
              return false;
            }
          },
          errorMessage: `Bid price must be at least ${formatVnd(moneyBigInt(current_price) + moneyBigInt(step_price))} VND!`
        },
        {
          validator: (value: string) => {
            const numericValue = value.replace(/,/g, "");
            if (!step_price) return true;
            try {
              return (BigInt(numericValue) - moneyBigInt(current_price)) % moneyBigInt(step_price) === 0n;
            } catch {
              return false;
            }
          },
          errorMessage: `Bid price must be a multiple of the step price (${formatVnd(step_price)} VND)!`
        },
      ]  
    )
    .onSuccess((event: any) => {
      event.preventDefault();
      const form = event.target;
      const maxPriceSubmit = form.max_price.value.replace(/,/g, "");
      
      setPendingBidData({
        product_id: product_id,
        max_price: maxPriceSubmit,
      });
      setShowConfirmModal(true);
    });

    return () => {
      validate.destroy();
    };
  }, [product_id, current_price, step_price]);

  const handleConfirmBid = async () => {
    if (!pendingBidData) return;
    
    setShowConfirmModal(false);
    setIsSubmit(true);
    
    try {
      const data = await bidService.play(pendingBidData);

      if (data.status === "success") {
        setSuccessBidAmount(pendingBidData.max_price);
        setShowSuccessOverlay(true);
        setBidValue("");
      } else {
        toast.error(`Failed to place bid`);
      }
    } catch (e: unknown) {
      console.log(e);
      const message = e instanceof ApiClientError ? e.message : "Error connecting to server to place bid!";
      if (message !== "Not logged in") {
        toast.error(message);
      }
    } finally {
      setIsSubmit(false);
      setPendingBidData(null);
    }
  };

  const getSuggestedPrices = () => {
    const minBid = moneyBigInt(current_price);
    const step = moneyBigInt(step_price);
    const multipliers = [1, 2, 3, 4, 5, 10, 12, 15, 17, 20, 25, 30, 35, 38, 40];
    return multipliers.map(mult => ({
      price: minBid + step * BigInt(mult),
      multiplier: mult
    }));
  };

  const handleSuggestionClick = (price: bigint) => {
    setBidValue(formatVnd(price));
    setShowSuggestions(false);
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 800);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-accent/10 rounded-lg">
          <TrendingUp className="w-5 h-5 text-accent" />
        </div>
        <div>
          <h4 className="text-lg font-bold text-foreground">
            Place a Bid
          </h4>
          <p className="text-sm text-muted-foreground">Participate in the product auction</p>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-6">
        {/* Min Bid Info */}
        <div className="bg-yellow-500/10 p-5 rounded-lg border border-yellow-500/20 h-fit">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-5 h-5 text-yellow-500" />
            <span className="text-sm font-semibold text-yellow-500">Minimum Bid</span>
          </div>
          <p className="text-2xl font-bold text-yellow-500 mb-2">
            {formatVnd(moneyBigInt(current_price) + moneyBigInt(step_price))} VND
          </p>
          <div className="space-y-1 text-xs text-muted-foreground">
            <p>• Current price: {formatVnd(current_price)} VND</p>
            <p>• Step price: {formatVnd(step_price)} VND</p>
          </div>
        </div>

        {/* Bid Form */}
        <form ref={formRef} className="space-y-4" id="bidForm">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Enter your bid amount
            </label>
            <div className="flex gap-3">
              <div className="relative flex-1" ref={dropdownRef}>
                <NumericFormat
                  name="max_price"
                  id="max_price"
                  value={bidValue}
                  onValueChange={(values) => setBidValue(values.formattedValue)}
                  thousandSeparator=","
                  decimalSeparator="."
                  placeholder="e.g. 1,500,000"
                  onFocus={() => setShowSuggestions(true)}
                  autoComplete="off"
                  className={cn(
                    "w-full px-4 py-3 bg-card border border-border rounded-lg focus:ring-2 focus:ring-accent focus:border-accent transition-all duration-300 text-lg pr-24 text-foreground",
                    isFlashing && "ring-2 ring-accent border-accent shadow-[0_0_15px_oklch(0.78_0.09_75_/_25%)]"
                  )}
                />
                <div className="absolute right-12 top-0 bottom-0 flex items-center text-muted-foreground font-medium pointer-events-none">
                  VND
                </div>
                <button
                  type="button"
                  onClick={() => setShowSuggestions(!showSuggestions)}
                  className="absolute right-3 top-0 bottom-0 flex items-center text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${showSuggestions ? "rotate-180" : ""}`} />
                </button>
                
                {/* Suggestions Dropdown */}
                {showSuggestions && (
                  <div className="absolute z-10 w-full mt-2 bg-card border border-border rounded-lg shadow-lg max-h-80 overflow-y-auto scrollbar-hide animate-in fade-in slide-in-from-top-2 duration-250 ease-out">
                    <div className="p-2">
                      <div className="text-xs font-semibold text-muted-foreground px-3 py-2">
                        Suggested Bid Prices
                      </div>
                      {getSuggestedPrices().map((item, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleSuggestionClick(item.price)}
                          className="w-full text-left px-3 py-2.5 hover:bg-muted/50 rounded-md transition-colors flex items-center justify-between group"
                        >
                          <span className="font-semibold text-foreground group-hover:text-accent">
                            {formatVnd(item.price)} VND
                          </span>
                          <div className="flex items-center gap-2">
                            {item.multiplier === 1 && (
                              <span className="text-xs bg-yellow-500/20 text-yellow-500 px-2 py-1 rounded-full font-medium">
                                Minimum
                              </span>
                            )}
                            <span className="text-xs text-muted-foreground font-medium">
                              x{item.multiplier} step price
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <button
                type="submit"
                className={cn(
                  "group relative overflow-hidden bg-accent cursor-pointer text-white py-3 px-8 rounded-lg font-semibold shadow-md",
                  "hover:bg-accent/90 hover:shadow-[0_0_20px_oklch(0.78_0.09_75_/_40%)] hover:scale-[1.02]",
                  "active:scale-95 active:shadow-sm transition-all duration-300 flex items-center justify-center gap-2 whitespace-nowrap",
                  isSubmit && "opacity-50 cursor-not-allowed pointer-events-none"
                )}
              >
                {/* Metallic shine reflection sweep */}
                <div className="absolute -inset-1 bg-gradient-to-r from-transparent via-white/25 to-transparent -skew-x-12 group-hover:animate-[shine_1.5s_ease-in-out_infinite] pointer-events-none"></div>
                <Zap className="w-5 h-5 relative z-10" />
                <span className="relative z-10">Place Bid Now</span>
              </button>
            </div>
          </div>

          {/* Helper Text */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3 bg-muted/50 rounded-lg border border-border">
              <p className="text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">Note:</span> The bid price must be greater than or equal to the minimum bid
              </p>
            </div>
            <div className="p-3 bg-red-500/10 rounded-lg border border-red-500/20">
              <p className="text-xs text-red-500">
                <span className="font-semibold">Attention:</span> The bid price must be a multiple of the step price
              </p>
            </div>
          </div>
        </form>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && pendingBidData && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-300 ease-out relative overflow-hidden">
            {/* Ambient luxury light background */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-2xl pointer-events-none"></div>

            {/* Modal Header */}
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-500/10 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-yellow-500 animate-bounce" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Confirm Bid</h3>
              </div>
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setPendingBidData(null);
                }}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="space-y-4 mb-6 relative z-10">
              <p className="text-muted-foreground text-sm">
                Are you sure you want to place a bid on this product?
              </p>
              <div className="bg-muted/50 border border-border rounded-lg p-4 relative overflow-hidden group">
                {/* Micro shine sweep */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-accent/5 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-out"></div>
                <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-semibold">Your Bid Amount</p>
                <p className="text-3xl font-extrabold text-accent font-heading">
                  {formatVnd(pendingBidData.max_price)} VND
                </p>
              </div>              
              {/* Warning if bid exceeds buy_now_price */}
              {buy_now_price && moneyBigInt(pendingBidData.max_price) > moneyBigInt(buy_now_price) && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-red-500 mb-2">
                        Bid amount exceeds buy now price!
                      </p>
                      <p className="text-xs text-muted-foreground mb-2">
                        Your bid amount (<strong>{formatVnd(pendingBidData.max_price)} VND</strong>) is higher than the buy now price (<strong>{formatVnd(buy_now_price)} VND</strong>).
                      </p>
                      <p className="text-xs text-muted-foreground">
                        You will win this auction and purchase the product at the buy now price.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                <p className="text-xs text-yellow-600">
                  <span className="font-semibold">Note:</span> After placing your bid, you will be committed to participating in this auction.
                </p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex gap-3 relative z-10">
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setPendingBidData(null);
                }}
                className="flex-1 px-4 py-3 border border-border text-muted-foreground rounded-lg hover:bg-muted/50 hover:text-foreground transition-all font-semibold cursor-pointer active:scale-95 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmBid}
                disabled={isSubmit}
                className={cn(
                  "flex-1 px-4 py-3 cursor-pointer bg-accent hover:bg-accent/90 text-white rounded-lg transition-all font-semibold shadow-md hover:shadow-lg active:scale-95 active:shadow-sm flex items-center justify-center gap-2 text-sm",
                  isSubmit && "opacity-50 cursor-not-allowed pointer-events-none"
                )}
              >
                {isSubmit ? "Processing..." : "Confirm Bid"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Luxury Success Overlay */}
      {showSuccessOverlay && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-2xl flex flex-col items-center justify-center z-[999] p-6 animate-in fade-in duration-500">
          {/* Animated background elements */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse pointer-events-none"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse pointer-events-none [animation-delay:1.5s]"></div>

          <div className="max-w-md w-full bg-card/60 border border-accent/40 rounded-3xl p-8 shadow-[0_30px_60px_-15px_oklch(0.78_0.09_75_/_20%)] text-center relative overflow-hidden animate-in zoom-in-95 duration-500 ease-out">
            {/* Spinning decorative frame */}
            <div className="absolute inset-0 border border-dashed border-accent/20 rounded-3xl animate-[spin_60s_linear_infinite] pointer-events-none"></div>

            {/* Success icon medallion */}
            <div className="relative w-20 h-20 mx-auto mb-6 flex items-center justify-center rounded-full bg-accent/15 border border-accent/50 animate-bounce">
              <CheckCircle className="w-10 h-10 text-accent" />
              <div className="absolute inset-[-6px] rounded-full border border-dashed border-accent/45 animate-[spin_12s_linear_infinite]"></div>
            </div>

            {/* Content heading with gold shimmer */}
            <h3 className="font-heading text-2xl font-extrabold text-foreground mb-3 tracking-wide animate-text-shimmer">
              VALUED BID RECORDED
            </h3>

            <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
              Your maximum bid of <strong className="text-foreground">{formatVnd(successBidAmount)} VND</strong> has been registered successfully on our platform.
            </p>

            {/* Inner certificate-like box */}
            <div className="bg-background/40 border border-border rounded-xl p-4 mb-6">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">Product Identification</span>
                <span className="text-foreground font-semibold">#{product_id}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Bid Status</span>
                <span className="text-emerald-500 font-bold uppercase tracking-wider">Active</span>
              </div>
            </div>

            <button
              onClick={() => setShowSuccessOverlay(false)}
              className="group relative w-full overflow-hidden bg-accent cursor-pointer text-white py-3 px-6 rounded-xl font-bold shadow-md hover:shadow-[0_0_20px_oklch(0.78_0.09_75_/_40%)] hover:scale-[1.02] active:scale-95 transition-all duration-300"
            >
              {/* Inner metallic reflection */}
              <div className="absolute -inset-1 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 group-hover:animate-[shine_1.5s_ease-in-out_infinite] pointer-events-none"></div>
              <span className="relative z-10">CONTINUE EXPERIENCE</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
