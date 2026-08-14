import * as orderRepository from "../infrastructure/order.repository.ts";
import { uploadToCloudinary } from "@/config/cloud.config.ts";
import fs from "fs";
import { OrderDomainError } from "../domain/order.errors.ts";
import { prisma } from "@/infrastructure/database/prisma.client.ts";
import { addOutboxEvent } from "@/infrastructure/events/outbox.repository.ts";
import { kafkaTopics } from "@/config/kafka-topics.config.ts";

// Create order and optionally upload payment proof image to Cloudinary
export type CreateOrderData = {
  user_id: number;
  public_order_id: string;
  shipping_address?: string;
  phone_number?: string;
  payment_proof_image_url?: string;
};

export async function createOrder(data: CreateOrderData, file?: Express.Multer.File): Promise<void> {
  const winnerOrder = await orderRepository.getPendingWinnerOrder(data.public_order_id, data.user_id);
  if (!winnerOrder) {
    throw new OrderDomainError("Winner order was not found or is not pending", 404, "WINNER_ORDER_NOT_FOUND");
  }
  if (file) {
    const uploadResult = await uploadToCloudinary(file.path, "payment_proof");
    fs.unlinkSync(file.path);
    data.payment_proof_image_url = uploadResult.secure_url;
  }
  await orderRepository.updateWinnerOrder(data);
}

// Fetch order details
export async function getOrderDetail(user_id: number, product_id: number) {
  return orderRepository.getOrderDetail(user_id, product_id);
}

// Fetch seller order view details
export async function getSellerOrderView(productId: number, sellerId: number) {
  return orderRepository.getSellerOrderView(productId, sellerId);
}

async function transitionSellerOrder(
  orderId: number,
  sellerId: number,
  nextStatus: "rejected" | "payment_verified",
  shippingLabelImageUrl?: string,
  rejectionReason?: string,
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const order = await tx.orders.findUnique({
      where: { order_id: BigInt(orderId) },
      select: { order_id: true, product_id: true, order_status: true, products: { select: { seller_id: true, current_price: true } } },
    });
    if (!order || !order.products || order.products.seller_id !== BigInt(sellerId)) {
      throw new OrderDomainError("Order was not found for this seller", 404, "SELLER_ORDER_NOT_FOUND");
    }
    if (order.order_status !== "pending") {
      throw new OrderDomainError("Only pending orders can change state", 409, "ORDER_TRANSITION_INVALID");
    }
    const updated = await tx.orders.updateMany({
      where: { order_id: order.order_id, order_status: "pending" },
      data: {
        order_status: nextStatus,
        ...(nextStatus === "payment_verified" ? { completed_at: new Date(), amount_vnd: order.products.current_price } : {}),
        ...(shippingLabelImageUrl ? { shipping_label_image_url: shippingLabelImageUrl } : {}),
        ...(rejectionReason ? { rejection_reason: rejectionReason } : {}),
      },
    });
    if (updated.count !== 1) throw new OrderDomainError("Order state changed concurrently", 409, "ORDER_TRANSITION_CONFLICT");
    await addOutboxEvent(tx, {
      topic: kafkaTopics.domain,
      eventType: nextStatus === "payment_verified" ? "order.payment_verified.v1" : "order.rejected.v1",
      aggregateId: order.order_id.toString(),
      payload: { orderId: order.order_id.toString(), productId: order.product_id?.toString() ?? null },
    });
  });
}

export async function rejectOrder(orderId: number, sellerId: number, reason: string): Promise<void> {
  await transitionSellerOrder(orderId, sellerId, "rejected", undefined, reason);
}

export async function approveOrder(
  orderId: number,
  sellerId: number,
  file?: Express.Multer.File,
): Promise<void> {
  let shipping_label_image_url = "";
  if (file) {
    const uploadResult = await uploadToCloudinary(file.path, "shipping_label");
    fs.unlinkSync(file.path);
    shipping_label_image_url = uploadResult.secure_url;
  }
  if (!shipping_label_image_url) {
    throw new OrderDomainError("A shipping label is required to verify payment", 400, "SHIPPING_LABEL_REQUIRED");
  }
  await transitionSellerOrder(orderId, sellerId, "payment_verified", shipping_label_image_url || undefined);
}
