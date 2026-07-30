import { AsyncLocalStorage } from "node:async_hooks";
import pino, { stdSerializers, stdTimeFunctions, type DestinationStream, type Logger, type LoggerOptions } from "pino";

export interface LogContext {
  component?: string;
  requestId?: string;
  correlationId?: string;
  eventId?: string;
  causationId?: string;
  jobId?: string;
  productId?: string | number;
  topic?: string;
  partition?: number;
  offset?: string;
  consumerGroup?: string;
  attempt?: number;
}

const logContext = new AsyncLocalStorage<Readonly<LogContext>>();

const REDACTED_PATHS = [
  "authorization",
  "cookie",
  "setCookie",
  "password",
  "token",
  "secret",
  "apiKey",
  "email",
  "refreshToken",
  "accessToken",
  "*.authorization",
  "*.cookie",
  "*.setCookie",
  "*.password",
  "*.token",
  "*.secret",
  "*.apiKey",
  "*.email",
  "*.refreshToken",
  "*.accessToken",
  "req.headers.authorization",
  "req.headers.cookie",
  "res.headers.set-cookie",
];

function configuredLevel(): string {
  if (process.env.NODE_ENV === "test" && process.env.LOG_LEVEL === undefined) return "silent";
  return process.env.LOG_LEVEL ?? "info";
}

export function createApplicationLogger(destination?: DestinationStream, overrides: LoggerOptions = {}): Logger {
  const options: LoggerOptions = {
    name: "online-auction-backend",
    level: configuredLevel(),
    timestamp: stdTimeFunctions.isoTime,
    serializers: {
      err: stdSerializers.err,
    },
    redact: {
      paths: REDACTED_PATHS,
      censor: "[REDACTED]",
    },
    mixin: () => logContext.getStore() ?? {},
    ...overrides,
  };
  return destination ? pino(options, destination) : pino(options);
}

export const logger = createApplicationLogger();

export function getLogger(bindings?: LogContext): Logger {
  return bindings ? logger.child(bindings) : logger;
}

export function runWithLogContext<T>(context: LogContext, callback: () => T): T {
  return logContext.run({ ...(logContext.getStore() ?? {}), ...context }, callback);
}

export function currentLogContext(): Readonly<LogContext> {
  return logContext.getStore() ?? {};
}

export function safeError(error: unknown): Error {
  if (error instanceof Error) return error;
  return new Error(typeof error === "string" ? error : "Unknown error");
}

export interface ComponentLogger {
  debug: (...values: unknown[]) => void;
  info: (...values: unknown[]) => void;
  warn: (...values: unknown[]) => void;
  error: (...values: unknown[]) => void;
}

function normalizeLogArguments(values: unknown[]): { fields: Record<string, unknown>; message: string } {
  const [first, ...rest] = values;
  const fields: Record<string, unknown> = {};
  let message = "Application event";

  if (typeof first === "string") message = first;
  else if (first instanceof Error) fields.err = first;
  else if (first && typeof first === "object" && !Array.isArray(first)) Object.assign(fields, first);
  else if (first !== undefined) fields.value = first;

  for (const value of rest) {
    if (value instanceof Error) fields.err = value;
    else if (value && typeof value === "object" && !Array.isArray(value)) Object.assign(fields, value);
    else if (value !== undefined) fields.details = [...(Array.isArray(fields.details) ? fields.details : []), value];
  }
  if (fields.error instanceof Error && fields.err === undefined) {
    fields.err = fields.error;
    delete fields.error;
  }
  return { fields, message };
}

export function createComponentLogger(component: string, baseLogger: Logger = logger): ComponentLogger {
  const componentLogger = baseLogger.child({ component });
  const write = (level: "debug" | "info" | "warn" | "error", values: unknown[]): void => {
    const { fields, message } = normalizeLogArguments(values);
    componentLogger[level](fields, message);
  };
  return {
    debug: (...values) => write("debug", values),
    info: (...values) => write("info", values),
    warn: (...values) => write("warn", values),
    error: (...values) => write("error", values),
  };
}
