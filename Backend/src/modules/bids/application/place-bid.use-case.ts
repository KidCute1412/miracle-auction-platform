import { prisma } from "@/infrastructure/database/prisma.client.ts";
import { assertAuctionAvailable, assertBidAmount, assertBidderCanParticipate } from "../domain/auction.policy.ts";
import { BidDomainError } from "../domain/bid.errors.ts";
import { calculateProxyBid } from "../domain/proxy-bid.policy.ts";
import {
  addBidOutboxEvent,
  findIdempotentResponse,
  saveIdempotentResponse,
} from "../infrastructure/bid-outbox.repository.ts";
import { BidRepository, extendedEndTime, lockIdempotencyKey } from "../infrastructure/bid.repository.ts";
import { BuyNowUseCase } from "./buy-now.use-case.ts";

const bids = new BidRepository();
export type PlaceBidInput = { userId: number; productId: number; maxPrice: number; idempotencyKey?: string };

export class PlaceBidUseCase {
  async execute(input: PlaceBidInput): Promise<{ status: "success" }> {
    return prisma.$transaction(async (tx) => {
      const operation = "place_bid";
      const fingerprint = `${input.productId}:${input.maxPrice}`;
      await lockIdempotencyKey(tx, operation, input.userId, input.idempotencyKey);
      const replay = await findIdempotentResponse(tx, operation, input.userId, input.idempotencyKey, fingerprint);
      if (replay) return replay as { status: "success" };
      const auction = await bids.lockAuction(tx, input.productId);
      if (!auction) throw new BidDomainError("Product not found");
      assertAuctionAvailable(auction);
      assertBidderCanParticipate(auction, input.userId, await bids.eligibility(tx, input.productId, input.userId));
      assertBidAmount(auction, input.maxPrice);
      if (auction.buyNowPrice !== null && input.maxPrice >= auction.buyNowPrice) {
        await BuyNowUseCase.complete(tx, auction, input.userId);
      } else {
        const leader = await bids.leader(tx, input.productId);
        const result = calculateProxyBid(auction, { userId: input.userId, maxPrice: input.maxPrice }, leader);
        if (leader?.userId === input.userId) {
          if (input.maxPrice <= leader.maxPrice) {
            throw new BidDomainError("Your new maximum bid must be higher than your current maximum bid");
          }
          await bids.updateLeaderMax(tx, input.productId, input.userId, input.maxPrice);
        }
        else {
          await bids.record(tx, {
            userId: input.userId,
            productId: input.productId,
            maxPrice: input.maxPrice,
            productPrice: result.currentPrice,
            priceOwnerId: result.priceOwnerId,
          });
          if (leader && input.maxPrice <= leader.maxPrice)
            await bids.record(tx, {
              userId: leader.userId,
              productId: input.productId,
              maxPrice: leader.maxPrice,
              productPrice: result.currentPrice,
              priceOwnerId: leader.userId,
            });
        }
        const endTime = await extendedEndTime(tx, auction);
        await bids.updateAuction(tx, auction, result.currentPrice, result.priceOwnerId, result.turns, endTime);
        await addBidOutboxEvent(tx, "bid.accepted", input.productId, {
          productId: input.productId,
          bidderId: input.userId,
          currentPrice: result.currentPrice,
          priceOwnerId: result.priceOwnerId,
        });
        if (endTime)
          await addBidOutboxEvent(tx, "auction.extended", input.productId, {
            productId: input.productId,
            endTime: endTime.toISOString(),
          });
      }
      const response = { status: "success" } as const;
      await saveIdempotentResponse(tx, operation, input.userId, input.idempotencyKey, fingerprint, response);
      return response;
    });
  }
}
