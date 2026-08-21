import { auctionRedisClientForProduct } from "@/config/redis.config.ts";
import { prisma } from "@/infrastructure/database/prisma.client.ts";
import { redisAuctionKeys } from "./redis-auction.keys.ts";

const TERMINAL_STATUSES = new Set(["SOLD", "ENDED", "CANCELLED"]);

function terminalTtlMs(): number {
  return Math.max(1, Number(process.env.AUCTION_TERMINAL_GRACE_SECONDS ?? 604_800)) * 1_000;
}

export function isTerminalAuctionStatus(status: string): boolean {
  return TERMINAL_STATUSES.has(status);
}

export async function expireTerminalAuctionState(productId: number): Promise<void> {
  const redis = auctionRedisClientForProduct(productId);
  const ttl = terminalTtlMs();
  await Promise.all([
    redis.pexpire(redisAuctionKeys.state(productId), ttl),
    redis.pexpire(redisAuctionKeys.maxima(productId), ttl),
    redis.pexpire(redisAuctionKeys.ranking(productId), ttl),
    redis.pexpire(redisAuctionKeys.rankMembers(productId), ttl),
    redis.pexpire(redisAuctionKeys.bans(productId), ttl),
    redis.pexpire(redisAuctionKeys.idempotency(productId), ttl),
  ]);
}

export async function expireConvergedLegacyTerminalAuctions(limit = 500): Promise<number> {
  const products = await prisma.products.findMany({
    where: { auction_status: { in: ["SOLD", "ENDED", "CANCELLED"] } },
    select: { product_id: true, auction_status: true, auction_sequence: true, auction_version: true },
    orderBy: { product_id: "asc" },
    take: limit,
  });
  let expired = 0;
  for (const product of products) {
    const productId = Number(product.product_id);
    const redis = auctionRedisClientForProduct(productId);
    const [status, sequence, version] = await redis.hmget(
      redisAuctionKeys.state(productId),
      "status",
      "sequence",
      "version",
    );
    if (
      status === product.auction_status
      && sequence === product.auction_sequence.toString()
      && version === product.auction_version.toString()
    ) {
      await expireTerminalAuctionState(productId);
      expired += 1;
    }
  }
  return expired;
}
