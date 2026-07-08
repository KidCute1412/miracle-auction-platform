import fs from "node:fs/promises";
import path from "node:path";
import pg from "pg";
import { loadConfig } from "../config/env.js";
import { createPool } from "../storage/database.js";
import { logger } from "../shared/logger.js";

const quoteIdentifier = (value: string): string => `"${value.replaceAll('"', '""')}"`;

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
  await ensureDatabaseExists(config.databaseUrl);
  const pool = createPool(config);
  const migrationPath = path.resolve("migrations", "001_agent_service_schema.sql");
  const sql = await fs.readFile(migrationPath, "utf8");

  try {
    await pool.query(sql);
    logger.info("agent service migration applied", { migrationPath });
  } finally {
    await pool.end();
  }
};

void run().catch((error: unknown) => {
  logger.error("agent service migration failed", {
    message: error instanceof Error ? error.message : "Unknown error",
  });
  process.exit(1);
});
