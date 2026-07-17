import type { NextFunction, Request, Response } from "express";
import type Joi from "joi";

export type ValidationTarget = "body" | "query" | "params";
export type ValidatedInputs = Partial<Record<ValidationTarget, unknown>>;

declare global {
  namespace Express {
    interface Locals { validated?: ValidatedInputs; }
  }
}

export function validate(schema: Joi.ObjectSchema, target: ValidationTarget) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req[target], {
      abortEarly: false,
      allowUnknown: true,
      convert: true,
      stripUnknown: false,
    });
    if (error) {
      res.status(400).json({ status: "error", message: error.details[0]?.message ?? "Invalid request" });
      return;
    }
    res.locals.validated = { ...res.locals.validated, [target]: value };
    next();
  };
}
