import { redisClient } from "@/config/redis.config.ts";
import { prisma } from "@/infrastructure/database/prisma.client.ts";
import { redisAuctionKeys } from "./redis-auction.keys.ts";

export interface ProjectionReconciliation {
  productId: string;
  redisVersion: string;
  postgresVersion: string;
  redisSequence: string;
  postgresSequence: string;
  redisCurrentPriceVnd: string;
  postgresCurrentPriceVnd: string;
  redisLeaderId: string | null;
  postgresLeaderId: string | null;
  status: "converged" | "projection_lag" | "diverged";
}

export async function reconcileAuctionProjection(productId: number): Promise<ProjectionReconciliation> {
  const [redisState, product] = await Promise.all([
    redisClient.hmget(
      redisAuctionKeys.state(productId),
      "version",
      "sequence",
      "currentPriceVnd",
      "leaderId",
    ),
    prisma.products.findUnique({
      where: { product_id: BigInt(productId) },
      select: {
        auction_version: true,
        auction_sequence: true,
        current_price: true,
        start_price: true,
        price_owner_id: true,
      },
    }),
  ]);
  if (!product || !redisState[0] || !redisState[1] || redisState[2] === null) {
    throw new Error(`Cannot reconcile incomplete auction ${productId}`);
  }
  const redisVersion = BigInt(redisState[0]);
  const redisSequence = BigInt(redisState[1]);
  const postgresVersion = product.auction_version;
  const postgresSequence = product.auction_sequence;
  const redisCurrentPriceVnd = redisState[2];
  const postgresCurrentPriceVnd = (product.current_price ?? product.start_price ?? 0n).toString();
  const redisLeaderId = redisState[3] || null;
  const postgresLeaderId = product.price_owner_id?.toString() ?? null;
  const status = redisVersion === postgresVersion
      && redisSequence === postgresSequence
      && redisCurrentPriceVnd === postgresCurrentPriceVnd
      && redisLeaderId === postgresLeaderId
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
    redisCurrentPriceVnd,
    postgresCurrentPriceVnd,
    redisLeaderId,
    postgresLeaderId,
    status,
  };
}
