import test from "node:test";
import assert from "node:assert/strict";
import { LangGraphWorkflow } from "../workflow/langGraphWorkflow.js";
import type { AgentRepository } from "../storage/agent.repository.js";
import type { WorkspaceManager } from "../sandbox/workspaceManager.js";

test("LangGraphWorkflow compiles successfully with mock checkpointer", async () => {
  const mockRepo = {} as unknown as AgentRepository;
  const mockWorkspace = {} as unknown as WorkspaceManager;
  const mockProviders = {} as any;
  const workflow = new LangGraphWorkflow(mockRepo, mockWorkspace, mockProviders);

  const mockCheckpointer = {
    setup: async () => {},
    get: async () => null,
    put: async () => {},
  } as any;

  const graph = await workflow.compileGraph(mockCheckpointer);
  assert.ok(graph);
  assert.equal(typeof graph.invoke, "function");
});
