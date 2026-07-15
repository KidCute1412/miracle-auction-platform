import fs from "node:fs";
import path from "node:path";
import type { AgentCapability, ProjectConfig, ProjectProviderConfig } from "../shared/types.js";

const defaultConfigName = ".agentservice.json";

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
};

const readString = (value: unknown, fallback: string): string => {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
};

const readStringArray = (value: unknown, fallback: string[]): string[] => {
  return Array.isArray(value) && value.every((item) => typeof item === "string") ? value : fallback;
};

const readCapabilities = (value: unknown, fallback: AgentCapability[]): AgentCapability[] => {
  const allowed = new Set<AgentCapability>(["planner", "coder", "implementer", "tester", "reviewer"]);
  if (!Array.isArray(value)) {
    return fallback;
  }
  const capabilities = value.filter((item): item is AgentCapability => typeof item === "string" && allowed.has(item as AgentCapability));
  return capabilities.length > 0 ? capabilities : fallback;
};

const resolveCommandOnWindows = (command: string): string => {
  if (process.platform !== "win32" || path.extname(command)) {
    return command;
  }

  const pathEntries = (process.env.PATH ?? "").split(path.delimiter);
  for (const entry of pathEntries) {
    for (const extension of [".cmd", ".exe", ".bat"]) {
      const candidate = path.join(entry, `${command}${extension}`);
      if (fs.existsSync(candidate)) {
        return candidate;
      }
    }
  }

  return `${command}.cmd`;
};

const parseProviders = (value: unknown): Record<string, ProjectProviderConfig> => {
  const defaults: Record<string, ProjectProviderConfig> = {
    antigravity: {
      command: "antigravity",
      args: ["run", "--stdin"],
      capabilities: ["planner"],
    },
    codex: {
      command: "codex",
      args: ["exec", "--skip-git-repo-check", "-"],
      capabilities: ["coder", "tester", "reviewer"],
    },
  };

  if (!isRecord(value)) {
    return Object.fromEntries(
      Object.entries(defaults).map(([name, provider]) => [name, { ...provider, command: resolveCommandOnWindows(provider.command) }]),
    );
  }

  const providers: Record<string, ProjectProviderConfig> = {};
  for (const [name, rawProvider] of Object.entries({ ...defaults, ...value })) {
    const fallback = defaults[name] ?? { command: name, args: [], capabilities: ["coder"] as AgentCapability[] };
    const provider = isRecord(rawProvider) ? rawProvider : {};
    providers[name] = {
      command: resolveCommandOnWindows(readString(provider.command, fallback.command)),
      args: readStringArray(provider.args, fallback.args),
      capabilities: readCapabilities(provider.capabilities, fallback.capabilities),
    };
  }
  return providers;
};

export const resolveProjectConfigPath = (repoRoot: string, projectConfigPath?: string): string => {
  const requested = projectConfigPath?.trim() || defaultConfigName;
  return path.isAbsolute(requested) ? requested : path.resolve(repoRoot, requested);
};

export const loadProjectConfig = (repoRoot: string, projectConfigPath?: string): ProjectConfig => {
  const configPath = resolveProjectConfigPath(repoRoot, projectConfigPath);
  const raw = fs.existsSync(configPath) ? JSON.parse(fs.readFileSync(configPath, "utf8")) as unknown : {};
  const data = isRecord(raw) ? raw : {};
  const configDir = path.dirname(configPath);
  const resolvedRepoRoot = path.resolve(configDir, readString(data.repoRoot, "."));

  return {
    projectName: readString(data.projectName, path.basename(resolvedRepoRoot)),
    repoRoot: resolvedRepoRoot,
    workspaceRoot: path.resolve(configDir, readString(data.workspaceRoot, "AgentService/.agent-workspaces")),
    maxIterations: Math.max(1, Number.isFinite(Number(data.maxIterations)) ? Number(data.maxIterations) : 3),
    maxChangedFiles: Number.isFinite(Number(data.maxChangedFiles)) ? Number(data.maxChangedFiles) : undefined,
    providers: parseProviders(data.providers),
  };
};
