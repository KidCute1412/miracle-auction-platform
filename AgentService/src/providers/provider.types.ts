import type { AgentCapability } from "../shared/types.js";

export interface AgentProviderInput {
  runId: string;
  stepId: string;
  step: AgentCapability;
  agentId: string;
  displayChannel: string;
  prompt: string;
  workspacePath: string;
  tokenBudget: number;
}

export interface AgentProviderResult {
  text: string;
  exitCode: number | null;
  durationMs: number;
}

export interface AgentProviderAdapter {
  readonly name: string;
  readonly capabilities: readonly AgentCapability[];
  validateAvailability(): Promise<void>;
  run(input: AgentProviderInput): Promise<AgentProviderResult>;
}
