import Joi from "joi";

export const winnerCheckoutSchema = Joi.object({
  public_order_id: Joi.string().uuid({ version: ["uuidv4"] }).required(),
  shipping_address: Joi.string().trim().max(500).required(),
  phone_number: Joi.string().trim().max(30).required(),
});
export const orderIdParamsSchema = Joi.object({ id: Joi.number().integer().positive().required() });
export const orderProductQuerySchema = Joi.object({ product_id: Joi.number().integer().positive().required() });
export const rejectionSchema = Joi.object({ reason: Joi.string().trim().min(3).max(500).required() });
