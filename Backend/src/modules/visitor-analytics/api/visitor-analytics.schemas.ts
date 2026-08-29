import Joi from "joi";

export const visitorEventTypes = [
  "page_view", "product_view", "search_submitted", "favorite_toggled",
  "auth_started", "registration_started", "bid_started",
] as const;

const eventMetadataSchema = Joi.object({
  productId: Joi.alternatives().try(Joi.string().max(64), Joi.number().integer().positive()),
  query: Joi.string().trim().max(200),
  active: Joi.boolean(),
  method: Joi.string().valid("email", "google"),
}).max(3).default({});

export const recordVisitorEventBodySchema = Joi.object({
  sessionId: Joi.string().uuid({ version: ["uuidv4"] }).required(),
  visitorId: Joi.string().uuid({ version: ["uuidv4"] }).required(),
  eventType: Joi.string().valid(...visitorEventTypes).default("page_view"),
  path: Joi.string().trim().max(2048).pattern(/^\//).required(),
  pageTitle: Joi.string().trim().max(500).allow("", null),
  referrer: Joi.string().uri({ allowRelative: false }).max(2048).allow("", null),
  timezone: Joi.string().trim().max(100).allow("", null),
  language: Joi.string().trim().max(50).allow("", null),
  screenWidth: Joi.number().integer().min(1).max(20000).allow(null),
  screenHeight: Joi.number().integer().min(1).max(20000).allow(null),
  metadata: eventMetadataSchema,
});

export const visitorSessionsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().valid(25, 50, 100).default(25),
  search: Joi.string().trim().max(200).allow(""),
  range: Joi.string().valid("24h", "7d", "30d", "90d", "custom").default("7d"),
  countryCode: Joi.string().trim().uppercase().max(8),
  region: Joi.string().trim().max(100),
  city: Joi.string().trim().max(100),
  authenticated: Joi.boolean(),
  eventType: Joi.string().valid(...visitorEventTypes),
  risk: Joi.string().valid("anonymous", "hosting", "mobile"),
  sort: Joi.string().valid("last_seen_desc", "first_seen_desc", "duration_desc", "events_desc").default("last_seen_desc"),
  from: Joi.date().iso().when("range", { is: "custom", then: Joi.required() }),
  to: Joi.date().iso().min(Joi.ref("from")).when("range", { is: "custom", then: Joi.required() }),
});

export const sessionParamsSchema = Joi.object({
  sessionId: Joi.string().uuid({ version: ["uuidv4"] }).required(),
});

export const sessionEventsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(50),
});
