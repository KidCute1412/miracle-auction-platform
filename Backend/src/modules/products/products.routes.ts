import { Router } from "express";
import * as clientController from "./products.client.controller.ts";
import * as adminController from "./products.admin.controller.ts";
import { verifyToken, verifyRole, justDecodeToken } from "@/middlewares/auth.middleware.ts";
import upload from "@/helpers/uploadImage.helper.ts";

export const clientProductRouter = Router();
export const adminProductRouter = Router();

// Get paginated product list (supports search and sort via query params)
clientProductRouter.get("/", clientController.getProductsPageList);

// Get product detail by ID
clientProductRouter.get("/:id", justDecodeToken, clientController.getProductDetailBySlugId);

// Create a new product listing
clientProductRouter.post("/", verifyToken, verifyRole("seller", "admin"), upload.array("product_images", 10), clientController.postNewProduct);

// Update product description by ID
clientProductRouter.patch("/:id/description", verifyToken, verifyRole("seller", "admin"), clientController.updateProductDescription);

// Get current user's product listings
clientProductRouter.get("/me", verifyToken, clientController.getMyProductsList);

// Get like status for a product
clientProductRouter.get("/:id/likes", justDecodeToken, clientController.getLoveStatus);

// Toggle like status for a product
clientProductRouter.post("/:id/likes", verifyToken, clientController.updateLoveStatus);

// Get questions for a product
clientProductRouter.get("/:id/questions", clientController.getProductQuestions);

// Post a question on a product
clientProductRouter.post("/:id/questions", verifyToken, clientController.postProductQuestion);

// Get winner details for a product
clientProductRouter.get("/:id/winner", verifyToken, clientController.getProductDetailForWinner);

// Get related products for a product
clientProductRouter.get("/:id/related", clientController.getRelatedProducts);

// Admin product routes
adminProductRouter.get("/", adminController.list);
adminProductRouter.get("/count", adminController.calTotalProducts);
adminProductRouter.get("/:id", adminController.detail);
adminProductRouter.patch("/:id/status", adminController.deleteProduct);
adminProductRouter.patch("/:id/restoration", adminController.restoreProduct);
adminProductRouter.delete("/:id", adminController.destroyProduct);
