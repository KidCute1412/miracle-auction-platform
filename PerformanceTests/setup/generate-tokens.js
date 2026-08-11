import jwt from "jsonwebtoken";
import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";
import { fileURLToPath } from "node:url";

const currentFile = fileURLToPath(import.meta.url);
const currentDirectory = path.dirname(currentFile);
if (!process.env.JWT_SECRET) dotenv.config({ path: path.join(currentDirectory, "../../Backend/.env") });
const secret = process.env.JWT_SECRET;
if (!secret) throw new Error("JWT_SECRET is required");

const users = Array.from({ length: Number(process.env.BENCHMARK_BIDDER_COUNT ?? 500) }, (_, index) => ({
  user_id: Number(process.env.BENCHMARK_START_ID ?? 900001) + index,
  role: "user",
  auth_version: 0,
}));
const tokens = users.map((user) => ({
  user_id: user.user_id,
  token: jwt.sign(user, secret, { algorithm: "HS256", issuer: "online-auction", audience: "online-auction-api", expiresIn: "1d" }),
}));
const outputPath = process.env.TOKENS_OUTPUT || path.join(currentDirectory, "../tokens.json");
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify(tokens, null, 2));
console.log(`Generated ${tokens.length} benchmark tokens at ${outputPath}`);
