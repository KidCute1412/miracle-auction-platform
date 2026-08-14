import { Response } from "express";
import * as orderUseCase from "../application/order.use-case.ts";
import { type AccountRequest, requireAuthenticatedUser } from "@/interfaces/request.interface.ts";
import type { CreateOrderData } from "../application/order.use-case.ts";
import type { CreateOrderRequest } from "api-contracts";
import { OrderDomainError } from "../domain/order.errors.ts";

// Handle order creation
export async function createOrder(req: AccountRequest, res: Response) {
  try {
    const input = res.locals.validated?.body as CreateOrderRequest;
    const data: CreateOrderData = { ...input, user_id: requireAuthenticatedUser(req).user_id };
    const file = req.file;

    await orderUseCase.createOrder(data, file);
    return res.status(200).json({
      status: "success",
      message: "Invoice created successfully",
    });
  } catch (error) {
    const status = error instanceof OrderDomainError ? error.statusCode : 500;
    return res.status(status).json({
      status: "error",
      code: error instanceof OrderDomainError ? error.code : "INTERNAL_ERROR",
      message: error instanceof OrderDomainError ? error.message : "Error updating winner order",
    });
  }
}

// Fetch order details for the buyer
export async function getOrderDetail(req: AccountRequest, res: Response) {
  try {
    const user_id = requireAuthenticatedUser(req).user_id;
    const product_id = res.locals.validated?.query as { product_id: number };
    const orderDetail = await orderUseCase.getOrderDetail(user_id, product_id.product_id);
    return res.status(200).json({
      status: "success",
      message: "Successfully retrieved order details",
      data: orderDetail,
    });
  } catch {
    return res.status(500).json({
      status: "error",
      message: "Error retrieving order details",
    });
  }
}

// Fetch order details from the seller perspective
export async function getSellerOrderView(req: AccountRequest, res: Response) {
  try {
    const actor = requireAuthenticatedUser(req);
    if (actor.role !== "seller") throw new OrderDomainError("Seller access is required", 403, "SELLER_ACCESS_REQUIRED");
    const query = res.locals.validated?.query as { product_id: number };
    const orderDetail = await orderUseCase.getSellerOrderView(query.product_id, actor.user_id);
    return res.status(200).json({
      status: "success",
      message: "Successfully retrieved seller order details",
      data: orderDetail,
    });
  } catch (error) {
    return res.status(error instanceof OrderDomainError ? error.statusCode : 500).json({
      status: "error",
      code: error instanceof OrderDomainError ? error.code : "INTERNAL_ERROR",
      message: error instanceof OrderDomainError ? error.message : "Error retrieving seller order details",
    });
  }
}

// Reject a pending order
export async function rejectOrder(req: AccountRequest, res: Response) {
  try {
    const actor = requireAuthenticatedUser(req);
    if (actor.role !== "seller") throw new OrderDomainError("Seller access is required", 403, "SELLER_ACCESS_REQUIRED");
    const { id } = res.locals.validated?.params as { id: number };
    const { reason } = res.locals.validated?.body as { reason: string };
    await orderUseCase.rejectOrder(id, actor.user_id, reason);
    return res.status(200).json({
      status: "success",
      message: "Order rejected successfully",
    });
  } catch (error) {
    return res.status(error instanceof OrderDomainError ? error.statusCode : 500).json({
      status: "error",
      code: error instanceof OrderDomainError ? error.code : "INTERNAL_ERROR",
      message: error instanceof OrderDomainError ? error.message : "Error rejecting order",
    });
  }
}

// Approve a pending order and save shipping label
export async function approveOrder(req: AccountRequest, res: Response) {
  try {
    const actor = requireAuthenticatedUser(req);
    if (actor.role !== "seller") throw new OrderDomainError("Seller access is required", 403, "SELLER_ACCESS_REQUIRED");
    const file = req.file as Express.Multer.File;
    const { id } = res.locals.validated?.params as { id: number };
    await orderUseCase.approveOrder(id, actor.user_id, file);
    return res.status(200).json({
      status: "success",
      message: "Order approved successfully",
    });
  } catch (error) {
    return res.status(error instanceof OrderDomainError ? error.statusCode : 500).json({
      status: "error",
      code: error instanceof OrderDomainError ? error.code : "INTERNAL_ERROR",
      message: error instanceof OrderDomainError ? error.message : "Error approving order",
    });
  }
}
