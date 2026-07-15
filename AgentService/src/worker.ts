import path from "node:path";
import { loadConfig } from "./config/env.js";
import { loadProjectConfig } from "./config/projectConfig.js";
import { createProviderRegistry } from "./providers/providerRegistry.js";
import { WorkspaceManager } from "./sandbox/workspaceManager.js";
import { AgentRepository } from "./storage/agent.repository.js";
import { createPool } from "./storage/database.js";
import { LangGraphWorkflow } from "./workflow/langGraphWorkflow.js";
import { PostgresSaver } from "@langchain/langgraph-checkpoint-postgres";
import { logger } from "./shared/logger.js";

const config = loadConfig();
const pool = createPool(config);
const repository = new AgentRepository(pool);

const workspaceManager = new WorkspaceManager(
  path.resolve(config.workspaceRoot),
  path.resolve(config.repoRoot)
);

let stopping = false;
let checkpointer: PostgresSaver | null = null;

const initializeWorkflow = async (): Promise<void> => {
  checkpointer = new PostgresSaver(pool);
  await checkpointer.setup();
  logger.info("LangGraph checkpointer database tables initialized");
};

const poll = async (): Promise<void> => {
  while (!stopping) {
    try {
      const run = await repository.claimNextRun();
      if (run) {
        if (!checkpointer) {
          throw new Error("Checkpointer is not initialized yet");
        }

        logger.info("Executing claimed run via LangGraph", { runId: run.id });

        // Instantiate run-specific ProviderRegistry
        const providers = createProviderRegistry(config, run.projectConfig ?? loadProjectConfig(config.repoRoot), {
          auditHook: async (input, result) => {
            const stdoutArtifact =
              result.stdout.length > 0
                ? await repository.addArtifact(input.runId, input.stepId, "command_stdout", `${input.step}-stdout.txt`, result.stdout)
                : null;
            const stderrArtifact =
              result.stderr.length > 0
                ? await repository.addArtifact(input.runId, input.stepId, "command_stderr", `${input.step}-stderr.txt`, result.stderr)
                : null;
            await repository.recordCommandAudit({
              runId: input.runId,
              stepId: input.stepId,
              executable: result.executable,
              args: result.args,
              cwd: result.cwd,
              exitCode: result.exitCode,
              durationMs: result.durationMs,
              stdoutArtifactId: stdoutArtifact?.id ?? null,
              stderrArtifactId: stderrArtifact?.id ?? null,
            });
          },
          onCommandStart: async (input, pid) => {
            if (input.runId && pid > 0) {
              await repository.updateRunWorkflow({ runId: input.runId, activePid: pid });
            }
          },
          onCommandOutput: async (input, stream, chunk) => {
            if (!input.runId) {
              return;
            }
            await repository.addEvent({
              runId: input.runId,
              eventType: stream,
              channel: input.channel ?? input.agentId ?? "provider",
              agentId: input.agentId === "planner" || input.agentId === "coder" || input.agentId === "tester" || input.agentId === "reviewer" ? input.agentId : null,
              stepId: input.stepId ?? null,
              content: chunk,
            });
          },
          onCommandFinish: async (input, result) => {
            if (input.runId) {
              if (result.pid) {
                await repository.clearActiveProcess(input.runId, result.pid);
              }
              await repository.addEvent({
                runId: input.runId,
                eventType: result.exitCode === 0 ? "status" : "error",
                channel: input.channel ?? input.agentId ?? "provider",
                agentId: input.agentId === "planner" || input.agentId === "coder" || input.agentId === "tester" || input.agentId === "reviewer" ? input.agentId : null,
                stepId: input.stepId ?? null,
                content: `command exited with ${result.exitCode ?? "unknown"}`,
                metadata: { durationMs: result.durationMs, timedOut: result.timedOut },
              });
            }
          },
        });

        const workflowEngine = new LangGraphWorkflow(repository, workspaceManager, providers);
        const compiledGraph = await workflowEngine.compileGraph(checkpointer);

        const threadId = run.id;
        const workflowConfig = { configurable: { thread_id: threadId } };
        const initialState = {
          runId: run.id,
          task: run.task,
          workspacePath: run.workspacePath ?? "",
          plan: "",
          implementationSummary: "",
          testReport: "",
          reviewReport: "",
          iteration: 1,
          maxIterations: run.projectConfig?.maxIterations ?? 3,
        };

        await compiledGraph.invoke(initialState, workflowConfig);

        // After successful completion of review or transition to approval:
        const finalRun = await repository.getRun(run.id);
        if (finalRun && (finalRun.status === "reviewing" || finalRun.status === "implementing")) {
          // If the reviewer passed, update the status to waiting_approval
          await repository.updateRunWorkflow({
            runId: run.id,
            status: "waiting_approval",
            currentStep: "waiting_approval",
          });
          await repository.addEvent({
            runId: run.id,
            eventType: "status",
            channel: "orchestrator",
            agentId: "orchestrator",
            stepId: null,
            content: "review passed; waiting for human approval",
          });
          logger.info("agent workflow waiting for approval", { runId: run.id });
        }
        continue;
      }
    } catch (error: any) {
      logger.error("error in worker poll loop, retrying", {
        message: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      });
    }
    await new Promise((resolve) => setTimeout(resolve, config.pollIntervalMs));
  }
};

const shutdown = async (signal: string): Promise<void> => {
  stopping = true;
  logger.info("agent worker shutting down", { signal });
  await pool.end();
  process.exit(0);
};

process.on("SIGTERM", () => {
  void shutdown("SIGTERM");
});

process.on("SIGINT", () => {
  void shutdown("SIGINT");
});

logger.info("agent worker starting");
initializeWorkflow()
  .then(() => {
    void poll().catch(async (error: unknown) => {
      logger.error("agent worker crashed in poll loop", { message: error instanceof Error ? error.message : "Unknown error" });
      await pool.end();
      process.exit(1);
    });
  })
  .catch(async (error: unknown) => {
    logger.error("agent worker failed during initialization", { message: error instanceof Error ? error.message : "Unknown error" });
    await pool.end();
    process.exit(1);
  });
