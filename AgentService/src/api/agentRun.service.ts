import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { loadProjectConfig } from "../config/projectConfig.js";
import { invalidState, notFound } from "../shared/errors.js";
import type { AgentRepository } from "../storage/agent.repository.js";
import type { AgentArtifact, AgentEvent, AgentMessage, AgentRun, CreateRunData, CreateRunInput } from "../shared/types.js";

export class AgentRunService {
  public constructor(
    private readonly repository: AgentRepository,
    private readonly repoRoot = path.resolve(process.cwd(), ".."),
    private readonly maxChangedFiles = 80,
  ) {}

  public async createRun(input: CreateRunInput): Promise<CreateRunData> {
    const projectConfig = loadProjectConfig(this.repoRoot, input.projectConfigPath);
    const run = await this.repository.createRun(input);
    await this.repository.updateRunWorkflow({
      runId: run.id,
      projectConfig: projectConfig as unknown as Record<string, unknown>,
      workflowState: "queued",
    });
    await this.repository.addEvent({
      runId: run.id,
      eventType: "status",
      channel: "orchestrator",
      agentId: "orchestrator",
      stepId: null,
      content: "queued",
      metadata: { projectName: projectConfig.projectName },
    });
    return {
      id: run.id,
      status: run.status,
      providerMapping: run.providerMapping,
      tokenBudgets: run.tokenBudgets,
    };
  }

  public async getRun(id: string): Promise<AgentRun> {
    const run = await this.repository.getRun(id);
    if (!run) {
      throw notFound("Agent run not found");
    }
    return run;
  }

  public async listArtifacts(id: string): Promise<AgentArtifact[]> {
    await this.getRun(id);
    return this.repository.listArtifacts(id);
  }

  public async listMessages(id: string): Promise<AgentMessage[]> {
    await this.getRun(id);
    return this.repository.listMessages(id);
  }

  public async listEvents(id: string, afterSequence: number): Promise<AgentEvent[]> {
    await this.getRun(id);
    return this.repository.listEvents(id, afterSequence);
  }

  public async listRecentRuns(limit: number): Promise<AgentRun[]> {
    return this.repository.listRecentRuns(limit);
  }

  public async approveRun(id: string, reviewer: string, note: string | null): Promise<AgentRun> {
    const run = await this.getRun(id);
    if (run.status !== "waiting_approval") {
      throw invalidState("Only runs waiting for approval can be approved");
    }
    const patch = await this.createWorkspacePatch(run);
    const patchArtifact = await this.repository.addArtifact(id, null, "patch", "workspace.patch", patch.content, {
      changedFiles: patch.changedFiles,
    });
    await this.applyPatch(patch.content, patch.repoRoot);
    await this.repository.approveRun(id, reviewer, note);
    await this.repository.addEvent({
      runId: id,
      eventType: "artifact",
      channel: "orchestrator",
      agentId: "orchestrator",
      stepId: null,
      content: "patch applied",
      metadata: { artifactId: patchArtifact.id, changedFiles: patch.changedFiles },
    });
    const updated = await this.repository.updateRunStatus(id, "succeeded", null);
    if (!updated) {
      throw notFound("Agent run not found");
    }
    return updated;
  }

  public async cancelRun(id: string): Promise<AgentRun> {
    const run = await this.getRun(id);
    if (run.activePid) {
      try {
        process.kill(run.activePid, "SIGTERM");
      } catch {
        // The child may already have exited; the DB status update below is still authoritative.
      }
      await this.repository.clearActiveProcess(id, run.activePid);
    }
    const cancelled = await this.repository.cancelRun(id);
    if (!cancelled) {
      throw invalidState("Only queued or active runs can be cancelled");
    }
    return cancelled;
  }

