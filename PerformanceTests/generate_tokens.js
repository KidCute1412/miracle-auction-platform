import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Get __dirname in ES module format
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment configurations from Backend folder
dotenv.config({ path: path.join(__dirname, '../Backend/.env') });

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error("Backend JWT_SECRET is required");

// Array of mock user ids for local testing
const testUsers = Array.from({ length: 200 }, (_, index) => ({
  user_id: index + 2,
  role: "user",
  auth_version: 0,
}));

console.log('Generating test JWT tokens...');

const tokens = testUsers.map(user => {
  const token = jwt.sign(
    { user_id: user.user_id, role: user.role, auth_version: user.auth_version },
    JWT_SECRET,
    { algorithm: "HS256", issuer: "online-auction", audience: "online-auction-api", expiresIn: "1d" }
  );
  return {
    user_id: user.user_id,
    token: token
  };
});

// Write tokens to JSON file for k6 import
const outputPath = path.join(__dirname, 'tokens.json');
fs.writeFileSync(outputPath, JSON.stringify(tokens, null, 2));

console.log(`Token file generated successfully at: ${outputPath}`);
