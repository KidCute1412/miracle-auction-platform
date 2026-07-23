import jwt from "jsonwebtoken";
import { prisma } from "../../src/infrastructure/database/prisma.client.ts";

let sequence = 0;
export async function createUser(overrides: Partial<{ username: string; email: string; role: string; rating: number; rating_count: number }> = {}) {
  sequence += 1;
  return prisma.users.create({
    data: {
      username: overrides.username ?? `test-user-${sequence}`,
      full_name: `Test User ${sequence}`,
      email: overrides.email ?? `test-${sequence}@example.test`,
      password: "not-used-by-route-tests",
      role: overrides.role ?? "user",
      rating: overrides.rating ?? 5,
      rating_count: overrides.rating_count ?? 1,
    },
  });
}

export async function createAuction(sellerId: number, overrides: Partial<{ current_price: number; start_price: number; step_price: number; buy_now_price: number | null }> = {}) {
  return prisma.products.create({
    data: {
      product_name: "Test auction",
      seller_id: BigInt(sellerId),
      start_price: BigInt(overrides.start_price ?? 100),
      current_price: BigInt(overrides.current_price ?? 100),
      step_price: BigInt(overrides.step_price ?? 10),
      buy_now_price: overrides.buy_now_price === null || overrides.buy_now_price === undefined ? null : BigInt(overrides.buy_now_price),
      start_time: new Date(Date.now() - 60_000),
      end_time: new Date(Date.now() + 60 * 60_000),
      product_images: [],
      auction_status: "ACTIVE",
    },
  });
}

export function accessCookie(user: { user_id: number; auth_version: number }): string {
  const token = jwt.sign({ user_id: user.user_id, auth_version: user.auth_version }, process.env.JWT_SECRET!, {
    algorithm: "HS256", issuer: "online-auction", audience: "online-auction-api", expiresIn: "15m",
  });
  return `accessToken=${token}`;
}
