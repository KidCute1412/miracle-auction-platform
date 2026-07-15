import { loadConfig } from "./config/env.js";
import { createApp } from "./api/app.js";
import { createPool } from "./storage/database.js";
import { logger } from "./shared/logger.js";

const config = loadConfig();
const pool = createPool(config);
const app = createApp(pool, config);

const server = app.listen(config.port, () => {
  logger.info("agent service listening", { port: config.port });
});

const shutdown = async (signal: string): Promise<void> => {
  logger.info("agent service shutting down", { signal });
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
};

process.on("SIGTERM", () => {
  void shutdown("SIGTERM");
});

process.on("SIGINT", () => {
  void shutdown("SIGINT");
});
