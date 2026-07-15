import { StateGraph, Annotation } from "@langchain/langgraph";
import { PostgresSaver } from "@langchain/langgraph-checkpoint-postgres";
import type { AgentRepository } from "../storage/agent.repository.js";
import type { WorkspaceManager } from "../sandbox/workspaceManager.js";
import type { ProviderRegistry } from "../providers/providerRegistry.js";
import { planningPrompt, implementationPrompt, testingPrompt, reviewPrompt } from "./prompts.js";
import { ContextIndexer } from "../context/contextIndexer.js";
import { logger } from "../shared/logger.js";

// Parse Agent Decisions from LLM content
export interface AgentDecision {
  decision: "pass" | "fail" | "needs_changes";
  target: "coder" | "planner" | "human" | null;
}

export const parseAgentDecision = (text: string): AgentDecision => {
  const decision = /AGENT_DECISION:\s*(pass|fail|needs_changes)/i.exec(text)?.[1]?.toLowerCase();
  const target = /AGENT_TARGET:\s*(coder|planner|human)/i.exec(text)?.[1]?.toLowerCase();
  return {
    decision: decision === "fail" || decision === "needs_changes" ? decision : "pass",
    target: target === "coder" || target === "planner" || target === "human" ? target : null,
  };
};

// Define StateGraph Annotation
export const AgentState = Annotation.Root({
  runId: Annotation<string>(),
  task: Annotation<string>(),
  workspacePath: Annotation<string>({
    reducer: (left, right) => right ?? left,
    default: () => "",
  }),
  plan: Annotation<string>({
    reducer: (left, right) => right ?? left,
    default: () => "",
  }),
  implementationSummary: Annotation<string>({
    reducer: (left, right) => right ?? left,
    default: () => "",
  }),
  testReport: Annotation<string>({
    reducer: (left, right) => right ?? left,
    default: () => "",
  }),
  reviewReport: Annotation<string>({
    reducer: (left, right) => right ?? left,
    default: () => "",
  }),
  iteration: Annotation<number>({
    reducer: (left, right) => right ?? left,
    default: () => 1,
  }),
  maxIterations: Annotation<number>({
    reducer: (left, right) => right ?? left,
    default: () => 3,
  }),
  testerDecision: Annotation<"pass" | "fail">({
    reducer: (left, right) => right ?? left,
    default: () => "pass",
  }),
  reviewerDecision: Annotation<"pass" | "needs_changes">({
    reducer: (left, right) => right ?? left,
    default: () => "pass",
  }),
});

export class LangGraphWorkflow {
  private readonly contextIndexer = new ContextIndexer();

  constructor(
    private readonly repository: AgentRepository,
    private readonly workspaceManager: WorkspaceManager,
    private readonly providers: ProviderRegistry,
  ) {}

  public async compileGraph(checkpointer: PostgresSaver) {
    const workflow = new StateGraph(AgentState)
      .addNode("context_indexing", this.contextIndexingNode.bind(this))
      .addNode("planning", this.planningNode.bind(this))
      .addNode("implementing", this.implementingNode.bind(this))
      .addNode("testing", this.testingNode.bind(this))
      .addNode("reviewing", this.reviewingNode.bind(this))
      .addEdge("__start__", "context_indexing")
      .addEdge("context_indexing", "planning")
      .addEdge("planning", "implementing")
      .addEdge("implementing", "testing")
      .addConditionalEdges("testing", this.routeTester.bind(this))
      .addConditionalEdges("reviewing", this.routeReviewer.bind(this));

    return workflow.compile({ checkpointer });
  }

  // 1. Context Indexing Node
  private async contextIndexingNode(state: typeof AgentState.State) {
    logger.info("Starting context indexing step in LangGraph", { runId: state.runId });
    const run = await this.repository.getRun(state.runId);
    if (!run) throw new Error("Run not found");

    const workspacePath = run.workspacePath ?? await this.workspaceManager.createWorkspace(run.id);
    await this.repository.updateRunWorkflow({
      runId: run.id,
      workspacePath,
      workflowState: "context_indexing",
      status: "context_indexing",
      currentStep: "context_indexing",
    });

    const step = await this.repository.createStep(run.id, "context_indexing");
    try {
      const context = await this.contextIndexer.build(workspacePath);
      await this.repository.addArtifact(
        run.id,
        step.id,
        "context_pack",
        "context-pack.json",
        JSON.stringify(context, null, 2),
        { fileCount: context.files.length },
      );
      await this.repository.addArtifact(run.id, step.id, "handoff_summary", "context-summary.md", context.summary);
      await this.repository.addMessage({
        runId: run.id,
        iteration: 0,
        fromAgent: "orchestrator",
        toAgent: "planner",
        messageType: "instruction",
        content: "Context indexed and ready for planning.",
        metadata: { fileCount: context.files.length },
      });
      await this.repository.finishStep(step.id, "succeeded");
      return { workspacePath };
    } catch (error: any) {
      await this.repository.finishStep(step.id, "failed", "INTERNAL_ERROR", error.message);
      throw error;
    }
  }

