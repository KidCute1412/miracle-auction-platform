import { useState } from "react";
import { X, AlertTriangle, Ban, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { bidService } from "@/services/bid.service.ts";

interface BanBidderModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: number;
  username: string;
  productId: number;
}

export default function BanBidderModal({
  isOpen,
  onClose,
  userId,
  username,
  productId,
}: BanBidderModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reason, setReason] = useState("");

  if (!isOpen) return null;

  const handleBanBidder = async () => {
    if (!reason.trim()) {
      toast.error("Please enter the reason for banning the user");
      return;
    }

    setIsSubmitting(true);
    try {
      await bidService.banBidder({
        product_id: productId,
        banned_user_id: userId,
        reason: reason,
      });

      toast.success(`Successfully banned user ${username}`);
      onClose();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "An error occurred while banning the user");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleOverlayClick}
    >
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-rose-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white">Ban Bidder</h2>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="text-white hover:bg-white/20 rounded-lg p-1 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Warning Message */}
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
            <div className="flex gap-3">
              <Ban className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-500 mb-1">
                  Banning Bidder Action
                </p>
                <p className="text-sm text-muted-foreground">
                  User <span className="font-semibold text-foreground">{username}</span>{" "}
                  will no longer be able to place bids on this product.
                </p>
              </div>
            </div>
          </div>

          {/* Reason Input */}
          <div className="space-y-2">
            <label
              htmlFor="ban-reason"
              className="block text-sm font-medium text-muted-foreground"
            >
              Ban Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              id="ban-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={isSubmitting}
              placeholder="Enter the reason for banning this user..."
              rows={4}
              className="w-full px-4 py-3 bg-card border border-border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all resize-none text-foreground text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <p className="text-xs text-muted-foreground">
              This reason will be recorded and can be viewed later.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-muted/30 px-6 py-4 flex items-center justify-end gap-3 border-t border-border">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm cursor-pointer font-medium text-muted-foreground bg-card border border-border rounded-lg hover:bg-muted/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleBanBidder}
            disabled={isSubmitting || !reason.trim()}
            className="px-4 py-2 text-sm font-medium cursor-pointer text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:bg-red-400 disabled:cursor-not-allowed inline-flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Ban className="w-4 h-4" />
                Confirm Ban
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
