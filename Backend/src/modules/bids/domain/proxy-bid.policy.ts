import type { AuctionState, ProxyBid } from "./bid.types.ts";

export interface ProxyBidResult {
  currentPrice: bigint;
  priceOwnerId: number;
  turns: number;
}

const minMoney = (left: bigint, right: bigint): bigint => left < right ? left : right;

export function calculateProxyBid(auction: AuctionState, incoming: ProxyBid, leader?: ProxyBid): ProxyBidResult {
  if (!leader) return { currentPrice: auction.currentPrice, priceOwnerId: incoming.userId, turns: 1 };
  if (leader.userId === incoming.userId)
    return { currentPrice: auction.currentPrice, priceOwnerId: incoming.userId, turns: 0 };
  if (incoming.maxPrice <= leader.maxPrice) {
    return {
      currentPrice: minMoney(incoming.maxPrice + auction.stepPrice, leader.maxPrice),
      priceOwnerId: leader.userId,
      turns: 2,
    };
  }
  return {
    currentPrice: minMoney(leader.maxPrice + auction.stepPrice, incoming.maxPrice),
    priceOwnerId: incoming.userId,
    turns: 1,
  };
}
