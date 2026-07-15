import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { loadProjectConfig } from "../config/projectConfig.js";
import { parseAgentDecision } from "../workflow/agentWorkflow.js";

test("loadProjectConfig reads project config and resolves relative roots", async () => {
  const tempBase = process.cwd();
  const root = await fs.mkdtemp(path.join(tempBase, "agent-config-"));

  try {
    await fs.writeFile(
      path.join(root, ".agentservice.json"),
      JSON.stringify({
        projectName: "Reusable Agent",
        repoRoot: ".",
        workspaceRoot: "AgentService/.agent-workspaces",
        maxIterations: 4,
        providers: {
          codex: {
            command: "codex",
            args: ["exec", "-"],
            capabilities: ["coder", "tester", "reviewer"],
          },
        },
      }),
    );

    const config = loadProjectConfig(root);
    assert.equal(config.projectName, "Reusable Agent");
    assert.equal(config.maxIterations, 4);
    assert.equal(config.repoRoot, root);
    assert.equal(config.workspaceRoot, path.join(root, "AgentService", ".agent-workspaces"));
    assert.deepEqual(config.providers.codex.args, ["exec", "-"]);
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
});

test("parseAgentDecision defaults to pass and reads explicit failures", () => {
  assert.deepEqual(parseAgentDecision("looks good"), { decision: "pass", target: null });
  assert.deepEqual(parseAgentDecision("AGENT_DECISION: fail\nAGENT_TARGET: coder"), {
    decision: "fail",
    target: "coder",
  });
});
