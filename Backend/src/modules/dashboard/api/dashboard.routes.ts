import { Router } from "express";
import * as dashboardController from "./dashboard.controller.ts";

export const adminDashboardRouter = Router();

// Get admin dashboard summary data
adminDashboardRouter.get("/", dashboardController.getSummary);

// Request immediate recalculation of metrics cache
adminDashboardRouter.post("/sync", dashboardController.syncCache);
