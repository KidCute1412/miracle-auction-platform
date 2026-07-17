import { Prisma } from "@prisma/client";
import { prisma } from "@/infrastructure/database/prisma.client.ts";
import { BidDomainError } from "../domain/bid.errors.ts";
import type { AuctionState, BidderEligibility, ProxyBid } from "../domain/bid.types.ts";

type Transaction = Prisma.TransactionClient;
type Numeric = bigint | number | null;
type ProductLockRow = {
  product_id: bigint;
  seller_id: bigint;
  current_price: number | null;
  start_price: number | null;
  step_price: number | null;
  price_owner_id: bigint | null;
  buy_now_price: number | null;
  start_time: Date | null;
  end_time: Date | null;
  is_removed: boolean | null;
};

const numberOf = (value: Numeric): number => Number(value ?? 0);

function mapAuctionRow(row: ProductLockRow): AuctionState {
  return {
    productId: numberOf(row.product_id),
    sellerId: numberOf(row.seller_id),
    currentPrice: numberOf(row.current_price),
    startPrice: numberOf(row.start_price),
    stepPrice: numberOf(row.step_price),
    priceOwnerId: row.price_owner_id === null ? null : numberOf(row.price_owner_id),
    buyNowPrice: row.buy_now_price === null ? null : numberOf(row.buy_now_price),
    startTime: row.start_time ?? new Date(0),
    endTime: row.end_time ?? new Date(0),
    isRemoved: Boolean(row.is_removed),
  };
}

export class BidRepository {
  async lockAuction(tx: Transaction, productId: number): Promise<AuctionState | null> {
    const rows = await tx.$queryRaw<ProductLockRow[]>(Prisma.sql`
      SELECT product_id, seller_id, current_price, start_price, step_price, price_owner_id,
             buy_now_price, start_time, end_time, is_removed
      FROM products WHERE product_id = ${BigInt(productId)} FOR UPDATE`);
    return rows[0] ? mapAuctionRow(rows[0]) : null;
  }

  async updateAuction(
    tx: Transaction,
    auction: AuctionState,
    currentPrice: number,
    priceOwnerId: number,
    turns: number,
    endTime?: Date,
  ): Promise<void> {
    await tx.products.update({
      where: { product_id: BigInt(auction.productId) },
      data: {
        current_price: currentPrice,
        price_owner_id: BigInt(priceOwnerId),
        bid_turns: { increment: BigInt(turns) },
        ...(endTime ? { end_time: endTime } : {}),
      },
    });
  }

  async eligibility(tx: Transaction, productId: number, userId: number): Promise<BidderEligibility> {
    const [user, ban] = await Promise.all([
      tx.users.findUnique({ where: { user_id: userId }, select: { rating: true, rating_count: true } }),
      tx.bidding_ban_user.findFirst({
        where: { product_id: BigInt(productId), user_id: userId },
        select: { id: true },
      }),
    ]);
    if (!user) throw new BidDomainError("User not found", 403);
    return { rating: Number(user.rating ?? 0), ratingCount: user.rating_count ?? 0, banned: Boolean(ban) };
  }

  async leader(tx: Transaction, productId: number): Promise<ProxyBid | undefined> {
    const row = await tx.bidding_history.findFirst({
      where: { product_id: BigInt(productId), status: null },
      orderBy: [{ max_price: "desc" }, { created_at: "desc" }],
      select: { user_id: true, max_price: true },
    });
    return row ? { userId: row.user_id, maxPrice: Number(row.max_price ?? 0) } : undefined;
  }

  async record(
    tx: Transaction,
    bid: { userId: number; productId: number; maxPrice: number; productPrice: number; priceOwnerId: number },
  ): Promise<void> {
    await tx.bidding_history.create({
      data: {
        user_id: bid.userId,
        product_id: BigInt(bid.productId),
        max_price: bid.maxPrice,
        product_price: bid.productPrice,
        price_owner_id: BigInt(bid.priceOwnerId),
      },
    });
  }

  async updateLeaderMax(tx: Transaction, productId: number, userId: number, maxPrice: number): Promise<void> {
    await tx.$executeRaw(Prisma.sql`UPDATE bidding_history SET max_price = ${maxPrice}
      WHERE bidding_id = (SELECT bidding_id FROM bidding_history WHERE product_id = ${BigInt(productId)}
        AND user_id = ${userId} AND status IS NULL ORDER BY created_at DESC, bidding_id DESC LIMIT 1)`);
  }

  async history(productId: number): Promise<unknown[]> {
    return prisma.$queryRaw(Prisma.sql`SELECT bh.*, u1.username AS username, u1.user_id AS user_id,
      u2.username AS price_owner_username FROM bidding_history bh LEFT JOIN users u1 ON bh.user_id = u1.user_id
      LEFT JOIN users u2 ON bh.price_owner_id = u2.user_id WHERE bh.product_id = ${BigInt(productId)}
      ORDER BY bh.created_at DESC, bh.bidding_id DESC`);
  }

  async sellerId(productId: number): Promise<number | undefined> {
    const product = await prisma.products.findUnique({
      where: { product_id: BigInt(productId) },
      select: { seller_id: true },
    });
    return product ? Number(product.seller_id) : undefined;
  }

  async createOrder(tx: Transaction, userId: number, productId: number): Promise<number> {
    const order = await tx.orders.create({
      data: { user_id: userId, product_id: BigInt(productId) },
      select: { order_id: true },
    });
    return Number(order.order_id);
  }

  async ban(tx: Transaction, productId: number, userId: number, reason: string): Promise<void> {
    await tx.bidding_ban_user.create({ data: { product_id: BigInt(productId), user_id: userId, reason } });
    await tx.bidding_history.updateMany({
      where: { product_id: BigInt(productId), user_id: userId, status: null },
      data: { status: "BANNED" },
    });
  }
}

export async function lockIdempotencyKey(
  tx: Transaction,
  operation: string,
  userId: number,
  key?: string,
): Promise<void> {
  if (key)
    await tx.$executeRaw(
      Prisma.sql`SELECT pg_advisory_xact_lock(hashtextextended(${`${operation}:${userId}:${key}`}, 0))`,
    );
}

export async function extendedEndTime(tx: Transaction, auction: AuctionState): Promise<Date | undefined> {
  const settings = await tx.extend_bidding_time.findFirst({ select: { extend_time: true, threshold_time: true } });
  const threshold = Number(settings?.threshold_time ?? 0);
  const extension = Number(settings?.extend_time ?? 0);
  if (threshold <= 0 || extension <= 0 || auction.endTime.getTime() > Date.now() + threshold * 60_000) return undefined;
  return new Date(auction.endTime.getTime() + extension * 60_000);
}
