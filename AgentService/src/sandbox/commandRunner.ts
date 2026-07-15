import { spawn } from "node:child_process";
import { redactSecrets } from "./secretRedactor.js";

export interface CommandRunnerOptions {
  timeoutMs: number;
  maxOutputBytes: number;
  onStart?: (input: CommandInput, pid: number) => Promise<void> | void;
  onOutput?: (input: CommandInput, stream: "stdout" | "stderr", chunk: string) => Promise<void> | void;
  onFinish?: (input: CommandInput, result: CommandResult) => Promise<void> | void;
}

export interface CommandInput {
  executable: string;
  args: string[];
  cwd: string;
  stdin?: string;
  env?: Record<string, string>;
  runId?: string;
  stepId?: string;
  agentId?: string;
  channel?: string;
}

export interface CommandResult {
  executable: string;
  args: string[];
  cwd: string;
  pid: number | null;
  exitCode: number | null;
  stdout: string;
  stderr: string;
  durationMs: number;
  timedOut: boolean;
}

export interface CommandExecutor {
  run(input: CommandInput): Promise<CommandResult>;
}

const appendCapped = (current: string, chunk: Buffer, maxBytes: number): string => {
  const combined = Buffer.concat([Buffer.from(current), chunk]);
  if (combined.byteLength <= maxBytes) {
    return combined.toString("utf8");
  }
  return combined.subarray(0, maxBytes).toString("utf8");
};

const runOptionalHook = (hook: (() => Promise<void> | void) | undefined): void => {
  if (!hook) {
    return;
  }

  try {
    const result = hook();
    if (result instanceof Promise) {
      result.catch((error: unknown) => {
        process.stderr.write(
          `[command-runner hook error]: ${error instanceof Error ? error.message : "Unknown hook error"}\n`,
        );
      });
    }
  } catch (error) {
    process.stderr.write(`[command-runner hook error]: ${error instanceof Error ? error.message : "Unknown hook error"}\n`);
  }
};

export class CommandRunner implements CommandExecutor {
  public constructor(private readonly options: CommandRunnerOptions) {}

  public run(input: CommandInput): Promise<CommandResult> {
    const startedAt = Date.now();

    return new Promise((resolve) => {
      const useShell = process.platform === "win32" && 
        !input.executable.endsWith(".exe") && 
        input.executable !== process.execPath;

      const child = spawn(input.executable, input.args, {
        cwd: input.cwd,
        env: { ...process.env, ...input.env },
        shell: useShell,
        windowsHide: true,
      });

      let stdout = "";
      let stderr = "";
      let timedOut = false;
      runOptionalHook(() => this.options.onStart?.(input, child.pid ?? 0));

      const finish = (result: CommandResult): void => {
        runOptionalHook(() => this.options.onFinish?.(input, result));
        resolve(result);
      };

      child.stdin.on("error", () => {});
      child.stdout.on("error", () => {});
      child.stderr.on("error", () => {});

      const timeout = setTimeout(() => {
        timedOut = true;
        child.kill("SIGTERM");
      }, this.options.timeoutMs);

      child.stdout.on("data", (chunk: Buffer) => {
        stdout = appendCapped(stdout, chunk, this.options.maxOutputBytes);
        runOptionalHook(() => this.options.onOutput?.(input, "stdout", redactSecrets(chunk.toString("utf8"))));
        process.stdout.write(`[stdout]: ${chunk}`);
      });

      child.stderr.on("data", (chunk: Buffer) => {
        stderr = appendCapped(stderr, chunk, this.options.maxOutputBytes);
        runOptionalHook(() => this.options.onOutput?.(input, "stderr", redactSecrets(chunk.toString("utf8"))));
        process.stderr.write(`[stderr]: ${chunk}`);
      });

      child.on("error", (error: Error) => {
        clearTimeout(timeout);
        finish({
          executable: input.executable,
          args: input.args,
          cwd: input.cwd,
          pid: child.pid ?? null,
          exitCode: null,
          stdout: redactSecrets(stdout),
          stderr: redactSecrets(`${stderr}\n${error.message}`.trim()),
          durationMs: Date.now() - startedAt,
          timedOut,
        });
      });

      child.on("close", (exitCode: number | null) => {
        clearTimeout(timeout);
        finish({
          executable: input.executable,
          args: input.args,
          cwd: input.cwd,
          pid: child.pid ?? null,
          exitCode,
          stdout: redactSecrets(stdout),
          stderr: redactSecrets(stderr),
          durationMs: Date.now() - startedAt,
          timedOut,
        });
      });

      if (input.stdin) {
        child.stdin.write(input.stdin);
      }
      child.stdin.end();
    });
  }
}
