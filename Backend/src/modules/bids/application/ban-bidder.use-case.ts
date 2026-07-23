import { prisma } from "@/infrastructure/database/prisma.client.ts";
import { assertBanAuthority } from "../domain/auction.policy.ts";
import { BidDomainError } from "../domain/bid.errors.ts";
import { addBidOutboxEvent } from "../infrastructure/bid-outbox.repository.ts";
import { BidRepository } from "../infrastructure/bid.repository.ts";
import { randomUUID } from "node:crypto";
import { getBidEngine } from "./bid-engine.ts";
import { redisAuctionAuthority } from "../infrastructure/redis/redis-auction.authority.ts";
import type { AuctionMutationData } from "../infrastructure/redis/redis-auction.types.ts";
const bids = new BidRepository();
export class BanBidderUseCase {
  async execute(
    actor: { userId: number; role: string },
    productId: number,
    bannedUserId: number,
    reason: string,
    idempotencyKey: string,
    correlationId: string = randomUUID(),
  ): Promise<{ status: "success"; data: { product_id: number; banned_user_id: number } | AuctionMutationData }> {
    if (getBidEngine() === "redis") {
      return redisAuctionAuthority.mutate({
        operation: "BAN",
        productId,
        actorId: actor.userId,
        actorRole: actor.role,
        targetUserId: bannedUserId,
        reason,
        idempotencyKey,
        correlationId,
      });
    }
    return prisma.$transaction(async (tx) => {
      const auction = await bids.lockAuction(tx, productId);
      if (!auction) throw new BidDomainError("Product not found");
      assertBanAuthority(actor, auction);
      const existing = await tx.bidding_ban_user.findFirst({
        where: { product_id: BigInt(productId), user_id: bannedUserId },
      });
      if (existing) throw new BidDomainError("Bidder was already banned");
      await bids.ban(tx, productId, bannedUserId, reason);
      await addBidOutboxEvent(tx, "bidder.banned", productId, { productId, bannedUserId, reason });
      return { status: "success", data: { product_id: productId, banned_user_id: bannedUserId } };
    });
  }
}
