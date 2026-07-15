import type { QueryResultRow } from "pg";
import type { Queryable } from "./database.js";
import type {
  AgentArtifact,
  AgentArtifactType,
  AgentErrorCode,
  AgentEvent,
  AgentEventType,
  AgentMessage,
  AgentMessageType,
  AgentRun,
  AgentRunStatus,
  AgentStep,
  AgentStepName,
  AgentStepStatus,
  CreateRunInput,
  ProviderMapping,
  TokenBudgets,
  WorkflowAgentId,
} from "../shared/types.js";

const defaultProviderMapping: ProviderMapping = {
  planner: "antigravity",
  coder: "codex",
  implementer: "codex",
  tester: "codex",
  reviewer: "codex",
};

const defaultTokenBudgets: TokenBudgets = {
  planner: 6000,
  coder: 10000,
  implementer: 10000,
  tester: 5000,
  reviewer: 5000,
};

const rowToRun = (row: QueryResultRow): AgentRun => ({
  id: String(row.id),
  task: String(row.task),
  status: row.status as AgentRunStatus,
  currentStep: row.current_step ? (row.current_step as AgentStepName) : null,
  providerMapping: normalizeProviderMapping(row.provider_mapping as Partial<ProviderMapping>),
  tokenBudgets: normalizeTokenBudgets(row.token_budgets as Partial<TokenBudgets>),
  projectConfig: row.project_config ? row.project_config as AgentRun["projectConfig"] : null,
  workflowState: row.workflow_state ? String(row.workflow_state) : null,
  iteration: Number(row.iteration ?? 0),
  workspacePath: row.workspace_path ? String(row.workspace_path) : null,
  activePid: row.active_pid === null || row.active_pid === undefined ? null : Number(row.active_pid),
  errorCode: row.error_code ? (row.error_code as AgentErrorCode) : null,
  errorMessage: row.error_message ? String(row.error_message) : null,
  createdAt: row.created_at as Date,
  updatedAt: row.updated_at as Date,
});

const rowToStep = (row: QueryResultRow): AgentStep => ({
  id: String(row.id),
  runId: String(row.run_id),
  stepName: row.step_name as AgentStepName,
  status: row.status as AgentStepStatus,
  attempts: Number(row.attempts),
  errorCode: row.error_code ? (row.error_code as AgentErrorCode) : null,
  errorMessage: row.error_message ? String(row.error_message) : null,
  startedAt: row.started_at ? (row.started_at as Date) : null,
  finishedAt: row.finished_at ? (row.finished_at as Date) : null,
  createdAt: row.created_at as Date,
});

const rowToArtifact = (row: QueryResultRow): AgentArtifact => ({
  id: String(row.id),
  runId: String(row.run_id),
  stepId: row.step_id ? String(row.step_id) : null,
  artifactType: row.artifact_type as AgentArtifactType,
  name: String(row.name),
  content: String(row.content),
  metadata: row.metadata as Record<string, unknown>,
  createdAt: row.created_at as Date,
});

const rowToMessage = (row: QueryResultRow): AgentMessage => ({
  id: String(row.id),
  runId: String(row.run_id),
  iteration: Number(row.iteration),
  fromAgent: row.from_agent as WorkflowAgentId,
  toAgent: row.to_agent ? (row.to_agent as WorkflowAgentId) : null,
  messageType: row.message_type as AgentMessageType,
  content: String(row.content),
  metadata: row.metadata as Record<string, unknown>,
  createdAt: row.created_at as Date,
});

const rowToEvent = (row: QueryResultRow): AgentEvent => ({
  id: String(row.id),
  runId: String(row.run_id),
  sequence: Number(row.sequence),
  eventType: row.event_type as AgentEventType,
  channel: String(row.channel),
  agentId: row.agent_id ? (row.agent_id as WorkflowAgentId) : null,
  stepId: row.step_id ? String(row.step_id) : null,
  content: String(row.content),
  metadata: row.metadata as Record<string, unknown>,
  createdAt: row.created_at as Date,
});

const normalizeProviderMapping = (input: Partial<ProviderMapping> = {}): ProviderMapping => ({
  planner: input.planner ?? defaultProviderMapping.planner,
  coder: input.coder ?? input.implementer ?? defaultProviderMapping.coder,
  implementer: input.implementer ?? input.coder ?? defaultProviderMapping.coder,
  tester: input.tester ?? defaultProviderMapping.tester,
  reviewer: input.reviewer ?? defaultProviderMapping.reviewer,
});

