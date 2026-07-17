import express from "express";
const route = express.Router();

import accountRoutes from "@/modules/accounts/api/accounts.routes.ts";
import { clientCategoryRouter as categoriesRoutes } from "@/modules/categories/api/categories.routes.ts";
import { clientProductRouter as productsRoutes } from "@/modules/products/api/products.routes.ts";
import { profileRouter as profileRoutes } from "@/modules/profiles/profiles.routes.ts";
import bidRoutes from "@/modules/bids/api/bids.routes.ts";
import { clientUserRouter as userRoutes } from "@/modules/users/users.routes.ts";
import settingRoutes from "@/modules/settings/settings.routes.ts";
import orderRoutes from "@/modules/orders/api/orders.routes.ts";

import { verifyToken } from "../../middlewares/auth.middleware.ts";

route.use("/accounts", accountRoutes);

route.use("/categories", categoriesRoutes);

route.use("/products", productsRoutes);

route.use("/profiles", profileRoutes);

route.use("/bids", verifyToken, bidRoutes);

route.use("/users", userRoutes);

route.use("/settings", settingRoutes);

route.use("/orders", verifyToken, orderRoutes);

export default route;
