import knex from "knex";
import dotenv from "dotenv";
dotenv.config();

const db = knex({
    client: process.env.DB_CLIENT,
    connection: {
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      password: process.env.DB_PASSWORD,
      port: Number(process.env.DB_PORT),
      ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : undefined,
    },
    pool: { 
      min: 0, 
      max: 10,
      idleTimeoutMillis: 30000 // Close idle connections after 30 seconds to prevent leaks
    },
});

export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await db.raw("select 1");
    return true;
  } catch (error) {
    console.error("[DATABASE] Connection check failed:", error);
    return false;
  }
}

export default db;

