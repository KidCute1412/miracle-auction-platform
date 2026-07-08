import type { QueryResultRow } from "pg";
import type { Queryable } from "./database.js";
import type {
  AgentArtifact,
  AgentArtifactType,
  AgentErrorCode,
  AgentRun,
  AgentRunStatus,
  AgentStep,
  AgentStepName,
  AgentStepStatus,
  CreateRunInput,
  ProviderMapping,
  TokenBudgets,
} from "../shared/types.js";

const defaultProviderMapping: ProviderMapping = {
  planner: "antigravity",
  implementer: "codex",
  tester: "codex",
  reviewer: "codex",
};

const defaultTokenBudgets: TokenBudgets = {
  planner: 6000,
  implementer: 10000,
  tester: 5000,
  reviewer: 5000,
};

const rowToRun = (row: QueryResultRow): AgentRun => ({
  id: String(row.id),
  task: String(row.task),
  status: row.status as AgentRunStatus,
  currentStep: row.current_step ? (row.current_step as AgentStepName) : null,
  providerMapping: row.provider_mapping as ProviderMapping,
  tokenBudgets: row.token_budgets as TokenBudgets,
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

export class AgentRepository {
  public constructor(private readonly db: Queryable) {}

  public async createRun(input: CreateRunInput): Promise<AgentRun> {
    const providerMapping: ProviderMapping = { ...defaultProviderMapping, ...input.providerMapping };
    const tokenBudgets: TokenBudgets = { ...defaultTokenBudgets, ...input.tokenBudgets };
    const result = await this.db.query(
      `insert into agent_runs (task, status, provider_mapping, token_budgets)
       values ($1, 'queued', $2, $3)
       returning *`,
      [input.task, providerMapping, tokenBudgets],
    );
    return rowToRun(result.rows[0]);
  }

  public async getRun(id: string): Promise<AgentRun | null> {
    const result = await this.db.query("select * from agent_runs where id = $1", [id]);
    return result.rows[0] ? rowToRun(result.rows[0]) : null;
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
