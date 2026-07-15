import { AppError, invalidState } from "../shared/errors.js";
import { logger } from "../shared/logger.js";
import type { AgentRepository } from "../storage/agent.repository.js";
import { ContextIndexer } from "../context/contextIndexer.js";
import type { ProviderRegistry } from "../providers/providerRegistry.js";
import type { WorkspaceManager } from "../sandbox/workspaceManager.js";
import type { AgentRun, AgentStepName, WorkflowAgentId } from "../shared/types.js";
import { implementationPrompt, planningPrompt, reviewPrompt, testingPrompt } from "./prompts.js";

export interface AgentDecision {
  decision: "pass" | "fail" | "needs_changes";
  target: "coder" | "planner" | "human" | null;
}

export type ProviderRegistryFactory = (run: AgentRun) => ProviderRegistry;

const stepStatus: Record<AgentStepName, AgentRun["status"]> = {
  context_indexing: "context_indexing",
  planning: "planning",
  implementing: "implementing",
  testing: "testing",
  reviewing: "reviewing",
  waiting_approval: "waiting_approval",
};

export const parseAgentDecision = (text: string): AgentDecision => {
  const decision = /AGENT_DECISION:\s*(pass|fail|needs_changes)/i.exec(text)?.[1]?.toLowerCase();
  const target = /AGENT_TARGET:\s*(coder|planner|human)/i.exec(text)?.[1]?.toLowerCase();
  return {
    decision: decision === "fail" || decision === "needs_changes" ? decision : "pass",
    target: target === "coder" || target === "planner" || target === "human" ? target : null,
  };
};

export class AgentWorkflow {
  private readonly contextIndexer = new ContextIndexer();

  public constructor(
    private readonly repository: AgentRepository,
    private readonly providerFactory: ProviderRegistryFactory,
    private readonly workspaceManager: WorkspaceManager,
  ) {}

  public async run(run: AgentRun): Promise<void> {
    try {
      const workspacePath = run.workspacePath ?? await this.workspaceManager.createWorkspace(run.id);
      const providers = this.providerFactory(run);
      await this.repository.updateRunWorkflow({
        runId: run.id,
        workspacePath,
        projectConfig: run.projectConfig as Record<string, unknown> | null,
        workflowState: "context_indexing",
      });
      await this.repository.addEvent({
        runId: run.id,
        eventType: "status",
        channel: "orchestrator",
        agentId: "orchestrator",
        stepId: null,
        content: "workflow started",
      });
      logger.info("agent workflow started", { runId: run.id });

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
        await this.repository.addMessage({
          runId: run.id,
          iteration: 0,
          fromAgent: "orchestrator",
          toAgent: "planner",
          messageType: "instruction",
          content: "Context indexed and ready for planning.",
          metadata: { fileCount: context.files.length },
        });
        return context;
      });

      const plan = await this.runStep(run, "planning", async (stepId) => {
        const provider = providers.get(run.providerMapping.planner);
        await provider.validateAvailability();
        const prompt = planningPrompt(run.task, contextPack, run.tokenBudgets.planner);
        await this.repository.addMessage({
          runId: run.id,
          iteration: 0,
          fromAgent: "orchestrator",
          toAgent: "planner",
          messageType: "instruction",
          content: prompt,
        });
        const result = await provider.run({
          runId: run.id,
          stepId,
          step: "planner",
          agentId: "planner",
          displayChannel: "Antigravity",
          workspacePath,
          tokenBudget: run.tokenBudgets.planner,
          prompt,
        });
        await this.repository.addArtifact(run.id, stepId, "plan", "implementation-plan.md", result.text);
        await this.repository.addMessage({
          runId: run.id,
          iteration: 0,
          fromAgent: "planner",
          toAgent: "coder",
          messageType: "result",
          content: result.text,
        });
        return result.text;
      });

      let handoff = plan;
      let testReport = "";
      const maxIterations = run.projectConfig?.maxIterations ?? 3;

