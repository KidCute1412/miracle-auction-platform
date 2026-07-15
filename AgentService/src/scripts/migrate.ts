import fs from "node:fs/promises";
import path from "node:path";
import pg from "pg";
import { loadConfig } from "../config/env.js";
import { createPool } from "../storage/database.js";
import { logger } from "../shared/logger.js";

const maxAttempts = 30;
const retryDelayMs = 2000;

const quoteIdentifier = (value: string): string => `"${value.replaceAll('"', '""')}"`;

const sleep = async (durationMs: number): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, durationMs));
};

const withRetry = async (label: string, action: () => Promise<void>): Promise<void> => {
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      await action();
      return;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      if (message.toLowerCase().includes("password authentication failed")) {
        throw new Error(
          `${label} failed because DATABASE_URL credentials were rejected. ` +
            "Update AgentService/.env DATABASE_URL to match the Postgres running on localhost:5432, " +
            "or stop that Postgres so Docker Compose can start the project Postgres.",
        );
      }
      if (attempt === maxAttempts) {
        throw error;
      }
      logger.warn(`${label} not ready, retrying`, {
        attempt,
        maxAttempts,
        retryDelayMs,
        message,
      });
      await sleep(retryDelayMs);
    }
  }
};

const ensureDatabaseExists = async (databaseUrl: string): Promise<void> => {
  const parsed = new URL(databaseUrl);
  const databaseName = decodeURIComponent(parsed.pathname.replace(/^\//, ""));

  if (!databaseName || databaseName === "postgres") {
    return;
  }

  if (!/^[A-Za-z0-9_-]+$/.test(databaseName)) {
    throw new Error(`Unsupported database name: ${databaseName}`);
  }

  parsed.pathname = "/postgres";
  const maintenancePool = new pg.Pool({ connectionString: parsed.toString() });

  try {
    const existing = await maintenancePool.query("select 1 from pg_database where datname = $1", [databaseName]);
    if (existing.rowCount === 0) {
      await maintenancePool.query(`create database ${quoteIdentifier(databaseName)}`);
      logger.info("agent service database created", { databaseName });
    }
  } finally {
    await maintenancePool.end();
  }
};

const run = async (): Promise<void> => {
  const config = loadConfig();
  const migrationPath = path.resolve("migrations", "001_agent_service_schema.sql");
  const sql = await fs.readFile(migrationPath, "utf8");

  await withRetry("postgres maintenance connection", async () => {
    await ensureDatabaseExists(config.databaseUrl);
  });

  await withRetry("agent database migration", async () => {
    const pool = createPool(config);
    try {
      await pool.query(sql);
      logger.info("agent service migration applied", { migrationPath });
    } finally {
      await pool.end();
    }
  });
};

void run().catch((error: unknown) => {
  logger.error("agent service migration failed", {
    message: error instanceof Error ? error.message : "Unknown error",
  });
  process.exit(1);
});
