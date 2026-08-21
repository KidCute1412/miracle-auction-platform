import { cp } from "node:fs/promises";
import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    server: "src/server.ts",
    "auction-worker": "src/auction-worker.ts",
    "outbox-relay": "src/outbox-relay.ts",
    "async-worker": "src/async-worker.ts",
    "scripts/seed-bidding-benchmark": "src/scripts/seed-bidding-benchmark.ts",
    "scripts/clean-bidding-benchmark": "src/scripts/clean-bidding-benchmark.ts",
    "scripts/check-bidding-invariants": "src/scripts/check-bidding-invariants.ts",
  },
  format: ["esm"],
  platform: "node",
  target: "node20",
  bundle: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  dts: false,
  outExtension: () => ({ js: ".js" }),
  async onSuccess() {
    await Promise.all([
      cp("src/modules/bids/infrastructure/redis/auction-mutate.lua", "dist/auction-mutate.lua"),
      cp("src/modules/bids/infrastructure/redis/auction-bootstrap.lua", "dist/auction-bootstrap.lua"),
      // Benchmark entrypoints are emitted below dist/scripts, so import.meta.url
      // resolves Lua assets relative to that directory in the bundled image.
      cp("src/modules/bids/infrastructure/redis/auction-mutate.lua", "dist/scripts/auction-mutate.lua"),
      cp("src/modules/bids/infrastructure/redis/auction-bootstrap.lua", "dist/scripts/auction-bootstrap.lua"),
    ]);
  },
});
