import type { Request, Response, NextFunction } from "express";
import { getLogger } from "@/infrastructure/observability/logger.ts";

const log = getLogger({ component: "http" });

interface HttpLogger {
  info(fields: Record<string, unknown>, message: string): void;
}

export function createRequestLogger(httpLogger: HttpLogger = log) {
  return function logRequest(req: Request, res: Response, next: NextFunction): void {
    const start = Date.now();
    res.on("finish", () => {
      const isProbe = req.path === "/health" || req.path === "/ready";
      if (isProbe && res.statusCode < 400) return;
      httpLogger.info(
        {
          method: req.method,
          path: req.path,
          statusCode: res.statusCode,
          durationMs: Date.now() - start,
        },
        "HTTP request completed",
      );
    });
    next();
  };
}

export const requestLogger = createRequestLogger();
