import { Writable } from "node:stream";
import { describe, expect, it } from "vitest";
import {
  createApplicationLogger,
  createComponentLogger,
  runWithLogContext,
} from "../../../src/infrastructure/observability/logger.ts";

class MemoryDestination extends Writable {
  readonly lines: string[] = [];

  override _write(chunk: Buffer, _encoding: BufferEncoding, callback: (error?: Error | null) => void): void {
    this.lines.push(...chunk.toString().split("\n").filter(Boolean));
    callback();
  }

  records(): Array<Record<string, unknown>> {
    return this.lines.map((line) => JSON.parse(line) as Record<string, unknown>);
  }
}

describe("structured application logger", () => {
  it("emits JSON with context, safe errors, and redacted secrets", () => {
    const destination = new MemoryDestination();
    const testLogger = createApplicationLogger(destination, { level: "info" });

    runWithLogContext(
      {
        requestId: "5fdf0726-ecbb-45f1-8559-e07751f8a725",
        correlationId: "5fdf0726-ecbb-45f1-8559-e07751f8a725",
      },
      () => {
        testLogger.error(
          {
            err: new Error("delivery failed"),
            password: "plain-text",
            email: "person@example.com",
            nested: { token: "access-token" },
          },
          "Operation failed",
        );
      },
    );

    const [record] = destination.records();
    expect(record).toMatchObject({
      level: 50,
      msg: "Operation failed",
      requestId: "5fdf0726-ecbb-45f1-8559-e07751f8a725",
      correlationId: "5fdf0726-ecbb-45f1-8559-e07751f8a725",
      password: "[REDACTED]",
      email: "[REDACTED]",
      nested: { token: "[REDACTED]" },
      err: { type: "Error", message: "delivery failed" },
    });
    expect(record?.time).toEqual(expect.any(String));
  });

  it("isolates concurrent asynchronous contexts", async () => {
    const destination = new MemoryDestination();
    const testLogger = createApplicationLogger(destination, { level: "info" });

    await Promise.all([
      runWithLogContext({ correlationId: "first" }, async () => {
        await Promise.resolve();
        testLogger.info("first event");
      }),
      runWithLogContext({ correlationId: "second" }, async () => {
        await Promise.resolve();
        testLogger.info("second event");
      }),
    ]);

    const records = destination.records();
    expect(records.find((record) => record.msg === "first event")?.correlationId).toBe("first");
    expect(records.find((record) => record.msg === "second event")?.correlationId).toBe("second");
  });

  it("normalizes component arguments and serializes nested errors safely", () => {
    const destination = new MemoryDestination();
    const testLogger = createApplicationLogger(destination, { level: "info" });
    const componentLogger = createComponentLogger("email-delivery", testLogger);

    componentLogger.error("Delivery failed", {
      error: new Error("SMTP unavailable"),
      email: "person@example.com",
      attempt: 2,
    });

    expect(destination.records()[0]).toMatchObject({
      component: "email-delivery",
      msg: "Delivery failed",
      email: "[REDACTED]",
      attempt: 2,
      err: { type: "Error", message: "SMTP unavailable" },
    });
  });
});
