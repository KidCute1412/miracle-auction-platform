import { Router } from "express";
import { validate } from "@/middlewares/validate.middleware.ts";
import { getAuditLogs } from "./dashboard.controller.ts";
import { auditQuerySchema } from "./dashboard.schemas.ts";

export const adminAuditRouter = Router();
adminAuditRouter.get("/", validate(auditQuerySchema, "query"), getAuditLogs);
