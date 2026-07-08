import path from "node:path";
import { loadConfig } from "./config/env.js";
import { createProviderRegistry } from "./providers/providerRegistry.js";
import { WorkspaceManager } from "./sandbox/workspaceManager.js";
import { AgentRepository } from "./storage/agent.repository.js";
import { createPool } from "./storage/database.js";
import { AgentWorkflow } from "./workflow/agentWorkflow.js";
import { logger } from "./shared/logger.js";

const config = loadConfig();
const pool = createPool(config);
const repository = new AgentRepository(pool);
const providers = createProviderRegistry(config, async (input, result) => {
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
});
const workspaceManager = new WorkspaceManager(path.resolve(config.workspaceRoot), path.resolve(config.repoRoot));
const workflow = new AgentWorkflow(repository, providers, workspaceManager);

let stopping = false;

const poll = async (): Promise<void> => {
  while (!stopping) {
    const run = await repository.claimNextRun();
    if (run) {
      await workflow.run(run);
      continue;
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

logger.info("agent worker started");
void poll().catch(async (error: unknown) => {
  logger.error("agent worker crashed", { message: error instanceof Error ? error.message : "Unknown error" });
  await pool.end();
  process.exit(1);
});
