import { prisma } from "@/infrastructure/database/prisma.client.ts";
import { assertBanAuthority } from "../domain/auction.policy.ts";
import { BidDomainError } from "../domain/bid.errors.ts";
import { addBidOutboxEvent } from "../infrastructure/bid-outbox.repository.ts";
import { BidRepository } from "../infrastructure/bid.repository.ts";
const bids = new BidRepository();
export class BanBidderUseCase {
  async execute(
    actor: { userId: number; role: string },
    productId: number,
    bannedUserId: number,
    reason: string,
  ): Promise<{ status: "success"; data: { product_id: number; banned_user_id: number } }> {
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
