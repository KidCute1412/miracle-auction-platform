import express from "express";
import { adminCategoryRouter as categoryRoute } from "@/modules/categories/api/categories.routes.ts";
import {
  adminApplicationRouter as applicationFormRoute,
  adminUserRouter as userRoute,
} from "@/modules/users/users.routes.ts";
import { adminProductRouter as productRoute } from "@/modules/products/products.routes.ts";
import { adminDashboardRouter as dashboardRoute } from "@/modules/dashboard/api/dashboard.routes.ts";
import * as authMiddleware from "../../middlewares/auth.middleware.ts";

const route = express.Router();

route.use("/dashboard", authMiddleware.verifyToken, authMiddleware.verifyRole("admin"), dashboardRoute);

route.use("/categories", authMiddleware.verifyToken, authMiddleware.verifyRole("admin"), categoryRoute);

route.use(
  "/seller-registrations",
  authMiddleware.verifyToken,
  authMiddleware.verifyRole("admin"),
  applicationFormRoute,
);

route.use("/users", authMiddleware.verifyToken, authMiddleware.verifyRole("admin"), userRoute);

route.use("/products", authMiddleware.verifyToken, authMiddleware.verifyRole("admin"), productRoute);

export default route;
