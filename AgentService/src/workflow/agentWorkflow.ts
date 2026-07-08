import { AppError } from "../shared/errors.js";
import { logger } from "../shared/logger.js";
import type { AgentRepository } from "../storage/agent.repository.js";
import { ContextIndexer } from "../context/contextIndexer.js";
import type { ProviderRegistry } from "../providers/providerRegistry.js";
import type { WorkspaceManager } from "../sandbox/workspaceManager.js";
import type { AgentRun, AgentStepName } from "../shared/types.js";
import { implementationPrompt, planningPrompt, reviewPrompt, testingPrompt } from "./prompts.js";

export class AgentWorkflow {
  private readonly contextIndexer = new ContextIndexer();

  public constructor(
    private readonly repository: AgentRepository,
    private readonly providers: ProviderRegistry,
    private readonly workspaceManager: WorkspaceManager,
  ) {}

  public async run(run: AgentRun): Promise<void> {
    const workspacePath = await this.workspaceManager.createWorkspace(run.id);
    logger.info("agent workflow started", { runId: run.id });

    try {
      const contextPack = await this.runStep(run, "context_indexing", async (stepId) => {
        const context = await this.contextIndexer.build(workspacePath);
        await this.repository.addArtifact(
          run.id,
          stepId,
          "context_pack",
          "context-pack.json",
          JSON.stringify(context, null, 2),
          { fileCount: context.files.length },
        );
        await this.repository.addArtifact(run.id, stepId, "handoff_summary", "context-summary.md", context.summary);
        return context;
      });

      const plan = await this.runStep(run, "planning", async (stepId) => {
        const provider = this.providers.get(run.providerMapping.planner);
        await provider.validateAvailability();
        const result = await provider.run({
          runId: run.id,
          stepId,
          step: "planner",
          workspacePath,
          tokenBudget: run.tokenBudgets.planner,
          prompt: planningPrompt(run.task, contextPack, run.tokenBudgets.planner),
        });
        await this.repository.addArtifact(run.id, stepId, "plan", "implementation-plan.md", result.text);
        return result.text;
      });

      const implementationSummary = await this.runStep(run, "implementing", async (stepId) => {
        const provider = this.providers.get(run.providerMapping.implementer);
        await provider.validateAvailability();
        const result = await provider.run({
          runId: run.id,
          stepId,
          step: "implementer",
          workspacePath,
          tokenBudget: run.tokenBudgets.implementer,
          prompt: implementationPrompt(run.task, plan, run.tokenBudgets.implementer),
        });
        await this.repository.addArtifact(run.id, stepId, "handoff_summary", "implementation-summary.md", result.text);
        return result.text;
      });

      const testReport = await this.runStep(run, "testing", async (stepId) => {
        const provider = this.providers.get(run.providerMapping.tester);
        await provider.validateAvailability();
        const result = await provider.run({
          runId: run.id,
          stepId,
          step: "tester",
          workspacePath,
          tokenBudget: run.tokenBudgets.tester,
          prompt: testingPrompt(run.task, `${plan}\n\n${implementationSummary}`, run.tokenBudgets.tester),
        });
        await this.repository.addArtifact(run.id, stepId, "test_report", "test-report.md", result.text);
        return result.text;
      });

      await this.runStep(run, "reviewing", async (stepId) => {
        const provider = this.providers.get(run.providerMapping.reviewer);
        await provider.validateAvailability();
        const result = await provider.run({
          runId: run.id,
          stepId,
          step: "reviewer",
          workspacePath,
          tokenBudget: run.tokenBudgets.reviewer,
          prompt: reviewPrompt(run.task, plan, testReport, run.tokenBudgets.reviewer),
        });
        await this.repository.addArtifact(run.id, stepId, "review_report", "review-report.md", result.text);
        return result.text;
      });

      await this.repository.updateRunStatus(run.id, "waiting_approval", "waiting_approval");
      logger.info("agent workflow waiting for approval", { runId: run.id });
    } catch (error) {
      const appError =
        error instanceof AppError
          ? error
          : new AppError(500, "INTERNAL_ERROR", error instanceof Error ? error.message : "Unknown workflow error");
      await this.repository.updateRunStatus(run.id, "failed", null, appError.code, appError.message);
      logger.error("agent workflow failed", { runId: run.id, code: appError.code, message: appError.message });
    }
  }

  private async runStep<T>(run: AgentRun, stepName: AgentStepName, handler: (stepId: string) => Promise<T>): Promise<T> {
    await this.repository.updateRunStatus(run.id, stepName, stepName);
    const step = await this.repository.createStep(run.id, stepName);
    try {
      const result = await handler(step.id);
      await this.repository.finishStep(step.id, "succeeded");
      return result;
    } catch (error) {
      const appError =
        error instanceof AppError
          ? error
          : new AppError(500, "INTERNAL_ERROR", error instanceof Error ? error.message : "Unknown step error");
      await this.repository.finishStep(step.id, "failed", appError.code, appError.message);
      throw appError;
    }
  }
}
