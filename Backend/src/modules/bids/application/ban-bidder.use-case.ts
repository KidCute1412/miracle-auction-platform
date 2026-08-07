import { prisma } from "@/infrastructure/database/prisma.client.ts";
import { assertBanAuthority } from "../domain/auction.policy.ts";
import { BidDomainError } from "../domain/bid.errors.ts";
import { addBidOutboxEvent } from "../infrastructure/bid-outbox.repository.ts";
import { BidRepository } from "../infrastructure/bid.repository.ts";
import { randomUUID } from "node:crypto";
import { getBidEngine } from "./bid-engine.ts";
import { redisAuctionAuthority } from "../infrastructure/redis/redis-auction.authority.ts";
import type { AuctionMutationData } from "../infrastructure/redis/redis-auction.types.ts";
import { bootstrapRedisAuction } from "../infrastructure/redis/redis-auction.bootstrap.ts";
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
      const command = {
        operation: "BAN",
        productId,
        actorId: actor.userId,
        actorRole: actor.role,
        targetUserId: bannedUserId,
        reason,
        idempotencyKey,
        correlationId,
      } as const;
      try {
        return await redisAuctionAuthority.mutate(command);
      } catch (error) {
        if (error instanceof BidDomainError && error.code === "AUCTION_STATE_NOT_READY") {
          const bootstrapped = await bootstrapRedisAuction(productId);
          if (bootstrapped) return redisAuctionAuthority.mutate(command);
        }
        throw error;
      }
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
      await tx.admin_audit_logs.create({
        data: {
          actor_id: actor.userId,
          action: "bidder.ban",
          resource_type: "product_bidder",
          resource_id: `${productId}:${bannedUserId}`,
          result: "success",
          correlation_id: correlationId,
          metadata: { reason },
        },
      });
      return { status: "success", data: { product_id: productId, banned_user_id: bannedUserId } };
    });
  }
}
