import { Request, Response } from "express";
import * as orderUseCase from "../application/order.use-case.ts";
import { type AccountRequest, requireAuthenticatedUser } from "@/interfaces/request.interface.ts";
import type { CreateOrderData } from "../application/order.use-case.ts";

// Handle order creation
export async function createOrder(req: AccountRequest, res: Response) {
  try {
    const data: CreateOrderData = { ...req.body, user_id: requireAuthenticatedUser(req).user_id };
    const file = req.file;

    await orderUseCase.createOrder(data, file);
    return res.status(200).json({
      status: "success",
      message: "Invoice created successfully",
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Error creating order",
    });
  }
}

// Fetch order details for the buyer
export async function getOrderDetail(req: AccountRequest, res: Response) {
  try {
    const user_id = requireAuthenticatedUser(req).user_id;
    const product_id = req.query.product_id as string;
    const orderDetail = await orderUseCase.getOrderDetail(user_id, Number(product_id));
    return res.status(200).json({
      status: "success",
      message: "Successfully retrieved order details",
      data: orderDetail,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Error retrieving order details",
    });
  }
}

// Fetch order details from the seller perspective
export async function getSellerOrderView(req: Request, res: Response) {
  try {
    const product_id = req.query.product_id as string;
    const orderDetail = await orderUseCase.getSellerOrderView(Number(product_id));
    return res.status(200).json({
      status: "success",
      message: "Successfully retrieved seller order details",
      data: orderDetail,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Error retrieving seller order details",
    });
  }
}

// Reject a pending order
export async function rejectOrder(req: Request, res: Response) {
  try {
    const product_id = req.query.product_id as string;
    const result = await orderUseCase.rejectOrder(Number(product_id));
    if (!result.success) {
      return res.status(result.message.includes("exist") ? 404 : 400).json({
        status: "error",
        message: result.message,
      });
    }
    return res.status(200).json({
      status: "success",
      message: result.message,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Error rejecting order",
    });
  }
}

// Approve a pending order and save shipping label
export async function approveOrder(req: Request, res: Response) {
  try {
    const product_id = req.query.product_id as string;
    const file = req.file as Express.Multer.File;
    const result = await orderUseCase.approveOrder(Number(product_id), file);
    if (!result.success) {
      return res.status(result.message.includes("exist") ? 404 : 400).json({
        status: "error",
        message: result.message,
      });
    }
    return res.status(200).json({
      status: "success",
      message: result.message,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Error approving order",
    });
  }
}
