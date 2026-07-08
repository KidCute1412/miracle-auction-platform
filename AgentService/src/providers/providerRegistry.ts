import type { AgentServiceConfig } from "../config/env.js";
import { CommandRunner } from "../sandbox/commandRunner.js";
import { CliProviderAdapter, type CommandAuditHook } from "./cliProviderAdapter.js";
import type { AgentProviderAdapter } from "./provider.types.js";

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

export const createProviderRegistry = (config: AgentServiceConfig, auditHook?: CommandAuditHook): ProviderRegistry => {
  const runner = new CommandRunner({
    timeoutMs: config.commandTimeoutMs,
    maxOutputBytes: config.maxOutputBytes,
  });

  return new ProviderRegistry([
    new CliProviderAdapter(
      {
        name: "antigravity",
        executable: config.providerPaths.antigravity,
        capabilities: ["planner"],
        baseArgs: ["run", "--stdin"],
      },
      runner,
      auditHook,
    ),
    new CliProviderAdapter(
      {
        name: "codex",
        executable: config.providerPaths.codex,
        capabilities: ["implementer", "tester", "reviewer"],
        baseArgs: ["exec", "--stdin"],
      },
      runner,
      auditHook,
    ),
  ]);
};
