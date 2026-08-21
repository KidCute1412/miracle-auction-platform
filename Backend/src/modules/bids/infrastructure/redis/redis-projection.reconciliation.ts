import { auctionRedisClientForProduct } from "@/config/redis.config.ts";
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
  redisEndAtMs: string;
  postgresEndAtMs: string;
  redisStatus: string;
  postgresStatus: string;
  redisLeaderId: string | null;
  postgresLeaderId: string | null;
  redisLastEventId: string | null;
  postgresLastEventId: string | null;
  redisExpectedOrderCount: number;
  postgresOrderCount: number;
  status: "converged" | "projection_lag" | "diverged";
}

export async function reconcileAuctionProjection(productId: number): Promise<ProjectionReconciliation> {
  const [redisState, product, latestTransition, orders] = await Promise.all([
    auctionRedisClientForProduct(productId).hmget(
      redisAuctionKeys.state(productId),
      "version",
      "sequence",
      "currentPriceVnd",
      "leaderId",
      "endAtMs",
      "status",
      "lastEventId",
    ),
    prisma.products.findUnique({
      where: { product_id: BigInt(productId) },
      select: {
        auction_version: true,
        auction_sequence: true,
        current_price: true,
        start_price: true,
        price_owner_id: true,
        end_time: true,
        auction_status: true,
      },
    }),
    prisma.auction_transitions.findFirst({
      where: { product_id: BigInt(productId) },
      orderBy: { sequence: "desc" },
      select: { event_id: true },
    }),
    prisma.orders.count({ where: { product_id: BigInt(productId) } }),
  ]);
  if (!product || !redisState[0] || !redisState[1] || redisState[2] === null || !redisState[4] || !redisState[5]) {
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
  const redisLastEventId = redisState[6] || null;
  const postgresLastEventId = latestTransition?.event_id ?? null;
  const redisEndAtMs = redisState[4];
  const postgresEndAtMs = product.end_time?.getTime().toString() ?? "0";
  const redisStatus = redisState[5];
  const postgresStatus = product.auction_status;
  const redisExpectedOrderCount = redisStatus === "SOLD" || (redisStatus === "ENDED" && redisLeaderId !== null) ? 1 : 0;
  const sameVersion = redisVersion === postgresVersion && redisSequence === postgresSequence;
  const sameSnapshot = sameVersion
      && redisSequence === postgresSequence
      && redisCurrentPriceVnd === postgresCurrentPriceVnd
      && redisEndAtMs === postgresEndAtMs
      && redisStatus === postgresStatus
      && redisLeaderId === postgresLeaderId
      && redisLastEventId === postgresLastEventId
      && redisExpectedOrderCount === orders
  const status = sameSnapshot
    ? "converged"
    : redisVersion >= postgresVersion && redisSequence >= postgresSequence && !sameVersion
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
    redisEndAtMs,
    postgresEndAtMs,
    redisStatus,
    postgresStatus,
    redisLeaderId,
    postgresLeaderId,
    redisLastEventId,
    postgresLastEventId,
    redisExpectedOrderCount,
    postgresOrderCount: orders,
    status,
  };
}
