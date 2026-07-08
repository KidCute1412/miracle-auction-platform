import type { NextFunction, Request, Response } from "express";
import type Joi from "joi";
import { AppError } from "../shared/errors.js";

export const validate =
  (schema: Joi.ObjectSchema, source: "body" | "params") =>
  (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.validate(req[source], {
      abortEarly: false,
      stripUnknown: true,
      convert: true,
    });

    if (result.error) {
      next(
        new AppError(
          400,
          "VALIDATION_ERROR",
          "Request validation failed",
          result.error.details.map((detail) => detail.message),
        ),
      );
      return;
    }

    req[source] = result.value as typeof req[typeof source];
    next();
  };
