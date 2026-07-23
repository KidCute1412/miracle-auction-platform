import type { MoneyVnd } from "./money.ts";

export type AuctionStatus = "PENDING" | "ACTIVE" | "SOLD" | "ENDED" | "CANCELLED";

export interface AuctionState {
  productId: number;
  sellerId: number;
  currentPrice: MoneyVnd;
  startPrice: MoneyVnd;
  stepPrice: MoneyVnd;
  priceOwnerId: number | null;
  buyNowPrice: MoneyVnd | null;
  startTime: Date;
  endTime: Date;
  isRemoved: boolean;
  status: AuctionStatus;
  version: bigint;
  sequence: bigint;
}

export interface BidderEligibility {
  rating: number;
  ratingCount: number;
  banned: boolean;
}

export interface ProxyBid {
  userId: number;
  maxPrice: MoneyVnd;
}
