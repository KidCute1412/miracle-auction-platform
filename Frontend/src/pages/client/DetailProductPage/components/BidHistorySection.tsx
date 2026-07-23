import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { Ban } from "lucide-react";
import { useAuth } from "@/routes/ProtectedRouter";
import Loading from "@/components/common/Loading";
import BanBidderModal from "./BanBidderModal";
import { bidService } from "@/services/bid.service.ts";
import { formatVnd } from "@/lib/money.ts";

type ProductType = {
  product_id: number;
  seller_id?: number;
};

export default function BidHistorySection({ product, isSeller, isExpired }: { product?: ProductType | null; isSeller?: boolean; isExpired?: boolean }) {
  const [bidHistory, setBidHistory] = useState<{
    bidding_id: number;
    user_id: number;
    username: string;
    max_price: string;
    product_price: string;
    created_at: string;
    price_owner_id: number;
    price_owner_username: string;
    status?: string;
  }[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [banModalOpen, setBanModalOpen] = useState(false);
  const [selectedBidder, setSelectedBidder] = useState<{
    userId: number;
    username: string;
  } | null>(null);
  
  const { auth } = useAuth();
  useEffect(() => {
    setLoading(true);
    async function fetchBidHistory() {
      if (!product?.product_id) return;
      try {
        const data = await bidService.getHistory({ product_id: product.product_id });
        setBidHistory(data.data);
      } catch (e) {
        console.log(e);
      }
    }
    fetchBidHistory();
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [product]);

  const maskName = (name: string) => {
    const len = name.length;
    const thirdLen = Math.floor(len / 2);
    return name.substring(0, len - thirdLen) + "*****";
  };

  const handleOpenBanModal = (userId: number, username: string) => {
    setSelectedBidder({ userId, username });
    setBanModalOpen(true);
  };

  const handleCloseBanModal = () => {
    setBanModalOpen(false);
    setSelectedBidder(null);
  };

  if (loading) {
    return <Loading className="static w-full h-full bg-transparent" />;
  }

  return (
    <div className="bg-card rounded-lg p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-accent/10 rounded-lg">
          <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            Bid History
          </h3>
          <p className="text-sm text-muted-foreground">Track bidding activity for this product</p>
        </div>
      </div>

      {bidHistory.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">No.</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Bidder</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Max Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Current Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Current Winner</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Time</th>
                {isSeller && <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Action</th>}
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {bidHistory.map((bid, index) => {
                const isBanned = bid.status === "BANNED";
                const isSellerBid = product?.seller_id && bid.user_id === product.seller_id;
                const isCurrentUserBid = auth?.user_id === bid.user_id;
                const isCurrentUserPriceOwner = auth?.user_id === bid.price_owner_id;

                const displayBidderName = () => {
                  if (isSeller || isCurrentUserBid) {
                    return bid.username;
                  } else {
                    return maskName(bid.username);
                  }
                };

                const shouldShowMaxPrice = isCurrentUserBid;
                const shouldShowCurrentPrice = true;

                const displayPriceOwnerName = () => {
                  if (isSeller) {
                    return bid.price_owner_username || "None";
                  } else if (isCurrentUserPriceOwner) {
                    return bid.price_owner_username || "None";
                  } else {
                    return bid.price_owner_username ? maskName(bid.price_owner_username) : "None";
                  }
                };

                const shouldShowTime = true;
                const shouldShowBanButton = isSeller && bid.user_id !== product?.seller_id && !isExpired && bid.status !== "BANNED";

                return (
                  <tr key={index} className={`hover:bg-muted/30 transition-colors duration-150 ${
                    isBanned ? "bg-red-500/10" : ""
                  }`}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                      {index + 1}
                    </td>

                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                      isBanned 
                        ? "text-red-500 line-through opacity-70" 
                        : isSellerBid
                        ? "text-yellow-600 font-bold"
                        : "text-foreground"
                    }`}>
                      {isBanned && (
                        <span className="inline-flex items-center gap-1.5 bg-red-500/15 px-2 py-1 rounded">
                          <Ban className="w-3.5 h-3.5 text-red-500" />
                          {isSeller ? (
                            <Link to={`/profile/${bid.username}_${bid.user_id}`} className="text-red-500 hover:underline">
                              {bid.username}
                            </Link>
                          ) : (
                            maskName(bid.username)
                          )}
                        </span>
                      )}
                      {!isBanned && (
                        <>
                          {isSellerBid && (
                            <span className="text-xs bg-yellow-500/15 text-yellow-600 px-2 py-0.5 rounded mr-2">
                              Seller
                            </span>
                          )}
                          {isSeller || isCurrentUserBid ? (
                            <Link to={`/profile/${bid.username}_${bid.user_id}`} className="text-primary hover:underline">
                              {displayBidderName()}
                            </Link>
                          ) : (
                            displayBidderName()
                          )}
                        </>
                      )}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {shouldShowMaxPrice ? (
                        <span className="text-purple-500 font-semibold">
                          {formatVnd(bid.max_price)} VND
                        </span>
                      ) : (
                        <span className="text-muted-foreground italic text-xs">
                          Hidden
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-emerald-500">
                      {shouldShowCurrentPrice && `${formatVnd(bid.product_price)} VND`}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                      {isSeller && bid.price_owner_username ? (
                        <Link to={`/profile/${bid.price_owner_username}_${bid.price_owner_id}`} className="text-primary hover:underline">
                          {displayPriceOwnerName()}
                        </Link>
                      ) : (
                        displayPriceOwnerName()
                      )}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {shouldShowTime && (
                        <div className="flex flex-col">
                          <span>{new Date(bid.created_at).toLocaleDateString("en-US")}</span>
                          <span className="text-xs">{new Date(bid.created_at).toLocaleTimeString("en-US")}</span>
                        </div>
                      )}
                    </td>

                    {shouldShowBanButton && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleOpenBanModal(bid.user_id, bid.username)}
                          className="inline-flex cursor-pointer items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
                        >
                          <Ban className="w-3.5 h-3.5" />
                          Ban
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-muted-foreground/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-foreground">No bids yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">Be the first to bid on this product.</p>
        </div>
      )}

      {selectedBidder && (
        <BanBidderModal
          isOpen={banModalOpen}
          onClose={handleCloseBanModal}
          userId={selectedBidder.userId}
          username={selectedBidder.username}
          productId={product?.product_id || 0}
        />
      )}
    </div>
  );
}
