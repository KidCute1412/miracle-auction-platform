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

export type AgentCapability = "planner" | "coder" | "implementer" | "tester" | "reviewer";

export type WorkflowAgentId = "planner" | "coder" | "tester" | "reviewer" | "orchestrator";

export type AgentMessageType = "instruction" | "result" | "feedback" | "decision";

export type AgentEventType = "status" | "stdout" | "stderr" | "message" | "artifact" | "decision" | "error";

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
  coder: string;
  implementer?: string;
  tester: string;
  reviewer: string;
}

export interface TokenBudgets {
  planner: number;
  coder: number;
  implementer?: number;
  tester: number;
  reviewer: number;
}

export interface ProjectProviderConfig {
  command: string;
  args: string[];
  capabilities: AgentCapability[];
}

export interface ProjectConfig {
  projectName: string;
  repoRoot: string;
  workspaceRoot: string;
  maxIterations: number;
  providers: Record<string, ProjectProviderConfig>;
  maxChangedFiles?: number;
}

export interface AgentRun {
  id: string;
  task: string;
  status: AgentRunStatus;
  currentStep: AgentStepName | null;
  providerMapping: ProviderMapping;
  tokenBudgets: TokenBudgets;
  projectConfig: ProjectConfig | null;
  workflowState: string | null;
  iteration: number;
  workspacePath: string | null;
  activePid: number | null;
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

export interface AgentMessage {
  id: string;
  runId: string;
  iteration: number;
  fromAgent: WorkflowAgentId;
  toAgent: WorkflowAgentId | null;
  messageType: AgentMessageType;
  content: string;
  metadata: Record<string, unknown>;
  createdAt: Date;
}

export interface AgentEvent {
  id: string;
  runId: string;
  sequence: number;
  eventType: AgentEventType;
  channel: string;
  agentId: WorkflowAgentId | null;
  stepId: string | null;
  content: string;
  metadata: Record<string, unknown>;
  createdAt: Date;
}

export interface CreateRunInput {
  task: string;
  providerMapping?: Partial<ProviderMapping>;
  tokenBudgets?: Partial<TokenBudgets>;
  projectConfigPath?: string;
}

export interface CreateRunData {
  id: string;
  status: AgentRunStatus;
  providerMapping: ProviderMapping;
  tokenBudgets: TokenBudgets;
}
