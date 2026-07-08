import type { AgentErrorCode } from "./types.js";

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: AgentErrorCode;
  public readonly details?: unknown;
  public readonly isOperational = true;

  public constructor(statusCode: number, code: AgentErrorCode, message: string, details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export const notFound = (message: string): AppError => new AppError(404, "RUN_NOT_FOUND", message);

export const invalidState = (message: string): AppError => new AppError(409, "INVALID_STATE", message);
