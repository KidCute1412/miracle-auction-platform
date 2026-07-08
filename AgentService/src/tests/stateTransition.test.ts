import assert from "node:assert/strict";
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
    implementer: "codex",
    tester: "codex",
    reviewer: "codex",
  },
  tokenBudgets: {
    planner: 6000,
    implementer: 10000,
    tester: 5000,
    reviewer: 5000,
  },
  errorCode: null,
  errorMessage: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

test("AgentRunService approves only waiting_approval runs", async () => {
  const repo = {
    getRun: async () => baseRun,
    approveRun: async () => undefined,
    updateRunStatus: async () => ({ ...baseRun, status: "succeeded", currentStep: null }),
  } as Pick<AgentRepository, "getRun" | "approveRun" | "updateRunStatus">;
  const service = new AgentRunService(repo as AgentRepository);
  const approved = await service.approveRun(baseRun.id, "human", null);
  assert.equal(approved.status, "succeeded");
});

test("AgentRunService rejects approval for active runs", async () => {
  const repo = {
    getRun: async () => ({ ...baseRun, status: "testing" }),
  } as Pick<AgentRepository, "getRun">;
  const service = new AgentRunService(repo as AgentRepository);
  await assert.rejects(() => service.approveRun(baseRun.id, "human", null), /Only runs waiting/);
});
