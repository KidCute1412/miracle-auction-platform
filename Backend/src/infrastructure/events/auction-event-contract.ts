import type { AuctionStreamEvent } from "@/modules/bids/infrastructure/redis/redis-auction.types.ts";

export const canonicalAuctionEventTypes = {
  BID_ACCEPTED: "bid.accepted.v1",
  BUY_NOW_COMPLETED: "auction.buy_now_completed.v1",
  BIDDER_BANNED: "bidder.banned.v1",
  AUCTION_CLOSED: "auction.closed.v1",
  AUCTION_CANCELLED: "auction.cancelled.v1",
} as const satisfies Record<AuctionStreamEvent["type"], string>;

export type CanonicalAuctionEventType =
  (typeof canonicalAuctionEventTypes)[keyof typeof canonicalAuctionEventTypes];

const legacyAliases = new Map<string, CanonicalAuctionEventType>([
  ["bid.accepted", canonicalAuctionEventTypes.BID_ACCEPTED],
  ["buy.now.completed", canonicalAuctionEventTypes.BUY_NOW_COMPLETED],
  ["auction.buy_now_completed", canonicalAuctionEventTypes.BUY_NOW_COMPLETED],
  ["bidder.banned", canonicalAuctionEventTypes.BIDDER_BANNED],
  ["auction.closed", canonicalAuctionEventTypes.AUCTION_CLOSED],
  ["auction.cancelled", canonicalAuctionEventTypes.AUCTION_CANCELLED],
]);

export function canonicalAuctionEventType(type: AuctionStreamEvent["type"]): CanonicalAuctionEventType {
  return canonicalAuctionEventTypes[type];
}

export function normalizeAuctionEventType(value: string): CanonicalAuctionEventType | undefined {
  if (Object.values(canonicalAuctionEventTypes).includes(value as CanonicalAuctionEventType)) {
    return value as CanonicalAuctionEventType;
  }
  return legacyAliases.get(value);
}
