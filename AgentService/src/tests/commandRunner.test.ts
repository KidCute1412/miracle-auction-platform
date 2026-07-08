import assert from "node:assert/strict";
import test from "node:test";
import { CommandRunner } from "../sandbox/commandRunner.js";

test("CommandRunner uses executable and args without shell interpolation", async () => {
  const runner = new CommandRunner({ timeoutMs: 5000, maxOutputBytes: 1024 });
  const result = await runner.run({
    executable: process.execPath,
    args: ["-e", "console.log(process.argv[1])", "literal && not-shell"],
    cwd: process.cwd(),
  });

  assert.equal(result.exitCode, 0);
  assert.equal(result.stdout.trim(), "literal && not-shell");
});

test("CommandRunner truncates output", async () => {
  const runner = new CommandRunner({ timeoutMs: 5000, maxOutputBytes: 5 });
  const result = await runner.run({
    executable: process.execPath,
    args: ["-e", "console.log('123456789')"],
    cwd: process.cwd(),
  });

  assert.equal(result.stdout, "12345");
});
