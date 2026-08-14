import Joi from "joi";

const ranges = ["7d", "30d", "3m", "6m", "1y"];
export const summaryQuerySchema = Joi.object({ range: Joi.string().valid(...ranges).default("6m") });
export const reconciliationQuerySchema = Joi.object({
  productId: Joi.number().integer().positive().max(2_147_483_647).required(),
});
export const paginationQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  kind: Joi.string().valid("dashboard", "notification", "outbox"),
});
export const dlqKindQuerySchema = Joi.object({
  kind: Joi.string().valid("dashboard", "notification", "outbox").default("dashboard"),
});
export const eventIdParamsSchema = Joi.object({ eventId: Joi.string().uuid({ version: ["uuidv4"] }).required() });
export const auditQuerySchema = paginationQuerySchema.keys({
  actorId: Joi.number().integer().positive(),
  action: Joi.string().trim().max(100),
  resourceType: Joi.string().trim().max(100),
  result: Joi.string().valid("success", "failed", "denied"),
  from: Joi.date().iso(),
  to: Joi.date().iso().min(Joi.ref("from")),
});
export const exportQuerySchema = Joi.object({
  dataset: Joi.string().valid("analytics", "audit").required(),
  range: Joi.string().valid(...ranges).default("6m"),
  actorId: Joi.number().integer().positive(),
  action: Joi.string().trim().max(100),
  resourceType: Joi.string().trim().max(100),
  result: Joi.string().valid("success", "failed", "denied"),
  from: Joi.date().iso(),
  to: Joi.date().iso().min(Joi.ref("from")),
});
