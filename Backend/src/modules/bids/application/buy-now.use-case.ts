import type { Prisma } from "@prisma/client";
import { prisma } from "@/infrastructure/database/prisma.client.ts";
import { assertAuctionAvailable, assertBidderCanParticipate, assertBuyNowAvailable } from "../domain/auction.policy.ts";
import { BidDomainError } from "../domain/bid.errors.ts";
import type { AuctionState } from "../domain/bid.types.ts";
import {
  addBidOutboxEvent,
  findIdempotentResponse,
  saveIdempotentResponse,
} from "../infrastructure/bid-outbox.repository.ts";
import { BidRepository, lockIdempotencyKey } from "../infrastructure/bid.repository.ts";

const bids = new BidRepository();
export type BuyNowInput = { userId: number; productId: number; buyPrice: number; idempotencyKey?: string };
export type BuyNowResult = { status: "success"; order_id: number; end_time: string };

export class BuyNowUseCase {
  static async complete(
    tx: Prisma.TransactionClient,
    auction: AuctionState,
    userId: number,
  ): Promise<Omit<BuyNowResult, "status">> {
    const price = auction.buyNowPrice;
    if (price === null) throw new BidDomainError("Product does not have buy now price");
    const endTime = new Date();
    await bids.updateAuction(tx, auction, price, userId, 1, endTime);
    await bids.record(tx, {
      userId,
      productId: auction.productId,
      maxPrice: price,
      productPrice: price,
      priceOwnerId: userId,
    });
    const orderId = await bids.createOrder(tx, userId, auction.productId);
    await addBidOutboxEvent(tx, "auction.buy_now_completed", auction.productId, {
      productId: auction.productId,
      buyerId: userId,
      orderId,
      currentPrice: price,
    });
    return { order_id: orderId, end_time: endTime.toISOString() };
  }

  async execute(input: BuyNowInput): Promise<BuyNowResult> {
    return prisma.$transaction(async (tx) => {
      const operation = "buy_now";
      const fingerprint = `${input.productId}:${input.buyPrice}`;
      await lockIdempotencyKey(tx, operation, input.userId, input.idempotencyKey);
      const replay = await findIdempotentResponse(tx, operation, input.userId, input.idempotencyKey, fingerprint);
      if (replay) return replay as BuyNowResult;
      const auction = await bids.lockAuction(tx, input.productId);
      if (!auction) throw new BidDomainError("Product not found");
      assertAuctionAvailable(auction);
      assertBidderCanParticipate(auction, input.userId, await bids.eligibility(tx, input.productId, input.userId));
      assertBuyNowAvailable(auction, input.userId, input.buyPrice);
      const response: BuyNowResult = {
        status: "success",
        ...(await BuyNowUseCase.complete(tx, auction, input.userId)),
      };
      await saveIdempotentResponse(tx, operation, input.userId, input.idempotencyKey, fingerprint, response);
      return response;
    });
  }
}
