type LogLevel = "info" | "warn" | "error";

interface LogFields {
  requestId?: string;
  runId?: string;
  step?: string;
  [key: string]: unknown;
}

const write = (level: LogLevel, message: string, fields: LogFields = {}): void => {
  const record = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...fields,
  };
  const line = JSON.stringify(record);
  if (level === "error") {
    process.stderr.write(`${line}\n`);
    return;
  }
  process.stdout.write(`${line}\n`);
};

export const logger = {
  info: (message: string, fields?: LogFields): void => write("info", message, fields),
  warn: (message: string, fields?: LogFields): void => write("warn", message, fields),
  error: (message: string, fields?: LogFields): void => write("error", message, fields),
};
