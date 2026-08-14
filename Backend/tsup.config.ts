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
    await cp("src/modules/bids/infrastructure/redis/auction-mutate.lua", "dist/auction-mutate.lua");
  },
});
