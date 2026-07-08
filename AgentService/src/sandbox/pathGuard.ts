import path from "node:path";

export class PathGuard {
  public readonly root: string;

  public constructor(root: string) {
    this.root = path.resolve(root);
  }

  public resolveInside(relativePath: string): string {
    const resolved = path.resolve(this.root, relativePath);
    this.assertInside(resolved);
    return resolved;
  }

  public assertInside(candidatePath: string): void {
    const resolved = path.resolve(candidatePath);
    const relative = path.relative(this.root, resolved);
    if (relative.startsWith("..") || path.isAbsolute(relative)) {
      throw new Error(`Path escapes sandbox root: ${candidatePath}`);
    }
  }
}
