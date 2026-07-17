import { BidDomainError } from "./bid.errors.ts";
import type { AuctionState, BidderEligibility } from "./bid.types.ts";

export function assertAuctionAvailable(auction: AuctionState, now = new Date()): void {
  if (auction.isRemoved || auction.startTime > now || auction.endTime <= now) {
    throw new BidDomainError("Product is not in bidding period");
  }
}

export function assertBidderCanParticipate(
  auction: AuctionState,
  userId: number,
  eligibility: BidderEligibility,
): void {
  if (auction.sellerId === userId) throw new BidDomainError("Seller cannot bid on their own product");
  if (eligibility.banned) throw new BidDomainError("You have been banned from bidding on this product", 403);
  if (eligibility.ratingCount !== 0 && eligibility.rating < 4) throw new BidDomainError("User ratings too low to bid");
}

export function assertBidAmount(auction: AuctionState, maximum: number): void {
  const minimum = auction.currentPrice + auction.stepPrice;
  const followsStep = auction.stepPrice === 0 || (maximum - auction.currentPrice) % auction.stepPrice === 0;
  if (maximum < minimum || !followsStep) throw new BidDomainError("Invalid bid price");
}

export function assertBuyNowAvailable(auction: AuctionState, userId: number, amount: number): void {
  if (auction.sellerId === userId) throw new BidDomainError("Seller cannot buy their own product");
  if (auction.buyNowPrice === null || amount < auction.buyNowPrice)
    throw new BidDomainError("Product is not available for buy now");
}

export function assertBanAuthority(actor: { userId: number; role: string }, auction: AuctionState): void {
  if (actor.role !== "admin" && actor.userId !== auction.sellerId) {
    throw new BidDomainError("Only the seller or an administrator can ban bidders", 403);
  }
}
