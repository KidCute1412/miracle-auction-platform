import { Router } from "express";
import * as clientController from "./users.client.controller.ts";
import * as adminController from "./users.admin.controller.ts";
import { verifyToken } from "@/middlewares/auth.middleware.ts";

export const clientUserRouter = Router();
export const adminUserRouter = Router();
export const adminApplicationRouter = Router();

// Client routes
clientUserRouter.post("/seller-registrations", verifyToken, clientController.registerSellerRequest);
clientUserRouter.post("/ratings", verifyToken, clientController.rateUser);
clientUserRouter.get("/ratings/count", clientController.getUserRatingCount);
clientUserRouter.get("/ratings", clientController.getUserRatingHistory);

// Admin user routes
adminUserRouter.get("/", adminController.list);
adminUserRouter.get("/count", adminController.calNumberOfUsers);
adminUserRouter.get("/:id", adminController.detail);
adminUserRouter.patch("/:id/role", adminController.editRole);
adminUserRouter.patch("/:id/password", adminController.resetPassword);

// Admin seller registration routes
adminApplicationRouter.get("/", adminController.applications);
adminApplicationRouter.get("/count", adminController.calTotalApplications);
adminApplicationRouter.get("/:id", adminController.applicationDetail);
adminApplicationRouter.patch("/:id/status", adminController.setStatus);
