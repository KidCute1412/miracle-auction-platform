import dotenv from "dotenv";

dotenv.config();

export interface AgentServiceConfig {
  nodeEnv: string;
  port: number;
  databaseUrl: string;
  workspaceRoot: string;
  repoRoot: string;
  pollIntervalMs: number;
  commandTimeoutMs: number;
  maxOutputBytes: number;
  maxChangedFiles: number;
  providerPaths: {
    antigravity: string | null;
    codex: string;
    claudeCode: string | null;
  };
}

const readNumber = (name: string, fallback: number): number => {
  const raw = process.env[name];
  if (raw === undefined || raw.trim() === "") {
    return fallback;
  }
  const value = Number(raw);
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`${name} must be a positive number`);
  }
  return value;
};

const readOptional = (name: string): string | null => {
  const value = process.env[name]?.trim();
  return value ? value : null;
};

export const loadConfig = (): AgentServiceConfig => {
  const databaseUrl = process.env.DATABASE_URL?.trim();
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required");
  }

  return {
    nodeEnv: process.env.NODE_ENV ?? "development",
    port: readNumber("AGENT_SERVICE_PORT", 8010),
    databaseUrl,
    workspaceRoot: process.env.AGENT_WORKSPACE_ROOT?.trim() || ".agent-workspaces",
    repoRoot: process.env.AGENT_REPO_ROOT?.trim() || "..",
    pollIntervalMs: readNumber("AGENT_POLL_INTERVAL_MS", 2500),
    commandTimeoutMs: readNumber("AGENT_COMMAND_TIMEOUT_MS", 120000),
    maxOutputBytes: readNumber("AGENT_MAX_OUTPUT_BYTES", 65536),
    maxChangedFiles: readNumber("AGENT_MAX_CHANGED_FILES", 80),
    providerPaths: {
      antigravity: readOptional("ANTIGRAVITY_CLI_PATH"),
      codex: process.env.CODEX_CLI_PATH?.trim() || "codex",
      claudeCode: readOptional("CLAUDE_CODE_PATH"),
    },
  };
};
