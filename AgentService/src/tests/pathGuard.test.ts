import assert from "node:assert/strict";
import test from "node:test";
import path from "node:path";
import { PathGuard } from "../sandbox/pathGuard.js";

test("PathGuard allows paths inside root", () => {
  const guard = new PathGuard(path.join(process.cwd(), "sandbox-root"));
  const resolved = guard.resolveInside("run-1/file.txt");
  assert.match(resolved, /sandbox-root/);
});

test("PathGuard rejects paths outside root", () => {
  const guard = new PathGuard(path.join(process.cwd(), "sandbox-root"));
  assert.throws(() => guard.resolveInside("../outside.txt"), /escapes sandbox root/);
});