      for (let iteration = 1; iteration <= maxIterations; iteration += 1) {
        await this.repository.updateRunWorkflow({
          runId: run.id,
          iteration,
          workflowState: "coder",
        });

        const implementationSummary = await this.runAgentTurn({
          run,
          workspacePath,
          providers,
          iteration,
          stepName: "implementing",
          agentId: "coder",
          providerName: run.providerMapping.coder,
          capability: "coder",
          prompt: implementationPrompt(run.task, handoff, run.tokenBudgets.coder ?? run.tokenBudgets.implementer ?? 10000),
          artifactType: "handoff_summary",
          artifactName: `implementation-summary-${iteration}.md`,
          toAgent: "tester",
        });

        testReport = await this.runAgentTurn({
          run,
          workspacePath,
          providers,
          iteration,
          stepName: "testing",
          agentId: "tester",
          providerName: run.providerMapping.tester,
          capability: "tester",
          prompt: testingPrompt(run.task, `${plan}\n\n${implementationSummary}`, run.tokenBudgets.tester),
          artifactType: "test_report",
          artifactName: `test-report-${iteration}.md`,
          toAgent: "reviewer",
        });
        const testerDecision = parseAgentDecision(testReport);
        await this.recordDecision(run.id, iteration, "tester", testerDecision, testReport);
        if (testerDecision.decision !== "pass") {
          handoff = `Tester requested changes in iteration ${iteration}:\n\n${testReport}`;
          continue;
        }

        const reviewReport = await this.runAgentTurn({
          run,
          workspacePath,
          providers,
          iteration,
          stepName: "reviewing",
          agentId: "reviewer",
          providerName: run.providerMapping.reviewer,
          capability: "reviewer",
          prompt: reviewPrompt(run.task, plan, testReport, run.tokenBudgets.reviewer),
          artifactType: "review_report",
          artifactName: `review-report-${iteration}.md`,
          toAgent: "orchestrator",
        });
        const reviewerDecision = parseAgentDecision(reviewReport);
        await this.recordDecision(run.id, iteration, "reviewer", reviewerDecision, reviewReport);
        if (reviewerDecision.decision === "pass") {
          await this.repository.updateRunStatus(run.id, "waiting_approval", "waiting_approval");
          await this.repository.addEvent({
            runId: run.id,
            eventType: "status",
            channel: "orchestrator",
            agentId: "orchestrator",
            stepId: null,
            content: "review passed; waiting for human approval",
            metadata: { iteration },
          });
          logger.info("agent workflow waiting for approval", { runId: run.id, iteration });
          return;
        }

        handoff = `Reviewer requested changes in iteration ${iteration}:\n\n${reviewReport}`;
      }

      throw invalidState(`Workflow reached maxIterations (${maxIterations}) before reviewer pass`);
    } catch (error) {
      const appError =
        error instanceof AppError
          ? error
          : new AppError(500, "INTERNAL_ERROR", error instanceof Error ? error.message : "Unknown workflow error");
      await this.repository.updateRunStatus(run.id, "failed", null, appError.code, appError.message);
      await this.repository.addEvent({
        runId: run.id,
        eventType: "error",
        channel: "orchestrator",
        agentId: "orchestrator",
        stepId: null,
        content: appError.message,
        metadata: { code: appError.code },
      });
      logger.error("agent workflow failed", { runId: run.id, code: appError.code, message: appError.message });
    }
  }

  private async runAgentTurn(input: {
    run: AgentRun;
    workspacePath: string;
    providers: ProviderRegistry;
    iteration: number;
    stepName: AgentStepName;
    agentId: WorkflowAgentId;
    providerName: string;
    capability: "coder" | "tester" | "reviewer";
    prompt: string;
    artifactType: "handoff_summary" | "test_report" | "review_report";
    artifactName: string;
    toAgent: WorkflowAgentId;
  }): Promise<string> {
    return this.runStep(input.run, input.stepName, async (stepId) => {
      const provider = input.providers.get(input.providerName);
      await provider.validateAvailability();
      await this.repository.addMessage({
        runId: input.run.id,
        iteration: input.iteration,
        fromAgent: "orchestrator",
        toAgent: input.agentId,
        messageType: "instruction",
        content: input.prompt,
      });
      const result = await provider.run({
        runId: input.run.id,
        stepId,
        step: input.capability,
        agentId: input.agentId,
        displayChannel: input.providerName === "antigravity" ? "Antigravity" : "Codex",
        workspacePath: input.workspacePath,
        tokenBudget: input.run.tokenBudgets[input.capability] ?? 5000,
        prompt: input.prompt,
      });
      await this.repository.addArtifact(input.run.id, stepId, input.artifactType, input.artifactName, result.text);
      await this.repository.addMessage({
        runId: input.run.id,
        iteration: input.iteration,
        fromAgent: input.agentId,
        toAgent: input.toAgent,
        messageType: "result",
        content: result.text,
      });
      return result.text;
    });
  }

  private async recordDecision(runId: string, iteration: number, fromAgent: WorkflowAgentId, decision: AgentDecision, content: string): Promise<void> {
    await this.repository.addMessage({
      runId,
      iteration,
      fromAgent,
      toAgent: decision.target === "human" ? "orchestrator" : decision.target,
      messageType: "decision",
      content,
      metadata: { decision: decision.decision, target: decision.target },
    });
    await this.repository.addEvent({
      runId,
      eventType: "decision",
      channel: "orchestrator",
      agentId: fromAgent,
      stepId: null,
      content: decision.decision,
      metadata: { decision: decision.decision, target: decision.target },
    });
  }

  private async runStep<T>(run: AgentRun, stepName: AgentStepName, handler: (stepId: string) => Promise<T>): Promise<T> {
    await this.repository.updateRunStatus(run.id, stepStatus[stepName], stepName);
    await this.repository.addEvent({
      runId: run.id,
      eventType: "status",
      channel: "orchestrator",
      agentId: "orchestrator",
      stepId: null,
      content: stepName,
    });
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
