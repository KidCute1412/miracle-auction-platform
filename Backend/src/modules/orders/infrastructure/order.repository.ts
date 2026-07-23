import { Prisma } from "@prisma/client";
import { prisma } from "@/infrastructure/database/prisma.client.ts";

export type CreateOrderInput = {
  user_id: number;
  public_order_id: string;
  shipping_address?: string;
  phone_number?: string;
  payment_proof_image_url?: string;
};

// Checkout enriches the unique order created by the auction projector.
export async function updateWinnerOrder(data: CreateOrderInput) {
  const updated = await prisma.orders.updateMany({
    where: {
      public_order_id: data.public_order_id,
      user_id: data.user_id,
      order_status: "pending",
    },
    data: {
      shipping_address: data.shipping_address,
      phone_number: data.phone_number,
      payment_proof_image_url: data.payment_proof_image_url,
    },
  });
  if (updated.count !== 1) throw new Error("Winner order was not found or is not pending");
}

export async function getPendingWinnerOrder(publicOrderId: string, userId: number) {
  return prisma.orders.findFirst({
    where: { public_order_id: publicOrderId, user_id: userId, order_status: "pending" },
    select: { public_order_id: true },
  });
}

// Retrieve order details by buyer user ID and product ID
export async function getOrderDetail(userId: number, productId: number) {
  return prisma.orders.findFirst({
    where: { user_id: userId, product_id: BigInt(productId) },
  });
}

// Retrieve order details combined with product and bidder info for the seller
export async function getSellerOrderView(productId: number) {
  const rows = await prisma.$queryRaw<Record<string, unknown>[]>(Prisma.sql`
    SELECT
      o.*,
      p.product_name,
      p.product_images,
      p.buy_now_price,
      p.end_time,
      u.user_id AS winner_id,
      u.username AS winner_name,
      u.username AS winner_username,
      u.email AS winner_email,
      u.avatar AS winner_avatar
    FROM orders o
    JOIN products p ON o.product_id = p.product_id
    JOIN users u ON o.user_id = u.user_id
    WHERE o.product_id = ${BigInt(productId)}
    LIMIT 1
  `);
  return rows[0];
}

// Fetch order details by product ID
export async function getOrderByProductId(productId: number) {
  return prisma.orders.findFirst({ where: { product_id: BigInt(productId) } });
}

// Update order status and optional shipping label URL
export async function updateOrderStatus(
  orderId: bigint,
  status: "rejected" | "finished",
  shippingLabelImageUrl?: string,
) {
  return prisma.orders.update({
    where: { order_id: orderId },
    data: {
      order_status: status,
      ...(shippingLabelImageUrl ? { shipping_label_image_url: shippingLabelImageUrl } : {}),
    },
  });
}
