import { Router } from "express";
import { validate } from "@/middlewares/validate.middleware.ts";
import * as dashboardController from "./dashboard.controller.ts";
import {
  eventIdParamsSchema,
  dlqKindQuerySchema,
  exportQuerySchema,
  paginationQuerySchema,
  reconciliationQuerySchema,
  summaryQuerySchema,
} from "./dashboard.schemas.ts";

export const adminDashboardRouter = Router();
adminDashboardRouter.get("/", validate(summaryQuerySchema, "query"), dashboardController.getSummary);
adminDashboardRouter.post("/sync", dashboardController.syncCache);
adminDashboardRouter.get("/operations", dashboardController.getOperations);
adminDashboardRouter.get(
  "/operations/reconciliation",
  validate(reconciliationQuerySchema, "query"),
  dashboardController.getAuctionReconciliation,
);
adminDashboardRouter.get("/dlq", validate(paginationQuerySchema, "query"), dashboardController.getDlq);
adminDashboardRouter.post(
  "/dlq/:eventId/retry",
  validate(eventIdParamsSchema, "params"),
  validate(dlqKindQuerySchema, "query"),
  dashboardController.retryDlq,
);
adminDashboardRouter.get("/export.csv", validate(exportQuerySchema, "query"), dashboardController.exportCsv);
