import type { NextFunction, Request, Response } from "express";
import { AppError } from "../shared/errors.js";
import { logger } from "../shared/logger.js";
import type { ApiFailure } from "./response.js";

export const createErrorMiddleware =
  (isProduction: boolean) =>
  (error: unknown, req: Request, res: Response, _next: NextFunction): void => {
    const appError =
      error instanceof AppError
        ? error
        : new AppError(500, "INTERNAL_ERROR", error instanceof Error ? error.message : "Internal error");

    logger.error("request failed", {
      requestId: req.requestId,
      code: appError.code,
      message: appError.message,
      path: req.path,
    });

    const payload: ApiFailure = {
      success: false,
      error: {
        code: appError.code,
        message: appError.statusCode >= 500 && isProduction ? "Internal error" : appError.message,
        requestId: req.requestId,
        details: appError.details,
      },
    };
    res.status(appError.statusCode).json(payload);
  };
