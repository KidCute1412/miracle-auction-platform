import fs from "node:fs/promises";
import path from "node:path";

export interface ContextFileEntry {
  path: string;
  bytes: number;
}

export interface ContextPack {
  summary: string;
  files: ContextFileEntry[];
  packageScripts: Record<string, Record<string, string>>;
  constraints: string[];
}

const ignoredDirs = new Set([".git", "node_modules", "dist", ".agent-workspaces"]);
const interestingExtensions = new Set([".ts", ".tsx", ".js", ".jsx", ".json", ".md", ".yml", ".yaml", ".sql"]);

const walk = async (root: string, current: string, entries: ContextFileEntry[]): Promise<void> => {
  const dirents = await fs.readdir(current, { withFileTypes: true });
  for (const dirent of dirents) {
    if (ignoredDirs.has(dirent.name)) {
      continue;
    }
    const fullPath = path.join(current, dirent.name);
    if (dirent.isDirectory()) {
      await walk(root, fullPath, entries);
      continue;
    }
    if (!dirent.isFile() || !interestingExtensions.has(path.extname(dirent.name))) {
      continue;
    }
    const stat = await fs.stat(fullPath);
    entries.push({
      path: path.relative(root, fullPath).replaceAll("\\", "/"),
      bytes: stat.size,
    });
  }
};

const readPackageScripts = async (root: string, packagePath: string): Promise<Record<string, string>> => {
  try {
    const raw = await fs.readFile(path.join(root, packagePath), "utf8");
    const parsed = JSON.parse(raw) as { scripts?: Record<string, string> };
    return parsed.scripts ?? {};
  } catch {
    return {};
  }
};

export class ContextIndexer {
  public async build(root: string): Promise<ContextPack> {
    const files: ContextFileEntry[] = [];
    await walk(root, root, files);
    files.sort((left, right) => left.path.localeCompare(right.path));

    const packageScripts: Record<string, Record<string, string>> = {};
    for (const file of files.filter((entry) => entry.path.endsWith("package.json"))) {
      packageScripts[file.path] = await readPackageScripts(root, file.path);
    }

    return {
      summary: `Repository context pack with ${files.length} tracked source/config/docs files.`,
      files: files.slice(0, 500),
      packageScripts,
      constraints: [
        "Use isolated workspace only.",
        "Persist diff/test/review artifacts before human approval.",
        "Keep context compact and pass summaries between agents.",
      ],
    };
  }
}
