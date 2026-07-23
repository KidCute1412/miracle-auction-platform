import { redisClient } from "@/config/redis.config.ts";
import { prisma } from "@/infrastructure/database/prisma.client.ts";
import { redisAuctionKeys } from "./redis-auction.keys.ts";

export interface ProjectionReconciliation {
  productId: string;
  redisVersion: string;
  postgresVersion: string;
  redisSequence: string;
  postgresSequence: string;
  status: "converged" | "projection_lag" | "diverged";
}

export async function reconcileAuctionProjection(productId: number): Promise<ProjectionReconciliation> {
  const [redisState, product] = await Promise.all([
    redisClient.hmget(redisAuctionKeys.state(productId), "version", "sequence"),
    prisma.products.findUnique({
      where: { product_id: BigInt(productId) },
      select: { auction_version: true, auction_sequence: true },
    }),
  ]);
  if (!product || !redisState[0] || !redisState[1]) {
    throw new Error(`Cannot reconcile incomplete auction ${productId}`);
  }
  const redisVersion = BigInt(redisState[0]);
  const redisSequence = BigInt(redisState[1]);
  const postgresVersion = product.auction_version;
  const postgresSequence = product.auction_sequence;
  const status = redisVersion === postgresVersion && redisSequence === postgresSequence
    ? "converged"
    : redisVersion >= postgresVersion && redisSequence >= postgresSequence
      ? "projection_lag"
      : "diverged";
  return {
    productId: productId.toString(),
    redisVersion: redisVersion.toString(),
    postgresVersion: postgresVersion.toString(),
    redisSequence: redisSequence.toString(),
    postgresSequence: postgresSequence.toString(),
    status,
  };
}
