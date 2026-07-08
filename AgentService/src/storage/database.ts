import pg from "pg";
import type { AgentServiceConfig } from "../config/env.js";

export type Queryable = Pick<pg.Pool, "query">;

export const createPool = (config: AgentServiceConfig): pg.Pool => {
  return new pg.Pool({
    connectionString: config.databaseUrl,
    max: 10,
    idleTimeoutMillis: 30_000,
  });
};

export const checkDatabase = async (db: Queryable): Promise<boolean> => {
  await db.query("select 1");
  return true;
};