  // 2. Planning Node (Antigravity Role)
  private async planningNode(state: typeof AgentState.State) {
    logger.info("Starting planning step in LangGraph", { runId: state.runId });
    const run = await this.repository.getRun(state.runId);
    if (!run) throw new Error("Run not found");

    await this.repository.updateRunWorkflow({
      runId: state.runId,
      status: "planning",
      currentStep: "planning",
    });

    const step = await this.repository.createStep(state.runId, "planning");
    try {
      const context = await this.contextIndexer.build(state.workspacePath);
      const prompt = planningPrompt(state.task, context, run.tokenBudgets.planner);

      await this.repository.addMessage({
        runId: state.runId,
        iteration: 0,
        fromAgent: "orchestrator",
        toAgent: "planner",
        messageType: "instruction",
        content: prompt,
      });

      const providerName = run.providerMapping.planner;
      const provider = this.providers.get(providerName);
      await provider.validateAvailability();

      await this.repository.addEvent({
        runId: state.runId,
        eventType: "status",
        channel: providerName === "antigravity" ? "Antigravity" : "Codex",
        agentId: "planner",
        stepId: step.id,
        content: `${providerName} (planner) starting analysis`,
      });

      const result = await provider.run({
        runId: state.runId,
        stepId: step.id,
        step: "planner",
        agentId: "planner",
        displayChannel: providerName === "antigravity" ? "Antigravity" : "Codex",
        workspacePath: state.workspacePath,
        tokenBudget: run.tokenBudgets.planner,
        prompt,
      });

      await this.repository.addArtifact(state.runId, step.id, "plan", "implementation-plan.md", result.text);
      await this.repository.addMessage({
        runId: state.runId,
        iteration: 0,
        fromAgent: "planner",
        toAgent: "coder",
        messageType: "result",
        content: result.text,
      });

      await this.repository.addEvent({
        runId: state.runId,
        eventType: "status",
        channel: providerName === "antigravity" ? "Antigravity" : "Codex",
        agentId: "planner",
        stepId: step.id,
        content: `${providerName} (planner) completed plan creation`,
      });

      await this.repository.finishStep(step.id, "succeeded");
      return { plan: result.text };
    } catch (error: any) {
      await this.repository.finishStep(step.id, "failed", "INTERNAL_ERROR", error.message);
      throw error;
    }
  }

  // 3. Implementing Node (Coder Role)
  private async implementingNode(state: typeof AgentState.State) {
    logger.info("Starting implementation step in LangGraph", { runId: state.runId, iteration: state.iteration });
    const run = await this.repository.getRun(state.runId);
    if (!run) throw new Error("Run not found");

    await this.repository.updateRunWorkflow({
      runId: state.runId,
      status: "implementing",
      currentStep: "implementing",
      iteration: state.iteration,
    });

    const step = await this.repository.createStep(state.runId, "implementing");
    try {
      const prompt = implementationPrompt(state.task, state.plan, run.tokenBudgets.coder);
      await this.repository.addMessage({
        runId: state.runId,
        iteration: state.iteration,
        fromAgent: "orchestrator",
        toAgent: "coder",
        messageType: "instruction",
        content: prompt,
      });

      const providerName = run.providerMapping.coder;
      const provider = this.providers.get(providerName);
      await provider.validateAvailability();

      await this.repository.addEvent({
        runId: state.runId,
        eventType: "status",
        channel: providerName === "antigravity" ? "Antigravity" : "Codex",
        agentId: "coder",
        stepId: step.id,
        content: `${providerName} (coder) starting code implementation`,
      });

      const result = await provider.run({
        runId: state.runId,
        stepId: step.id,
        step: "coder",
        agentId: "coder",
        displayChannel: providerName === "antigravity" ? "Antigravity" : "Codex",
        workspacePath: state.workspacePath,
        tokenBudget: run.tokenBudgets.coder,
        prompt,
      });

      await this.repository.addArtifact(state.runId, step.id, "handoff_summary", `implementation-summary-${state.iteration}.md`, result.text);
      await this.repository.addMessage({
        runId: state.runId,
        iteration: state.iteration,
        fromAgent: "coder",
        toAgent: "tester",
        messageType: "result",
        content: result.text,
      });

      await this.repository.finishStep(step.id, "succeeded");
      return { implementationSummary: result.text };
    } catch (error: any) {
      await this.repository.finishStep(step.id, "failed", "INTERNAL_ERROR", error.message);
      throw error;
    }
  }

