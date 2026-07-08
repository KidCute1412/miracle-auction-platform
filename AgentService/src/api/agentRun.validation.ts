import Joi from "joi";

const providerSchema = Joi.object({
  planner: Joi.string().valid("antigravity", "codex").optional(),
  implementer: Joi.string().valid("codex").optional(),
  tester: Joi.string().valid("codex").optional(),
  reviewer: Joi.string().valid("codex").optional(),
}).optional();

const tokenBudgetsSchema = Joi.object({
  planner: Joi.number().integer().min(1000).max(50000).optional(),
  implementer: Joi.number().integer().min(1000).max(50000).optional(),
  tester: Joi.number().integer().min(1000).max(50000).optional(),
  reviewer: Joi.number().integer().min(1000).max(50000).optional(),
}).optional();

export const createRunSchema = Joi.object({
  task: Joi.string().trim().min(10).max(20000).required(),
  providerMapping: providerSchema,
  tokenBudgets: tokenBudgetsSchema,
});

export const runIdParamSchema = Joi.object({
  id: Joi.string().uuid().required(),
});

export const approveRunSchema = Joi.object({
  reviewer: Joi.string().trim().min(1).max(120).default("human"),
  note: Joi.string().trim().max(2000).allow("").default(""),
});
