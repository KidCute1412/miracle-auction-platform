import Joi from "joi";

const positiveId = Joi.number().integer().positive().required();
const money = Joi.number().positive().required();

export const bidBodySchema = Joi.object({
  product_id: positiveId,
  max_price: money,
  // Accepted for the existing frontend contract, but not used by the backend.
  bid_price: Joi.number().positive().optional(),
});

export const buyNowBodySchema = Joi.object({ product_id: positiveId, buy_price: money });
export const bidHistoryQuerySchema = Joi.object({ product_id: positiveId });
export const banBidderBodySchema = Joi.object({
  product_id: positiveId,
  banned_user_id: positiveId,
  reason: Joi.string().trim().max(2000).required(),
});
