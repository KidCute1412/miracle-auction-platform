import type { AgentServiceConfig } from "../config/env.js";
import type { ProjectConfig } from "../shared/types.js";
import { CommandRunner } from "../sandbox/commandRunner.js";
import { CliProviderAdapter, type CommandAuditHook } from "./cliProviderAdapter.js";
import type { AgentProviderAdapter } from "./provider.types.js";
import type { CommandInput, CommandResult } from "../sandbox/commandRunner.js";

export class ProviderRegistry {
  private readonly providers: Map<string, AgentProviderAdapter>;

  public constructor(providers: AgentProviderAdapter[]) {
    this.providers = new Map(providers.map((provider) => [provider.name, provider]));
  }

  public get(name: string): AgentProviderAdapter {
    const provider = this.providers.get(name);
    if (!provider) {
      throw new Error(`Unknown provider: ${name}`);
    }
    return provider;
  }
}

export interface ProviderRuntimeHooks {
  auditHook?: CommandAuditHook;
  onCommandStart?: (input: CommandInput, pid: number) => Promise<void> | void;
  onCommandOutput?: (input: CommandInput, stream: "stdout" | "stderr", chunk: string) => Promise<void> | void;
  onCommandFinish?: (input: CommandInput, result: CommandResult) => Promise<void> | void;
}

export const createProviderRegistry = (
  config: AgentServiceConfig,
  projectConfig?: ProjectConfig,
  hooks: ProviderRuntimeHooks = {},
): ProviderRegistry => {
  const runner = new CommandRunner({
    timeoutMs: config.commandTimeoutMs,
    maxOutputBytes: config.maxOutputBytes,
    onStart: hooks.onCommandStart,
    onOutput: hooks.onCommandOutput,
    onFinish: hooks.onCommandFinish,
  });

  const antigravity = projectConfig?.providers.antigravity;
  const codex = projectConfig?.providers.codex;

  return new ProviderRegistry([
    new CliProviderAdapter(
      {
        name: "antigravity",
        executable: config.providerPaths.antigravity ?? antigravity?.command ?? null,
        capabilities: antigravity?.capabilities ?? ["planner"],
        baseArgs: antigravity?.args ?? ["run", "--stdin"],
        displayChannel: "Antigravity",
      },
      runner,
      hooks.auditHook,
    ),
    new CliProviderAdapter(
      {
        name: "codex",
        executable: codex?.command ?? config.providerPaths.codex,
        capabilities: codex?.capabilities ?? ["coder", "implementer", "tester", "reviewer"],
        baseArgs: codex?.args ?? ["exec", "--skip-git-repo-check", "-"],
        displayChannel: "Codex",
      },
      runner,
      hooks.auditHook,
    ),
  ]);
};
