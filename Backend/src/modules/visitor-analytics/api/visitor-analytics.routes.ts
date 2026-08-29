import { Router } from "express";
import { validate } from "@/middlewares/validate.middleware.ts";
import { justDecodeToken } from "@/middlewares/auth.middleware.ts";
import { getFacets, getSession, getSessionEvents, listSessions, recordEvent } from "./visitor-analytics.controller.ts";
import { recordVisitorEventBodySchema, sessionEventsQuerySchema, sessionParamsSchema, visitorSessionsQuerySchema } from "./visitor-analytics.schemas.ts";

export const publicVisitorAnalyticsRouter = Router();
publicVisitorAnalyticsRouter.post("/events", justDecodeToken, validate(recordVisitorEventBodySchema, "body"), recordEvent);

export const adminVisitorAnalyticsRouter = Router();
adminVisitorAnalyticsRouter.get("/sessions", validate(visitorSessionsQuerySchema, "query"), listSessions);
adminVisitorAnalyticsRouter.get("/facets", getFacets);
adminVisitorAnalyticsRouter.get("/sessions/:sessionId", validate(sessionParamsSchema, "params"), getSession);
adminVisitorAnalyticsRouter.get("/sessions/:sessionId/events", validate(sessionParamsSchema, "params"), validate(sessionEventsQuerySchema, "query"), getSessionEvents);
