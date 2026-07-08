import fs from "node:fs/promises";
import path from "node:path";
import { PathGuard } from "./pathGuard.js";

const excludedNames = new Set([".git", "node_modules", "dist", ".agent-workspaces"]);

export class WorkspaceManager {
  private readonly guard: PathGuard;

  public constructor(
    workspaceRoot: string,
    private readonly repoRoot: string,
  ) {
    this.guard = new PathGuard(workspaceRoot);
  }

  public async createWorkspace(runId: string): Promise<string> {
    const workspacePath = this.guard.resolveInside(runId);
    await fs.rm(workspacePath, { recursive: true, force: true });
    await fs.mkdir(workspacePath, { recursive: true });
    await fs.cp(path.resolve(this.repoRoot), workspacePath, {
      recursive: true,
      filter: (source) => !excludedNames.has(path.basename(source)),
    });
    return workspacePath;
  }
}
