export interface AuctionState {
  productId: number;
  sellerId: number;
  currentPrice: number;
  startPrice: number;
  stepPrice: number;
  priceOwnerId: number | null;
  buyNowPrice: number | null;
  startTime: Date;
  endTime: Date;
  isRemoved: boolean;
}

export interface BidderEligibility {
  rating: number;
  ratingCount: number;
  banned: boolean;
}

export interface ProxyBid {
  userId: number;
  maxPrice: number;
}
