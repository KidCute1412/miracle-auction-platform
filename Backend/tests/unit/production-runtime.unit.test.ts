import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("production runtime contract", () => {
  it("runs every production process from compiled JavaScript", async () => {
    const packageJson = JSON.parse(await readFile(resolve(process.cwd(), "package.json"), "utf8")) as { scripts: Record<string, string> };
    expect(packageJson.scripts["start:prod"]).toBe("node dist/server.js");
    expect(packageJson.scripts["auction-worker:prod"]).toBe("node dist/auction-worker.js");
    expect(packageJson.scripts["outbox-relay:prod"]).toBe("node dist/outbox-relay.js");
    expect(packageJson.scripts["async-worker:prod"]).toBe("node dist/async-worker.js");
  });

  it("closes all Redis connections after every compiled benchmark script", async () => {
    for (const script of ["seed-bidding-benchmark.ts", "clean-bidding-benchmark.ts", "check-bidding-invariants.ts"]) {
      const source = await readFile(resolve(process.cwd(), "src/scripts", script), "utf8");
      expect(source).toContain("closeRedisConnection()");
      expect(source).not.toContain("redisClient.quit()");
    }
  });
});
