export type AgentRunStatus =
  | "queued"
  | "context_indexing"
  | "planning"
  | "implementing"
  | "testing"
  | "reviewing"
  | "waiting_approval"
  | "succeeded"
  | "failed"
  | "cancelled"
  | "timed_out";

export type AgentStepName =
  | "context_indexing"
  | "planning"
  | "implementing"
  | "testing"
  | "reviewing"
  | "waiting_approval";

export type AgentStepStatus = "queued" | "running" | "succeeded" | "failed" | "cancelled" | "timed_out";

export type AgentCapability = "planner" | "implementer" | "tester" | "reviewer";

export type AgentArtifactType =
  | "context_pack"
  | "plan"
  | "patch"
  | "test_report"
  | "review_report"
  | "handoff_summary"
  | "command_stdout"
  | "command_stderr";

export type AgentErrorCode =
  | "VALIDATION_ERROR"
  | "RUN_NOT_FOUND"
  | "INVALID_STATE"
  | "PROVIDER_UNAVAILABLE"
  | "COMMAND_FAILED"
  | "SANDBOX_VIOLATION"
  | "TIMEOUT"
  | "INTERNAL_ERROR";

export interface ProviderMapping {
  planner: string;
  implementer: string;
  tester: string;
  reviewer: string;
}

export interface TokenBudgets {
  planner: number;
  implementer: number;
  tester: number;
  reviewer: number;
}

export interface AgentRun {
  id: string;
  task: string;
  status: AgentRunStatus;
  currentStep: AgentStepName | null;
  providerMapping: ProviderMapping;
  tokenBudgets: TokenBudgets;
  errorCode: AgentErrorCode | null;
  errorMessage: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AgentStep {
  id: string;
  runId: string;
  stepName: AgentStepName;
  status: AgentStepStatus;
  attempts: number;
  errorCode: AgentErrorCode | null;
  errorMessage: string | null;
  startedAt: Date | null;
  finishedAt: Date | null;
  createdAt: Date;
}

export interface AgentArtifact {
  id: string;
  runId: string;
  stepId: string | null;
  artifactType: AgentArtifactType;
  name: string;
  content: string;
  metadata: Record<string, unknown>;
  createdAt: Date;
}

export interface CreateRunInput {
  task: string;
  providerMapping?: Partial<ProviderMapping>;
  tokenBudgets?: Partial<TokenBudgets>;
}

export interface CreateRunData {
  id: string;
  status: AgentRunStatus;
  providerMapping: ProviderMapping;
  tokenBudgets: TokenBudgets;
}
