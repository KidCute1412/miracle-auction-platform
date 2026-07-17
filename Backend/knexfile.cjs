require("dotenv").config();
const connection = { host: process.env.DB_HOST, port: Number(process.env.DB_PORT), user: process.env.DB_USER, password: process.env.DB_PASSWORD, database: process.env.DB_NAME, ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : undefined };
module.exports = { client: process.env.DB_CLIENT || "pg", connection, migrations: { directory: "./migrations", loadExtensions: [".cjs"] } };
