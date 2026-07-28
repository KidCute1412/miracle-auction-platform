import Joi from "joi";
import { Request, Response, NextFunction } from "express";

export const getProductsQuerySchema = Joi.object({
  cat1_id: Joi.number().integer().positive().optional(),
  cat2_id: Joi.number().integer().positive().optional(),
  search: Joi.string().trim().max(100).allow("").optional(),
  min_price: Joi.number().min(0).optional(),
  max_price: Joi.number().min(0).optional(),
  status: Joi.string().valid("active", "buy_now", "ended", "all").default("active").optional(),
  sort_by: Joi.string().valid("relevance", "price_asc", "price_desc", "time_asc", "time_desc", "created_desc", "bids_desc").optional(),
  page: Joi.number().integer().min(1).default(1).optional(),
  limit: Joi.number().integer().min(1).max(50).default(6).optional(),
  // Legacy backward compatibility params
  price: Joi.string().allow("").optional(),
  time: Joi.string().allow("").optional(),
  query: Joi.string().allow("").optional(),
});

export function validateGetProductsQuery(req: Request, res: Response, next: NextFunction) {
  const { error, value } = getProductsQuerySchema.validate(req.query || {}, { stripUnknown: true });
  if (error) {
    return res.status(400).json({
      status: "error",
      message: "Invalid query parameters",
      details: error.details.map((d) => d.message),
    });
  }
  // Mutate req.query properties safely without reassigning getter in Express 5
  if (req.query) {
    for (const key of Object.keys(req.query)) {
      delete (req.query as Record<string, unknown>)[key];
    }
    Object.assign(req.query, value);
  }
  next();
}
