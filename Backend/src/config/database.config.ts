import knex from "knex";
import dotenv from "dotenv";
dotenv.config();

let db: any;
try {
  db = knex({
    client: process.env.DB_CLIENT,
    connection: {
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      password: process.env.DB_PASSWORD,
      port: Number(process.env.DB_PORT),
    },
    pool: { 
      min: 0, 
      max: 10,
      idleTimeoutMillis: 30000 // Close idle connections after 30 seconds to prevent leaks
    },
  });
  console.log("Connect to database successfully!");
} catch (error) {
  console.log("ERROR when connecting to database!!!!");
}
export default db;

