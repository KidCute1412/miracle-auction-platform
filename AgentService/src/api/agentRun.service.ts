import { invalidState, notFound } from "../shared/errors.js";
import type { AgentRepository } from "../storage/agent.repository.js";
import type { AgentArtifact, AgentRun, CreateRunData, CreateRunInput } from "../shared/types.js";

export class AgentRunService {
  public constructor(private readonly repository: AgentRepository) {}

  public async createRun(input: CreateRunInput): Promise<CreateRunData> {
    const run = await this.repository.createRun(input);
    return {
      id: run.id,
      status: run.status,
      providerMapping: run.providerMapping,
      tokenBudgets: run.tokenBudgets,
    };
  }

  public async getRun(id: string): Promise<AgentRun> {
    const run = await this.repository.getRun(id);
    if (!run) {
      throw notFound("Agent run not found");
    }
    return run;
  }

  public async listArtifacts(id: string): Promise<AgentArtifact[]> {
    await this.getRun(id);
    return this.repository.listArtifacts(id);
  }

  public async approveRun(id: string, reviewer: string, note: string | null): Promise<AgentRun> {
    const run = await this.getRun(id);
    if (run.status !== "waiting_approval") {
      throw invalidState("Only runs waiting for approval can be approved");
    }
    await this.repository.approveRun(id, reviewer, note);
    const updated = await this.repository.updateRunStatus(id, "succeeded", null);
    if (!updated) {
      throw notFound("Agent run not found");
    }
    return updated;
  }

  public async cancelRun(id: string): Promise<AgentRun> {
    await this.getRun(id);
    const cancelled = await this.repository.cancelRun(id);
    if (!cancelled) {
      throw invalidState("Only queued or active runs can be cancelled");
    }
    return cancelled;
  }
}
