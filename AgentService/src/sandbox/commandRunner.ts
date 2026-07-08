import { spawn } from "node:child_process";
import { redactSecrets } from "./secretRedactor.js";

export interface CommandRunnerOptions {
  timeoutMs: number;
  maxOutputBytes: number;
}

export interface CommandInput {
  executable: string;
  args: string[];
  cwd: string;
  stdin?: string;
  env?: Record<string, string>;
}

export interface CommandResult {
  executable: string;
  args: string[];
  cwd: string;
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

export class CommandRunner implements CommandExecutor {
  public constructor(private readonly options: CommandRunnerOptions) {}

  public run(input: CommandInput): Promise<CommandResult> {
    const startedAt = Date.now();

    return new Promise((resolve) => {
      const child = spawn(input.executable, input.args, {
        cwd: input.cwd,
        env: { ...process.env, ...input.env },
        shell: false,
        windowsHide: true,
      });

      let stdout = "";
      let stderr = "";
      let timedOut = false;

      const timeout = setTimeout(() => {
        timedOut = true;
        child.kill("SIGTERM");
      }, this.options.timeoutMs);

      child.stdout.on("data", (chunk: Buffer) => {
        stdout = appendCapped(stdout, chunk, this.options.maxOutputBytes);
      });

      child.stderr.on("data", (chunk: Buffer) => {
        stderr = appendCapped(stderr, chunk, this.options.maxOutputBytes);
      });

      child.on("error", (error: Error) => {
        clearTimeout(timeout);
        resolve({
          executable: input.executable,
          args: input.args,
          cwd: input.cwd,
          exitCode: null,
          stdout: redactSecrets(stdout),
          stderr: redactSecrets(`${stderr}\n${error.message}`.trim()),
          durationMs: Date.now() - startedAt,
          timedOut,
        });
      });

      child.on("close", (exitCode: number | null) => {
        clearTimeout(timeout);
        resolve({
          executable: input.executable,
          args: input.args,
          cwd: input.cwd,
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
