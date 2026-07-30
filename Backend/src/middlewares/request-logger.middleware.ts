import type { Request, Response, NextFunction } from "express";

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  // Skip health/readiness polling noise from verbose logs
  if (req.path === "/health" || req.path === "/ready") {
    return next();
  }
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    const reqId = req.header("x-request-id") ?? "-";
    console.log(`[HTTP] ${req.method} ${req.originalUrl || req.url} ${res.statusCode} ${duration}ms [req:${reqId}]`);
  });
  next();
}
