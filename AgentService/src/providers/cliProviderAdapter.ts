import { AppError } from "../shared/errors.js";
import type { CommandExecutor, CommandResult } from "../sandbox/commandRunner.js";
import type { AgentCapability } from "../shared/types.js";
import type { AgentProviderAdapter, AgentProviderInput, AgentProviderResult } from "./provider.types.js";
import { logger } from "../shared/logger.js";

export interface CliProviderConfig {
  name: string;
  executable: string | null;
  capabilities: readonly AgentCapability[];
  baseArgs: readonly string[];
  displayChannel?: string;
}

export type CommandAuditHook = (input: AgentProviderInput, result: CommandResult) => Promise<void>;

export class CliProviderAdapter implements AgentProviderAdapter {
  public readonly name: string;
  public readonly capabilities: readonly AgentCapability[];

  public constructor(
    private readonly config: CliProviderConfig,
    private readonly runner: CommandExecutor,
    private readonly auditHook?: CommandAuditHook,
  ) {
    this.name = config.name;
    this.capabilities = config.capabilities;
  }

  public async validateAvailability(): Promise<void> {
    if (!this.config.executable) {
      throw new AppError(503, "PROVIDER_UNAVAILABLE", `${this.name} CLI path is not configured`);
    }

    const result = await this.runner.run({
      executable: this.config.executable,
      args: ["--version"],
      cwd: process.cwd(),
    });

    if (result.exitCode !== 0) {
      throw new AppError(502, "PROVIDER_UNAVAILABLE", `${this.name} CLI is not available`);
    }
  }

  public async run(input: AgentProviderInput): Promise<AgentProviderResult> {
    if (!this.config.executable) {
      throw new AppError(503, "PROVIDER_UNAVAILABLE", `${this.name} CLI path is not configured`);
    }
    if (!this.capabilities.includes(input.step)) {
      throw new AppError(503, "PROVIDER_UNAVAILABLE", `${this.name} cannot run ${input.step}`);
    }

    logger.info(`starting provider command: ${this.name} (${input.step})`, {
      runId: input.runId,
      step: input.step,
      executable: this.config.executable,
      args: this.config.baseArgs,
    });

    const result = await this.runner.run({
      executable: this.config.executable,
      args: [...this.config.baseArgs],
      cwd: input.workspacePath,
      stdin: input.prompt,
      runId: input.runId,
      stepId: input.stepId,
      agentId: input.agentId,
      channel: input.displayChannel || this.config.displayChannel || this.name,
      env: {
        AGENT_RUN_ID: input.runId,
        AGENT_STEP: input.step,
        AGENT_ID: input.agentId,
        AGENT_DISPLAY_CHANNEL: input.displayChannel || this.config.displayChannel || this.name,
        AGENT_TOKEN_BUDGET: String(input.tokenBudget),
      },
    });
    await this.auditHook?.(input, result);

    if (result.timedOut) {
      throw new AppError(504, "TIMEOUT", `${this.name} timed out`);
    }
    if (result.exitCode !== 0) {
      throw new AppError(502, "COMMAND_FAILED", `${this.name} command failed`, {
        exitCode: result.exitCode,
        stderr: result.stderr.slice(0, 2000),
      });
    }

    return {
      text: result.stdout.trim() || result.stderr.trim(),
      exitCode: result.exitCode,
      durationMs: result.durationMs,
    };
  }
}
