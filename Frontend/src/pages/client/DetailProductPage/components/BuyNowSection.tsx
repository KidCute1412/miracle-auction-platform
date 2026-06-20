import { useState } from "react";
import { ShoppingCart, Zap, X, AlertTriangle, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/routes/ProtectedRouter";
import { cn } from "@/lib/utils";
import { bidService } from "@/services/bid.service.ts";

interface BuyNowSectionProps {
  product_id?: number;
  buy_now_price?: number;
  product_name?: string;
  setProduct?: Function;
}

export default function BuyNowSection({ product_id, buy_now_price, product_name }: BuyNowSectionProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
  const navigate = useNavigate();
  const { auth } = useAuth();

  const handleBuyNowClick = () => {
    setShowConfirmModal(true);
  };

  const handleConfirmBuyNow = async () => {
    if (!buy_now_price || !product_id) {
      toast.error("Invalid product information!");
      return;
    }

    setShowConfirmModal(false);
    setIsSubmitting(true);

    try {
      const data = await bidService.buyNow({
        product_id: product_id,
        buy_price: buy_now_price,
      });

      if (data.status === "success") {
        setShowSuccessOverlay(true);
      } else {
        toast.error(data.message || "Purchase failed!");
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Error connecting to server!");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!buy_now_price) {
    return null;
  }

  return (
    <div className="p-6 border-t border-border">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2.5 bg-gradient-to-tr from-rose-500 to-pink-500 rounded-lg shadow-[0_4px_12px_rgba(244,63,94,0.2)]">
          <ShoppingCart className="w-4 h-4 text-white" />
        </div>
        <div>
          <h4 className="text-base font-bold text-foreground">Buy Now</h4>
          <p className="text-xs text-muted-foreground">
            Own the product immediately at a fixed price
          </p>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-4">
        {/* Price Info */}
        <div className="bg-rose-500/10 p-4 rounded-lg border border-rose-500/20 h-fit transition-all duration-300 hover:bg-rose-500/[0.14] hover:shadow-[0_4px_20px_rgba(244,63,94,0.08)]">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-rose-500" />
            <span className="text-xs font-semibold text-rose-500">Buy Now Price</span>
          </div>
          <p className="text-xl font-bold text-rose-500 mb-2 font-heading">
            {buy_now_price.toLocaleString()} VND
          </p>
          <div className="space-y-0.5 text-xs text-muted-foreground">
            <p>• No bidding required</p>
            <p>• Instant ownership</p>
            <p>• Ends auction immediately</p>
          </div>
        </div>

        {/* Buy Now Form */}
        <div className="flex flex-col justify-center gap-3">
          <button
            onClick={handleBuyNowClick}
            disabled={isSubmitting}
            className={cn(
              "group relative overflow-hidden bg-rose-600 hover:bg-rose-700 text-white py-2.5 px-6 rounded-lg font-semibold shadow-md",
              "hover:shadow-[0_0_20px_rgba(225,29,72,0.4)] hover:scale-[1.02]",
              "active:scale-95 active:shadow-sm transition-all duration-300 flex items-center justify-center gap-2 whitespace-nowrap",
              isSubmitting && "opacity-50 cursor-not-allowed pointer-events-none"
            )}
          >
            {/* Metallic shine reflection sweep */}
            <div className="absolute -inset-1 bg-gradient-to-r from-transparent via-white/25 to-transparent -skew-x-12 group-hover:animate-[shine_1.5s_ease-in-out_infinite] pointer-events-none"></div>
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white relative z-10"></div>
                <span className="relative z-10">Processing...</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4 relative z-10" />
                <span className="relative z-10">Buy Now</span>
              </>
            )}
          </button>

          {/* Helper Text */}
          <div className="p-2 bg-rose-500/10 rounded-lg border border-rose-500/20">
            <p className="text-xs text-rose-500 leading-tight">
              <span className="font-semibold">Note:</span> The auction will end immediately
            </p>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-300 ease-out relative overflow-hidden">
            {/* Ambient luxury light background */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-2xl pointer-events-none"></div>

            {/* Modal Header */}
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-rose-500/10 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-rose-500 animate-bounce" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Confirm Buy Now</h3>
              </div>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="space-y-4 mb-6 relative z-10">
              <p className="text-muted-foreground text-sm">
                Are you sure you want to purchase this product for:
              </p>
              <div className="bg-rose-500/10 border border-rose-500/20 rounded-lg p-4 relative overflow-hidden group">
                {/* Micro shine sweep */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-rose-500/5 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-out"></div>
                <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-semibold">Buy Now Price</p>
                <p className="text-3xl font-extrabold text-rose-500 font-heading">
                  {buy_now_price?.toLocaleString()} VND
                </p>
              </div>
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                <p className="text-xs text-yellow-600">
                  <span className="font-semibold">Note:</span> The auction session will end immediately and you will own this product.
                </p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex gap-3 relative z-10">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 px-4 py-3 border border-border text-muted-foreground rounded-lg hover:bg-muted/50 hover:text-foreground transition-all font-semibold cursor-pointer active:scale-95 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmBuyNow}
                className="flex-1 px-4 py-3 cursor-pointer bg-rose-600 hover:bg-rose-750 text-white rounded-lg transition-all font-semibold shadow-md hover:shadow-lg active:scale-95 active:shadow-sm"
              >
                Confirm Buy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Full-Screen Success Overlay */}
      {showSuccessOverlay && (
        <div className="fixed inset-0 bg-background/85 backdrop-blur-2xl flex flex-col items-center justify-center z-[999] p-6 animate-in fade-in duration-550">
          {/* Animated decorative glow rings */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl animate-pulse pointer-events-none"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse pointer-events-none [animation-delay:1.5s]"></div>

          <div className="max-w-md w-full bg-card/60 border border-rose-500/30 rounded-3xl p-8 shadow-[0_30px_60px_-15px_rgba(244,63,94,0.18)] text-center relative overflow-hidden animate-in zoom-in-95 duration-500 ease-out">
            {/* Rotating dashed border pattern */}
            <div className="absolute inset-0 border border-dashed border-rose-500/15 rounded-3xl animate-[spin_60s_linear_infinite] pointer-events-none"></div>

            {/* Crown/Success Medallion */}
            <div className="relative w-20 h-20 mx-auto mb-6 flex items-center justify-center rounded-full bg-rose-500/15 border border-rose-500/40 animate-bounce">
              <CheckCircle className="w-10 h-10 text-rose-500" />
              <div className="absolute inset-[-6px] rounded-full border border-dashed border-rose-500/35 animate-[spin_12s_linear_infinite]"></div>
            </div>

            <h3 className="font-heading text-2xl font-extrabold text-foreground mb-3 tracking-wide bg-gradient-to-r from-rose-500 via-pink-500 to-rose-500 bg-clip-text text-transparent">
              OWNERSHIP ACQUIRED
            </h3>

            <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
              Congratulations! You have successfully purchased <strong className="text-foreground">{product_name}</strong> for <strong className="text-rose-500 font-heading">{buy_now_price.toLocaleString()} VND</strong>.
            </p>

            {/* Asset Details */}
            <div className="bg-background/40 border border-border rounded-xl p-4 mb-6 text-left space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Asset Code</span>
                <span className="text-foreground font-semibold">#{product_id}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Acquisition Type</span>
                <span className="text-foreground font-semibold">Buy Now</span>
              </div>
              <div className="flex justify-between text-xs border-t border-border/60 pt-1.5 mt-1.5">
                <span className="text-muted-foreground">Session Status</span>
                <span className="text-rose-500 font-bold uppercase tracking-wider">Closed</span>
              </div>
            </div>

            <button
              onClick={() => {
                setShowSuccessOverlay(false);
              }}
              className="group relative w-full overflow-hidden bg-rose-600 hover:bg-rose-700 cursor-pointer text-white py-3 px-6 rounded-xl font-bold shadow-md hover:shadow-[0_0_20px_rgba(244,63,94,0.4)] hover:scale-[1.02] active:scale-95 transition-all duration-300"
            >
              {/* Inner light reflection */}
              <div className="absolute -inset-1 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 group-hover:animate-[shine_1.5s_ease-in-out_infinite] pointer-events-none"></div>
              <span className="relative z-10">SUCCESSFULLY PURCHASED!</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
