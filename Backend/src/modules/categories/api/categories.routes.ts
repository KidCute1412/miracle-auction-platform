import { Router } from "express";
import * as clientController from "./categories.client.controller.ts";
import * as adminController from "./categories.admin.controller.ts";

export const clientCategoryRouter = Router();
export const adminCategoryRouter = Router();

// Client routes
clientCategoryRouter.get("/level/1", clientController.getAllCategoriesLv1);
clientCategoryRouter.get("/level/2", clientController.getAllCategoriesLv2);
clientCategoryRouter.get("/level/2/:id", clientController.getCategoryLv2ById);
clientCategoryRouter.get("/", clientController.getAll);

// Admin routes
adminCategoryRouter.get("/tree", adminController.buildTree);
adminCategoryRouter.get("/count", adminController.calTotalCategories);
adminCategoryRouter.get("/creators", adminController.getCreators);
adminCategoryRouter.get("/", adminController.list);
adminCategoryRouter.get("/:id", adminController.edit);
adminCategoryRouter.post("/", adminController.createPost);
adminCategoryRouter.patch("/:id", adminController.editPatch);
adminCategoryRouter.patch("/:id/status", adminController.deleteCategory);
adminCategoryRouter.patch("/:id/restoration", adminController.restoreCategory);
adminCategoryRouter.delete("/:id", adminController.destroyCategory);
