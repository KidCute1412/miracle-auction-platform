import { Prisma } from "@prisma/client";
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { auctionRedisClientForProduct } from "@/config/redis.config.ts";
import { prisma } from "@/infrastructure/database/prisma.client.ts";
import { redisAuctionKeys } from "./redis-auction.keys.ts";

type AuctionSeedRow = {
  product_id: bigint;
  seller_id: bigint;
  start_price: bigint | null;
  current_price: bigint | null;
  step_price: bigint | null;
  buy_now_price: bigint | null;
  price_owner_id: bigint | null;
  start_time: Date | null;
  end_time: Date | null;
  auto_extended: boolean | null;
  auction_status: string;
  auction_version: bigint;
  auction_sequence: bigint;
};

const pad = (value: bigint): string => value.toString().padStart(19, "0");
const rankMember = (amount: bigint, userId: number): string => `${pad(amount)}:${pad(BigInt(userId))}`;
const BOOTSTRAP_SCRIPT_URL = new URL("./auction-bootstrap.lua", import.meta.url);

async function waitForConcurrentBootstrap(productId: number, timeoutMs = 1_000): Promise<boolean> {
  const redis = auctionRedisClientForProduct(productId);
  const stateKey = redisAuctionKeys.state(productId);
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await redis.exists(stateKey)) return true;
    await new Promise((resolve) => setTimeout(resolve, 25));
  }
  return false;
}

export async function bootstrapRedisAuction(productId: number, options: { recovery?: boolean; force?: boolean } = {}): Promise<boolean> {
  const redis = auctionRedisClientForProduct(productId);
  const stateKey = redisAuctionKeys.state(productId);
  const lockKey = `auction:bootstrap-lock:${productId}`;
  const lockToken = randomUUID();
  const acquired = await redis.set(lockKey, lockToken, "PX", 30_000, "NX");
  if (acquired !== "OK") {
    await waitForConcurrentBootstrap(productId);
    return false;
  }
  try {
    if (!options.force && await redis.exists(stateKey)) return false;

    const [rows, settings, bans, maxima, latestTransition] = await Promise.all([
    prisma.$queryRaw<AuctionSeedRow[]>(Prisma.sql`
      SELECT product_id, seller_id, start_price, current_price, step_price, buy_now_price,
             price_owner_id, start_time, end_time, auto_extended, auction_status,
             auction_version, auction_sequence
      FROM products WHERE product_id = ${BigInt(productId)}`),
    prisma.extend_bidding_time.findFirst({ select: { threshold_time: true, extend_time: true } }),
    prisma.bidding_ban_user.findMany({
      where: { product_id: BigInt(productId) },
      select: { user_id: true },
    }),
    prisma.bidding_history.groupBy({
      by: ["user_id"],
      where: { product_id: BigInt(productId), status: null },
      _max: { max_price: true },
    }),
    prisma.auction_transitions.findFirst({
      where: { product_id: BigInt(productId) },
      orderBy: { sequence: "desc" },
      select: { event_id: true },
    }),
    ]);
    const auction = rows[0];
    if (!auction) throw new Error(`Cannot bootstrap missing auction ${productId}`);

    const maximumByUser = new Map(maxima.map((row) => [row.user_id, row._max.max_price ?? 0n]));
    const leaderId = auction.price_owner_id === null ? undefined : Number(auction.price_owner_id);
    const now = Date.now();
    const effectiveStatus = auction.auction_status === "PENDING" &&
      (auction.start_time?.getTime() ?? Number.POSITIVE_INFINITY) <= now &&
      (auction.end_time?.getTime() ?? 0) > now
      ? "ACTIVE"
      : auction.auction_status;
    const seed = {
      productId: auction.product_id.toString(),
      state: {
        productId: auction.product_id.toString(),
        sellerId: auction.seller_id.toString(),
        status: effectiveStatus,
        startAtMs: (auction.start_time ?? new Date(0)).getTime().toString(),
        endAtMs: (auction.end_time ?? new Date(0)).getTime().toString(),
        startPriceVnd: (auction.start_price ?? 0n).toString(),
        currentPriceVnd: (auction.current_price ?? auction.start_price ?? 0n).toString(),
        stepPriceVnd: (auction.step_price ?? 0n).toString(),
        buyNowPriceVnd: auction.buy_now_price?.toString() ?? "",
        leaderId: leaderId?.toString() ?? "",
        leaderMaxPriceVnd: leaderId === undefined ? "" : (maximumByUser.get(leaderId) ?? 0n).toString(),
        sequence: auction.auction_sequence.toString(),
        version: auction.auction_version.toString(),
        autoExtend: auction.auto_extended ? "1" : "0",
        antiSnipeWindowMs: ((settings?.threshold_time ?? 0n) * 60_000n).toString(),
        antiSnipeExtensionMs: ((settings?.extend_time ?? 0n) * 60_000n).toString(),
        lastEventId: latestTransition?.event_id ?? "",
      },
      maxima: [...maximumByUser].map(([userId, maximum]) => ({
        userId: userId.toString(),
        amount: maximum.toString(),
        member: rankMember(maximum, userId),
      })),
      bans: bans.flatMap((ban) => ban.user_id === null ? [] : [ban.user_id.toString()]),
      deadlineScore: effectiveStatus === "ACTIVE" && auction.end_time ? auction.end_time.getTime().toString() : undefined,
      recovery: options.recovery === true,
    };
    if (options.force) {
      await redis.del(
        stateKey,
        redisAuctionKeys.maxima(productId),
        redisAuctionKeys.ranking(productId),
        redisAuctionKeys.rankMembers(productId),
        redisAuctionKeys.bans(productId),
      );
      await redis.zrem(redisAuctionKeys.deadlines, productId.toString());
    }
    const script = await readFile(BOOTSTRAP_SCRIPT_URL, "utf8");
    const result = await redis.eval(
      script,
      8,
      stateKey,
      redisAuctionKeys.maxima(productId),
      redisAuctionKeys.ranking(productId),
      redisAuctionKeys.rankMembers(productId),
      redisAuctionKeys.bans(productId),
      redisAuctionKeys.deadlines,
      redisAuctionKeys.auctionRecoveryFence(productId),
      redisAuctionKeys.recoveryFence,
      JSON.stringify(seed),
    );
    if (result === "INITIALIZED") return true;
    if (result === "EXISTS") return false;
    throw new Error(`Unexpected Redis bootstrap result for auction ${productId}`);
  } finally {
    await redis.eval(
      "if redis.call('GET', KEYS[1]) == ARGV[1] then return redis.call('DEL', KEYS[1]) end return 0",
      1,
      lockKey,
      lockToken,
    ).catch(() => undefined);
  }
}

export async function bootstrapActiveRedisAuctions(): Promise<number> {
  const rows = await prisma.$queryRaw<Array<{ product_id: bigint }>>(Prisma.sql`
    SELECT product_id FROM products WHERE auction_status IN ('PENDING', 'ACTIVE') AND is_removed IS NOT TRUE`);
  let initialized = 0;
  for (const row of rows) {
    if (await bootstrapRedisAuction(Number(row.product_id))) initialized += 1;
  }
  return initialized;
}
