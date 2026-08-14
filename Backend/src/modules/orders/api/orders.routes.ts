import { Router } from "express";
import * as ordersController from "./orders.controller.ts";
import * as authMiddleware from "@/middlewares/auth.middleware.ts";
import upload from "@/helpers/uploadImage.helper.ts";
import { validate } from "@/middlewares/validate.middleware.ts";
import { orderIdParamsSchema, orderProductQuerySchema, rejectionSchema, winnerCheckoutSchema } from "./orders.schemas.ts";

const route = Router();

// Create a new order with payment proof
route.post(
  "/",
  authMiddleware.verifyToken,
  upload.single("payment_proof"),
  validate(winnerCheckoutSchema, "body"),
  ordersController.createOrder,
);

// Get order details for buyer
route.get("/", authMiddleware.verifyToken, validate(orderProductQuerySchema, "query"), ordersController.getOrderDetail);

// Get order details for seller view
route.get("/seller", authMiddleware.verifyToken, validate(orderProductQuerySchema, "query"), ordersController.getSellerOrderView);

// Reject an existing order by ID
route.patch("/:id/rejection", authMiddleware.verifyToken, validate(orderIdParamsSchema, "params"), validate(rejectionSchema, "body"), ordersController.rejectOrder);

// Approve an existing order and upload shipping label
route.patch(
  "/:id/approval",
  authMiddleware.verifyToken,
  validate(orderIdParamsSchema, "params"),
  upload.single("shipping_label"),
  ordersController.approveOrder,
);

export default route;
