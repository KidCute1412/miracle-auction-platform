import fs from "node:fs/promises";
import path from "node:path";
import { execSync } from "node:child_process";
import { PathGuard } from "./pathGuard.js";
import { logger } from "../shared/logger.js";

const excludedNames = new Set([".git", "node_modules", "dist", ".agent-workspaces"]);

export class WorkspaceManager {
  private readonly guard: PathGuard;
  private readonly workspaceRoot: string;

  public constructor(
    workspaceRoot: string,
    private readonly repoRoot: string,
  ) {
    this.workspaceRoot = path.resolve(workspaceRoot);
    this.guard = new PathGuard(workspaceRoot);
  }

  public async createWorkspace(runId: string): Promise<string> {
    const workspacePath = this.guard.resolveInside(runId);
    await fs.rm(workspacePath, { recursive: true, force: true });
    await fs.mkdir(workspacePath, { recursive: true });
    const sourceRoot = path.resolve(this.repoRoot);
    await this.copyDirectory(sourceRoot, workspacePath);
    await this.linkDependencyDirectories(sourceRoot, workspacePath);
    await this.initializeGitRepository(workspacePath);
    return workspacePath;
  }

  private async copyDirectory(sourceRoot: string, destinationRoot: string): Promise<void> {
    const dirents = await fs.readdir(sourceRoot, { withFileTypes: true });
    for (const dirent of dirents) {
      if (excludedNames.has(dirent.name)) {
        continue;
      }

      const sourcePath = path.join(sourceRoot, dirent.name);
      if (this.isInsideWorkspaceRoot(sourcePath)) {
        continue;
      }

      const destinationPath = path.join(destinationRoot, dirent.name);
      if (dirent.isDirectory()) {
        await fs.mkdir(destinationPath, { recursive: true });
        await this.copyDirectory(sourcePath, destinationPath);
        continue;
      }

      if (dirent.isFile()) {
        await fs.copyFile(sourcePath, destinationPath);
      }
    }
  }

  private isInsideWorkspaceRoot(sourcePath: string): boolean {
    const relativePath = path.relative(this.workspaceRoot, path.resolve(sourcePath));
    return relativePath === "" || (!relativePath.startsWith("..") && !path.isAbsolute(relativePath));
  }

  private async linkDependencyDirectories(sourceRoot: string, workspacePath: string): Promise<void> {
    const packageDirs = await this.findPackageDirs(sourceRoot);
    for (const packageDir of packageDirs) {
      const sourceNodeModules = path.join(packageDir, "node_modules");
      if (!(await this.pathExists(sourceNodeModules))) {
        continue;
      }

      const relativePackageDir = path.relative(sourceRoot, packageDir);
      const destinationPackageDir = path.join(workspacePath, relativePackageDir);
      const destinationNodeModules = path.join(destinationPackageDir, "node_modules");
      await fs.mkdir(destinationPackageDir, { recursive: true });
      await fs.rm(destinationNodeModules, { recursive: true, force: true });
      await fs.symlink(sourceNodeModules, destinationNodeModules, "junction");
    }
  }

  private async findPackageDirs(root: string): Promise<string[]> {
    const packageDirs: string[] = [];
    const walk = async (current: string): Promise<void> => {
      const dirents = await fs.readdir(current, { withFileTypes: true });
      if (dirents.some((dirent) => dirent.isFile() && dirent.name === "package.json")) {
        packageDirs.push(current);
      }

      for (const dirent of dirents) {
        if (!dirent.isDirectory() || excludedNames.has(dirent.name)) {
          continue;
        }
        const childPath = path.join(current, dirent.name);
        if (!this.isInsideWorkspaceRoot(childPath)) {
          await walk(childPath);
        }
      }
    };

    await walk(root);
    return packageDirs;
  }

  private async pathExists(targetPath: string): Promise<boolean> {
    try {
      await fs.access(targetPath);
      return true;
    } catch {
      return false;
    }
  }

  private async initializeGitRepository(workspacePath: string): Promise<void> {
    try {
      logger.info("Initializing local Git repository in workspace sandbox", { workspacePath });
      execSync("git init", { cwd: workspacePath, stdio: "ignore" });
      execSync('git config user.name "Agent"', { cwd: workspacePath, stdio: "ignore" });
      execSync('git config user.email "agent@local"', { cwd: workspacePath, stdio: "ignore" });
      execSync("git add .", { cwd: workspacePath, stdio: "ignore" });
      execSync('git commit -m "initial commit" --no-verify', { cwd: workspacePath, stdio: "ignore" });
    } catch (error) {
      logger.warn("Failed to initialize git repository in workspace", { workspacePath, error });
    }
  }
}
