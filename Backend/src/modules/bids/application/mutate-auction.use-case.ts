import { randomUUID } from "node:crypto";
import { BidDomainError } from "../domain/bid.errors.ts";
import { redisAuctionAuthority } from "../infrastructure/redis/redis-auction.authority.ts";
import type { AuctionMutationData } from "../infrastructure/redis/redis-auction.types.ts";
import { getBidEngine } from "./bid-engine.ts";

export class MutateAuctionUseCase {
  async close(productId: number, deadlineMs: string, now = new Date()): Promise<AuctionMutationData> {
    if (getBidEngine() !== "redis") {
      throw new BidDomainError("Redis engine is required for authoritative close", 409, "WRONG_BID_ENGINE");
    }
    const result = await redisAuctionAuthority.mutate({
      operation: "CLOSE",
      productId,
      actorId: 0,
      actorRole: "system",
      idempotencyKey: `close:${productId}:${deadlineMs}`,
      correlationId: randomUUID(),
      now,
    });
    return result.data;
  }

  async cancel(input: {
    productId: number;
    actorId: number;
    actorRole: string;
    idempotencyKey: string;
    correlationId?: string;
    reason?: string;
  }): Promise<AuctionMutationData> {
    if (getBidEngine() !== "redis") {
      throw new BidDomainError("Redis engine is required for authoritative cancel", 409, "WRONG_BID_ENGINE");
    }
    const result = await redisAuctionAuthority.mutate({
      operation: "CANCEL",
      ...input,
      correlationId: input.correlationId ?? randomUUID(),
    });
    return result.data;
  }
}
