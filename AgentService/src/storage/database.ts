import pg from "pg";
import type { AgentServiceConfig } from "../config/env.js";

export type Queryable = Pick<pg.Pool, "query">;

export const createPool = (config: AgentServiceConfig): pg.Pool => {
  const pool = new pg.Pool({
    connectionString: config.databaseUrl,
    max: 10,
    connectionTimeoutMillis: 5_000,
    query_timeout: 15_000,
    statement_timeout: 15_000,
    idleTimeoutMillis: 30_000,
    keepAlive: true,
    keepAliveInitialDelayMillis: 10_000,
  });

  const originalQuery = pool.query.bind(pool);
  
  // Resilient query wrapper to retry on connection drops
  pool.query = (async function(this: pg.Pool, queryTextOrConfig: any, values?: any) {
    try {
      return await originalQuery(queryTextOrConfig, values);
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      if (
        message.includes("ECONNRESET") ||
        message.includes("EPIPE") ||
        message.includes("terminated unexpectedly")
      ) {
        console.warn(`[database] Connection reset/EPIPE error, retrying query once... Error: ${message}`);
        return await originalQuery(queryTextOrConfig, values);
      }
      throw error;
    }
  } as any);

  return pool;
};

export const checkDatabase = async (db: Queryable): Promise<boolean> => {
  await db.query("select 1");
  return true;
};
