import Joi from "joi";

export const winnerCheckoutSchema = Joi.object({
  public_order_id: Joi.string().uuid({ version: ["uuidv4"] }).required(),
  shipping_address: Joi.string().trim().max(500).required(),
  phone_number: Joi.string().trim().max(30).required(),
});
