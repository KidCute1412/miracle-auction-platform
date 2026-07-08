import type { Response } from "express";

export interface ApiSuccess<T> {
  success: true;
  data: T;
  meta?: Record<string, unknown>;
}

export interface ApiFailure {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
    requestId: string;
  };
}

export const sendSuccess = <T>(res: Response, data: T, statusCode = 200, meta?: Record<string, unknown>): void => {
  const payload: ApiSuccess<T> = meta ? { success: true, data, meta } : { success: true, data };
  res.status(statusCode).json(payload);
};
