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
import { parseMoneyVnd } from "../domain/money.ts";
import { randomUUID } from "node:crypto";
import { getBidEngine } from "./bid-engine.ts";
import { redisAuctionAuthority } from "../infrastructure/redis/redis-auction.authority.ts";
import type { AuctionMutationData } from "../infrastructure/redis/redis-auction.types.ts";
import { decideLuaReferenceBid } from "../domain/lua-reference.model.ts";
import { recordShadowComparison } from "./shadow-comparison.ts";

const bids = new BidRepository();
export type PlaceBidInput = {
  userId: number;
  productId: number;
  maxPriceVnd: string;
  idempotencyKey: string;
  correlationId?: string;
  role?: string;
};
export type PlaceBidResult = { status: "success"; data?: AuctionMutationData };

export class PlaceBidUseCase {
  async execute(input: PlaceBidInput): Promise<PlaceBidResult> {
    if (getBidEngine() === "redis") {
      return redisAuctionAuthority.mutate({
        operation: "BID",
        productId: input.productId,
        actorId: input.userId,
        actorRole: input.role ?? "user",
        amountVnd: input.maxPriceVnd,
        idempotencyKey: input.idempotencyKey,
        correlationId: input.correlationId ?? randomUUID(),
      });
    }
    return prisma.$transaction(async (tx) => {
      const operation = "place_bid";
      const maxPrice = parseMoneyVnd(input.maxPriceVnd, "max_price");
      const fingerprint = `${input.productId}:${input.maxPriceVnd}`;
      await lockIdempotencyKey(tx, operation, input.userId, input.idempotencyKey);
      const replay = await findIdempotentResponse(tx, operation, input.userId, input.idempotencyKey, fingerprint);
      if (replay) return replay as PlaceBidResult;
      const auction = await bids.lockAuction(tx, input.productId);
      if (!auction) throw new BidDomainError("Product not found");
      assertAuctionAvailable(auction);
      assertBidderCanParticipate(auction, input.userId, await bids.eligibility(tx, input.productId, input.userId));
      assertBidAmount(auction, maxPrice);
      if (auction.buyNowPrice !== null && maxPrice >= auction.buyNowPrice) {
        await BuyNowUseCase.complete(tx, auction, input.userId);
      } else {
        const leader = await bids.leader(tx, input.productId);
        const result = calculateProxyBid(auction, { userId: input.userId, maxPrice }, leader);
        if (getBidEngine() === "shadow") {
          const reference = decideLuaReferenceBid({
            currentPriceVnd: auction.currentPrice,
            stepPriceVnd: auction.stepPrice,
            leaderId: leader?.userId ?? null,
            leaderMaxPriceVnd: leader?.maxPrice ?? null,
          }, input.userId, maxPrice);
          recordShadowComparison(
            reference.currentPriceVnd === result.currentPrice &&
            reference.leaderId === result.priceOwnerId,
          );
        }
        if (leader?.userId === input.userId) {
          if (maxPrice <= leader.maxPrice) {
            throw new BidDomainError("Your new maximum bid must be higher than your current maximum bid");
          }
          await bids.updateLeaderMax(tx, input.productId, input.userId, maxPrice);
        }
        else {
          await bids.record(tx, {
            userId: input.userId,
            productId: input.productId,
            maxPrice,
            productPrice: result.currentPrice,
            priceOwnerId: result.priceOwnerId,
          });
          if (leader && maxPrice <= leader.maxPrice)
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
          currentPrice: result.currentPrice.toString(),
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
