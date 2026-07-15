import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { AgentRunService } from "../api/agentRun.service.js";
import type { AgentRepository } from "../storage/agent.repository.js";
import type { AgentRun } from "../shared/types.js";

const baseRun: AgentRun = {
  id: "00000000-0000-0000-0000-000000000001",
  task: "Implement a useful agent workflow",
  status: "waiting_approval",
  currentStep: "waiting_approval",
  providerMapping: {
    planner: "antigravity",
    coder: "codex",
    implementer: "codex",
    tester: "codex",
    reviewer: "codex",
  },
  tokenBudgets: {
    planner: 6000,
    coder: 10000,
    implementer: 10000,
    tester: 5000,
    reviewer: 5000,
  },
  projectConfig: null,
  workflowState: null,
  iteration: 0,
  workspacePath: null,
  activePid: null,
  errorCode: null,
  errorMessage: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

test("AgentRunService approves only waiting_approval runs", async () => {
  const tempBase = process.cwd();
  const tempRoot = await fs.mkdtemp(path.join(tempBase, "agent-approve-"));

  try {
    const repoRoot = path.join(tempRoot, "repo");
    const workspaceRoot = path.join(tempRoot, "workspace");
    await fs.mkdir(repoRoot, { recursive: true });
    await fs.mkdir(workspaceRoot, { recursive: true });
    await fs.writeFile(path.join(repoRoot, "note.txt"), "before\n");
    await fs.writeFile(path.join(workspaceRoot, "note.txt"), "after\n");
    const run = {
      ...baseRun,
      workspacePath: workspaceRoot,
      projectConfig: {
        projectName: "test",
        repoRoot,
        workspaceRoot,
        maxIterations: 3,
        maxChangedFiles: 5,
        providers: {},
      },
    };
    const repo = {
      getRun: async () => run,
      addArtifact: async () => ({ id: "artifact-1" }),
      addEvent: async () => ({ id: "event-1" }),
      approveRun: async () => undefined,
      updateRunStatus: async () => ({ ...baseRun, status: "succeeded", currentStep: null }),
    } as unknown as Pick<AgentRepository, "getRun" | "addArtifact" | "addEvent" | "approveRun" | "updateRunStatus">;
    const service = new AgentRunService(repo as AgentRepository, repoRoot, 5);
    const approved = await service.approveRun(baseRun.id, "human", null);
    assert.equal(approved.status, "succeeded");
    assert.equal((await fs.readFile(path.join(repoRoot, "note.txt"), "utf8")).replace(/\r\n/g, "\n"), "after\n");
  } finally {
    await fs.rm(tempRoot, { recursive: true, force: true });
  }
});

test("AgentRunService rejects approval for active runs", async () => {
  const repo = {
    getRun: async () => ({ ...baseRun, status: "testing" }),
  } as Pick<AgentRepository, "getRun">;
  const service = new AgentRunService(repo as AgentRepository);
  await assert.rejects(() => service.approveRun(baseRun.id, "human", null), /Only runs waiting/);
});
