import * as orderRepository from "../infrastructure/order.repository.ts";
import { uploadToCloudinary } from "@/config/cloud.config.ts";
import fs from "fs";
import { OrderDomainError } from "../domain/order.errors.ts";

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
export async function getSellerOrderView(product_id: number) {
  return orderRepository.getSellerOrderView(product_id);
}

// Fetch order by product ID
export async function getOrderByProductId(product_id: number) {
  return orderRepository.getOrderByProductId(product_id);
}

// Reject order if pending status
export async function rejectOrder(product_id: number): Promise<{ success: boolean; message: string }> {
  const existedOrder = await orderRepository.getOrderByProductId(product_id);
  if (!existedOrder) {
    return { success: false, message: "Order does not exist" };
  }
  if (existedOrder.order_status !== "pending") {
    return { success: false, message: "Can only reject pending orders" };
  }
  await orderRepository.updateOrderStatus(existedOrder.order_id, "rejected");
  return { success: true, message: "Order rejected successfully" };
}

// Approve order, upload shipping label, and set status to finished
export async function approveOrder(
  product_id: number,
  file?: Express.Multer.File,
): Promise<{ success: boolean; message: string }> {
  const existedOrder = await orderRepository.getOrderByProductId(product_id);
  if (!existedOrder) {
    return { success: false, message: "Order does not exist" };
  }
  if (existedOrder.order_status !== "pending") {
    return { success: false, message: "Can only approve pending orders" };
  }
  let shipping_label_image_url = "";
  if (file) {
    const uploadResult = await uploadToCloudinary(file.path, "shipping_label");
    fs.unlinkSync(file.path);
    shipping_label_image_url = uploadResult.secure_url;
  }
  await orderRepository.updateOrderStatus(existedOrder.order_id, "finished", shipping_label_image_url);
  return { success: true, message: "Order approved successfully" };
}