  // 4. Testing Node (Tester Role)
  private async testingNode(state: typeof AgentState.State) {
    logger.info("Starting testing step in LangGraph", { runId: state.runId, iteration: state.iteration });
    const run = await this.repository.getRun(state.runId);
    if (!run) throw new Error("Run not found");

    await this.repository.updateRunWorkflow({
      runId: state.runId,
      status: "testing",
      currentStep: "testing",
    });

    const step = await this.repository.createStep(state.runId, "testing");
    try {
      const prompt = testingPrompt(state.task, `${state.plan}\n\n${state.implementationSummary}`, run.tokenBudgets.tester);
      await this.repository.addMessage({
        runId: state.runId,
        iteration: state.iteration,
        fromAgent: "orchestrator",
        toAgent: "tester",
        messageType: "instruction",
        content: prompt,
      });

      const providerName = run.providerMapping.tester;
      const provider = this.providers.get(providerName);
      await provider.validateAvailability();

      await this.repository.addEvent({
        runId: state.runId,
        eventType: "status",
        channel: providerName === "antigravity" ? "Antigravity" : "Codex",
        agentId: "tester",
        stepId: step.id,
        content: `${providerName} (tester) executing build and verification tests`,
      });

      const result = await provider.run({
        runId: state.runId,
        stepId: step.id,
        step: "tester",
        agentId: "tester",
        displayChannel: providerName === "antigravity" ? "Antigravity" : "Codex",
        workspacePath: state.workspacePath,
        tokenBudget: run.tokenBudgets.tester,
        prompt,
      });

      const parsedDecision = parseAgentDecision(result.text);

      await this.repository.addArtifact(state.runId, step.id, "test_report", `test-report-${state.iteration}.md`, result.text);
      await this.repository.addMessage({
        runId: state.runId,
        iteration: state.iteration,
        fromAgent: "tester",
        toAgent: parsedDecision.decision === "pass" ? "reviewer" : "coder",
        messageType: "result",
        content: result.text,
        metadata: { decision: parsedDecision.decision },
      });

      await this.repository.finishStep(step.id, "succeeded");

      const nextIteration = parsedDecision.decision === "pass" ? state.iteration : state.iteration + 1;
      return {
        testReport: result.text,
        testerDecision: (parsedDecision.decision === "pass" ? "pass" : "fail") as "pass" | "fail",
        iteration: nextIteration,
      };
    } catch (error: any) {
      await this.repository.finishStep(step.id, "failed", "INTERNAL_ERROR", error.message);
      throw error;
    }
  }

  // 5. Reviewing Node (Reviewer Role)
  private async reviewingNode(state: typeof AgentState.State) {
    logger.info("Starting reviewing step in LangGraph", { runId: state.runId, iteration: state.iteration });
    const run = await this.repository.getRun(state.runId);
    if (!run) throw new Error("Run not found");

    await this.repository.updateRunWorkflow({
      runId: state.runId,
      status: "reviewing",
      currentStep: "reviewing",
    });

    const step = await this.repository.createStep(state.runId, "reviewing");
    try {
      const prompt = reviewPrompt(state.task, state.plan, state.testReport, run.tokenBudgets.reviewer);
      await this.repository.addMessage({
        runId: state.runId,
        iteration: state.iteration,
        fromAgent: "orchestrator",
        toAgent: "reviewer",
        messageType: "instruction",
        content: prompt,
      });

      const providerName = run.providerMapping.reviewer;
      const provider = this.providers.get(providerName);
      await provider.validateAvailability();

      await this.repository.addEvent({
        runId: state.runId,
        eventType: "status",
        channel: providerName === "antigravity" ? "Antigravity" : "Codex",
        agentId: "reviewer",
        stepId: step.id,
        content: `${providerName} (reviewer) performing code review`,
      });

      const result = await provider.run({
        runId: state.runId,
        stepId: step.id,
        step: "reviewer",
        agentId: "reviewer",
        displayChannel: providerName === "antigravity" ? "Antigravity" : "Codex",
        workspacePath: state.workspacePath,
        tokenBudget: run.tokenBudgets.reviewer,
        prompt,
      });

      const parsedDecision = parseAgentDecision(result.text);

      await this.repository.addArtifact(state.runId, step.id, "review_report", `review-report-${state.iteration}.md`, result.text);
      await this.repository.addMessage({
        runId: state.runId,
        iteration: state.iteration,
        fromAgent: "reviewer",
        toAgent: parsedDecision.decision === "pass" ? "orchestrator" : "coder",
        messageType: "result",
        content: result.text,
        metadata: { decision: parsedDecision.decision },
      });

      await this.repository.finishStep(step.id, "succeeded");

      const nextIteration = parsedDecision.decision === "pass" ? state.iteration : state.iteration + 1;
      return {
        reviewReport: result.text,
        reviewerDecision: (parsedDecision.decision === "pass" ? "pass" : "needs_changes") as "pass" | "needs_changes",
        iteration: nextIteration,
      };
    } catch (error: any) {
      await this.repository.finishStep(step.id, "failed", "INTERNAL_ERROR", error.message);
      throw error;
    }
  }

  // Routing Edges
  private routeTester(state: typeof AgentState.State): string {
    if (state.testerDecision === "pass") {
      return "reviewing";
    }

    if (state.iteration >= state.maxIterations) {
      logger.warn(`Tester failed but iteration limit ${state.maxIterations} reached. Routing to Reviewer for diagnostics.`, { runId: state.runId });
      return "reviewing";
    }

    return "implementing";
  }

  private routeReviewer(state: typeof AgentState.State): string {
    if (state.reviewerDecision === "pass") {
      return "__end__";
    }

    if (state.iteration >= state.maxIterations) {
      logger.info(`Workflow completed maximum iterations. Pausing for human review.`, { runId: state.runId });
      return "__end__";
    }

    return "implementing";
  }
}