const normalizeTokenBudgets = (input: Partial<TokenBudgets> = {}): TokenBudgets => ({
  planner: input.planner ?? defaultTokenBudgets.planner,
  coder: input.coder ?? input.implementer ?? defaultTokenBudgets.coder,
  implementer: input.implementer ?? input.coder ?? defaultTokenBudgets.coder,
  tester: input.tester ?? defaultTokenBudgets.tester,
  reviewer: input.reviewer ?? defaultTokenBudgets.reviewer,
});

export class AgentRepository {
  public constructor(private readonly db: Queryable) {}

  public async createRun(input: CreateRunInput): Promise<AgentRun> {
    const providerMapping = normalizeProviderMapping(input.providerMapping);
    const tokenBudgets = normalizeTokenBudgets(input.tokenBudgets);
    const result = await this.db.query(
      `insert into agent_runs (task, status, provider_mapping, token_budgets, workflow_state)
       values ($1, 'queued', $2, $3, 'queued')
       returning *`,
      [input.task, providerMapping, tokenBudgets],
    );
    return rowToRun(result.rows[0]);
  }

  public async getRun(id: string): Promise<AgentRun | null> {
    const result = await this.db.query("select * from agent_runs where id = $1", [id]);
    return result.rows[0] ? rowToRun(result.rows[0]) : null;
  }

  public async listRecentRuns(limit: number): Promise<AgentRun[]> {
    const result = await this.db.query(
      "select * from agent_runs order by created_at desc limit $1",
      [limit]
    );
    return result.rows.map(rowToRun);
  }

  public async claimNextRun(): Promise<AgentRun | null> {
    const result = await this.db.query(
      `update agent_runs
       set status = 'context_indexing', current_step = 'context_indexing', updated_at = now()
       where id = (
         select id from agent_runs
         where status = 'queued'
         order by created_at asc
         for update skip locked
         limit 1
       )
       returning *`,
    );
    return result.rows[0] ? rowToRun(result.rows[0]) : null;
  }

  public async updateRunStatus(
    runId: string,
    status: AgentRunStatus,
    currentStep: AgentStepName | null,
    errorCode: AgentErrorCode | null = null,
    errorMessage: string | null = null,
  ): Promise<AgentRun | null> {
    const result = await this.db.query(
      `update agent_runs
       set status = $2, current_step = $3, error_code = $4, error_message = $5, updated_at = now()
       where id = $1
       returning *`,
      [runId, status, currentStep, errorCode, errorMessage],
    );
    return result.rows[0] ? rowToRun(result.rows[0]) : null;
  }

  public async updateRunWorkflow(input: {
    runId: string;
    status?: AgentRunStatus;
    currentStep?: AgentStepName | null;
    workflowState?: string | null;
    iteration?: number;
    workspacePath?: string | null;
    projectConfig?: Record<string, unknown> | null;
    activePid?: number | null;
    errorCode?: AgentErrorCode | null;
    errorMessage?: string | null;
  }): Promise<AgentRun | null> {
    const current = await this.getRun(input.runId);
    if (!current) {
      return null;
    }
    const result = await this.db.query(
      `update agent_runs
       set status = $2,
           current_step = $3,
           workflow_state = $4,
           iteration = $5,
           workspace_path = $6,
           project_config = $7,
           active_pid = $8,
           error_code = $9,
           error_message = $10,
           updated_at = now()
       where id = $1
       returning *`,
      [
        input.runId,
        input.status ?? current.status,
        input.currentStep !== undefined ? input.currentStep : current.currentStep,
        input.workflowState !== undefined ? input.workflowState : current.workflowState,
        input.iteration ?? current.iteration,
        input.workspacePath !== undefined ? input.workspacePath : current.workspacePath,
        input.projectConfig !== undefined ? input.projectConfig : current.projectConfig,
        input.activePid !== undefined ? input.activePid : current.activePid,
        input.errorCode !== undefined ? input.errorCode : current.errorCode,
        input.errorMessage !== undefined ? input.errorMessage : current.errorMessage,
      ],
    );
    return result.rows[0] ? rowToRun(result.rows[0]) : null;
  }

  public async createStep(runId: string, stepName: AgentStepName): Promise<AgentStep> {
    const result = await this.db.query(
      `insert into agent_steps (run_id, step_name, status, attempts, started_at)
       values ($1, $2, 'running', 1, now())
       returning *`,
      [runId, stepName],
    );
    return rowToStep(result.rows[0]);
  }

  public async finishStep(
    stepId: string,
    status: AgentStepStatus,
    errorCode: AgentErrorCode | null = null,
    errorMessage: string | null = null,
  ): Promise<void> {
    await this.db.query(
      `update agent_steps
       set status = $2, error_code = $3, error_message = $4, finished_at = now()
       where id = $1`,
      [stepId, status, errorCode, errorMessage],
    );
  }

