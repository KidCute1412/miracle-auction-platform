import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { defineConfig } from "vitest/config";

const root = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: { alias: { "@": resolve(root, "src") } },
  test: {
    environment: "node",
    setupFiles: [resolve(root, "tests/setup/external-services.ts")],
    fileParallelism: false,
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      reportsDirectory: "coverage",
      include: ["src/modules/**/application/**/*.ts", "src/modules/**/domain/**/*.ts"],
      exclude: ["src/modules/**/infrastructure/**", "src/modules/**/api/**"],
      thresholds: {
        lines: 80,
      },
    },
  },
});