  private async createWorkspacePatch(run: AgentRun): Promise<{ content: string; changedFiles: number; repoRoot: string }> {
    if (!run.workspacePath) {
      throw invalidState("Run has no workspace path to approve");
    }
    const repoRoot = path.resolve(run.projectConfig?.repoRoot ?? this.repoRoot);
    const workspacePath = path.resolve(run.workspacePath);
    const changedFiles = await this.countChangedFiles(repoRoot, workspacePath);
    const limit = run.projectConfig?.maxChangedFiles ?? this.maxChangedFiles;
    if (changedFiles > limit) {
      throw invalidState(`Workspace diff changes ${changedFiles} files, exceeding maxChangedFiles ${limit}`);
    }
    if (changedFiles === 0) {
      throw invalidState("Workspace diff is empty");
    }
    const rawPatch = await this.runCommand("git", ["diff", "--no-index", "--binary", "--", repoRoot, workspacePath], repoRoot, true);
    return { content: this.rewriteNoIndexPatch(rawPatch.stdout, repoRoot, workspacePath), changedFiles, repoRoot };
  }

  private async countChangedFiles(repoRoot: string, workspacePath: string): Promise<number> {
    const repoFiles = await this.listFiles(repoRoot);
    const workspaceFiles = await this.listFiles(workspacePath);
    const allFiles = new Set([...repoFiles.keys(), ...workspaceFiles.keys()]);
    let changed = 0;
    for (const relativePath of allFiles) {
      const repoHash = repoFiles.get(relativePath);
      const workspaceHash = workspaceFiles.get(relativePath);
      if (repoHash !== workspaceHash) {
        changed += 1;
      }
    }
    return changed;
  }

  private async listFiles(root: string): Promise<Map<string, string>> {
    const files = new Map<string, string>();
    const excluded = new Set([".git", "node_modules", "dist", ".agent-workspaces"]);
    const walk = async (dir: string): Promise<void> => {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (excluded.has(entry.name)) {
          continue;
        }
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          await walk(fullPath);
          continue;
        }
        if (entry.isFile()) {
          const relativePath = path.relative(root, fullPath).replace(/\\/g, "/");
          const content = await fs.readFile(fullPath);
          files.set(relativePath, createHash("sha256").update(content).digest("hex"));
        }
      }
    };
    await walk(root);
    return files;
  }

  private rewriteNoIndexPatch(patch: string, repoRoot: string, workspacePath: string): string {
    const repoPrefix = repoRoot.replace(/\\/g, "/");
    const workspacePrefix = workspacePath.replace(/\\/g, "/");
    return patch
      .replace(/\\\\/g, "/")
      .replace(/\\/g, "/")
      .split(`a/${repoPrefix}/`).join("a/")
      .split(`b/${repoPrefix}/`).join("b/")
      .split(`a/${workspacePrefix}/`).join("a/")
      .split(`b/${workspacePrefix}/`).join("b/")
      .split(`${repoPrefix}/`).join("a/")
      .split(`${workspacePrefix}/`).join("b/");
  }

  private async applyPatch(patchContent: string, repoRoot: string): Promise<void> {
    await this.runCommand("git", ["apply", "--whitespace=nowarn", "-"], repoRoot, false, patchContent);
  }

  private async runCommand(
    executable: string,
    args: string[],
    cwd: string,
    allowExitOne: boolean,
    stdin?: string,
  ): Promise<{ stdout: string; stderr: string }> {
    return new Promise((resolve, reject) => {
      const child = spawn(executable, args, {
        cwd,
        env: { ...process.env, GIT_DIR: "void" },
        windowsHide: true,
      });
      let stdout = "";
      let stderr = "";
      child.stdout.on("data", (chunk: Buffer) => {
        stdout += chunk.toString("utf8");
      });
      child.stderr.on("data", (chunk: Buffer) => {
        stderr += chunk.toString("utf8");
      });
      child.on("error", reject);
      child.on("close", (exitCode) => {
        if (exitCode === 0 || (allowExitOne && exitCode === 1)) {
          resolve({ stdout, stderr });
          return;
        }
        reject(invalidState(`${executable} ${args.join(" ")} failed: ${stderr || `exit ${exitCode}`}`));
      });
      if (stdin) {
        child.stdin.write(stdin);
      }
      child.stdin.end();
    });
  }
}