  public async addArtifact(
    runId: string,
    stepId: string | null,
    artifactType: AgentArtifactType,
    name: string,
    content: string,
    metadata: Record<string, unknown> = {},
  ): Promise<AgentArtifact> {
    const result = await this.db.query(
      `insert into agent_artifacts (run_id, step_id, artifact_type, name, content, metadata)
       values ($1, $2, $3, $4, $5, $6)
       returning *`,
      [runId, stepId, artifactType, name, content, metadata],
    );
    return rowToArtifact(result.rows[0]);
  }

  public async listArtifacts(runId: string): Promise<AgentArtifact[]> {
    const result = await this.db.query(
      `select * from agent_artifacts
       where run_id = $1
       order by created_at asc`,
      [runId],
    );
    return result.rows.map(rowToArtifact);
  }

  public async addMessage(input: {
    runId: string;
    iteration: number;
    fromAgent: WorkflowAgentId;
    toAgent: WorkflowAgentId | null;
    messageType: AgentMessageType;
    content: string;
    metadata?: Record<string, unknown>;
  }): Promise<AgentMessage> {
    const result = await this.db.query(
      `insert into agent_messages (run_id, iteration, from_agent, to_agent, message_type, content, metadata)
       values ($1, $2, $3, $4, $5, $6, $7)
       returning *`,
      [
        input.runId,
        input.iteration,
        input.fromAgent,
        input.toAgent,
        input.messageType,
        input.content,
        input.metadata ?? {},
      ],
    );
    return rowToMessage(result.rows[0]);
  }

  public async listMessages(runId: string): Promise<AgentMessage[]> {
    const result = await this.db.query(
      `select * from agent_messages
       where run_id = $1
       order by iteration asc, created_at asc, id asc`,
      [runId],
    );
    return result.rows.map(rowToMessage);
  }

  public async addEvent(input: {
    runId: string;
    eventType: AgentEventType;
    channel: string;
    agentId: WorkflowAgentId | null;
    stepId: string | null;
    content?: string;
    metadata?: Record<string, unknown>;
  }): Promise<AgentEvent> {
    const result = await this.db.query(
      `insert into agent_events (run_id, event_type, channel, agent_id, step_id, content, metadata)
       values ($1, $2, $3, $4, $5, $6, $7)
       returning *`,
      [
        input.runId,
        input.eventType,
        input.channel,
        input.agentId,
        input.stepId,
        input.content ?? "",
        input.metadata ?? {},
      ],
    );
    return rowToEvent(result.rows[0]);
  }

  public async listEvents(runId: string, afterSequence = 0, limit = 500): Promise<AgentEvent[]> {
    const result = await this.db.query(
      `select * from agent_events
       where run_id = $1 and sequence > $2
       order by sequence asc
       limit $3`,
      [runId, afterSequence, limit],
    );
    return result.rows.map(rowToEvent);
  }

  public async approveRun(runId: string, reviewer: string, note: string | null): Promise<void> {
    await this.db.query(
      `insert into agent_approvals (run_id, decision, reviewer, note)
       values ($1, 'approved', $2, $3)`,
      [runId, reviewer, note],
    );
  }

  public async cancelRun(runId: string): Promise<AgentRun | null> {
    const result = await this.db.query(
      `update agent_runs
       set status = 'cancelled', updated_at = now()
       where id = $1 and status in ('queued', 'context_indexing', 'planning', 'implementing', 'testing', 'reviewing')
       returning *`,
      [runId],
    );
    return result.rows[0] ? rowToRun(result.rows[0]) : null;
  }

  public async clearActiveProcess(runId: string, pid: number): Promise<void> {
    await this.db.query(
      `update agent_runs
       set active_pid = null, updated_at = now()
       where id = $1 and active_pid = $2`,
      [runId, pid],
    );
  }

  public async recordCommandAudit(input: {
    runId: string;
    stepId: string | null;
    executable: string;
    args: string[];
    cwd: string;
    exitCode: number | null;
    durationMs: number;
    stdoutArtifactId: string | null;
    stderrArtifactId: string | null;
  }): Promise<void> {
    await this.db.query(
      `insert into agent_command_audits
       (run_id, step_id, executable, args, cwd, exit_code, duration_ms, stdout_artifact_id, stderr_artifact_id)
       values ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        input.runId,
        input.stepId,
        input.executable,
        input.args,
        input.cwd,
        input.exitCode,
        input.durationMs,
        input.stdoutArtifactId,
        input.stderrArtifactId,
      ],
    );
  }
}
