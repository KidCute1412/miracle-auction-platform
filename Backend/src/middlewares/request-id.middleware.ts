import { randomUUID } from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import { runWithLogContext } from "@/infrastructure/observability/logger.ts";

export function requestId(req: Request, res: Response, next: NextFunction): void {
  const candidate = req.header("x-request-id");
  const value =
    candidate && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(candidate)
      ? candidate
      : randomUUID();
  req.requestId = value;
  req.headers["x-request-id"] = value;
  res.setHeader("X-Request-ID", value);
  runWithLogContext({ requestId: value, correlationId: value }, next);
}
