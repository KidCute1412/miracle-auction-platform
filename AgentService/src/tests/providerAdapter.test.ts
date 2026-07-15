import assert from "node:assert/strict";
import test from "node:test";
import type { CommandExecutor, CommandInput, CommandResult } from "../sandbox/commandRunner.js";
import { CliProviderAdapter } from "../providers/cliProviderAdapter.js";

class FakeRunner implements CommandExecutor {
  public lastInput: CommandInput | null = null;

  public async run(input: CommandInput): Promise<CommandResult> {
    this.lastInput = input;
    return {
      executable: input.executable,
      args: input.args,
      cwd: input.cwd,
      pid: 123,
      exitCode: 0,
      stdout: "ok",
      stderr: "",
      durationMs: 1,
      timedOut: false,
    };
  }
}

test("CliProviderAdapter constructs a stdin-based command", async () => {
  const runner = new FakeRunner();
  const adapter = new CliProviderAdapter(
    {
      name: "codex",
      executable: "codex",
      capabilities: ["coder"],
      baseArgs: ["exec", "--stdin"],
    },
    runner,
  );

  const result = await adapter.run({
    runId: "run-1",
    stepId: "step-1",
    step: "coder",
    agentId: "coder",
    displayChannel: "Codex",
    prompt: "do work",
    workspacePath: process.cwd(),
    tokenBudget: 1000,
  });

  assert.equal(result.text, "ok");
  assert.deepEqual(runner.lastInput?.args, ["exec", "--stdin"]);
  assert.equal(runner.lastInput?.stdin, "do work");
  assert.equal(runner.lastInput?.env?.AGENT_TOKEN_BUDGET, "1000");
});
