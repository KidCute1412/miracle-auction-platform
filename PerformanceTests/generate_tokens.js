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

const JWT_SECRET = process.env.JWT_SECRET || 'THANHTIEN';

// Array of mock user ids for local testing
const testUsers = [
  { user_id: 1, role: 'bidder' },
  { user_id: 2, role: 'bidder' },
  { user_id: 3, role: 'bidder' },
  { user_id: 4, role: 'bidder' },
  { user_id: 5, role: 'bidder' }
];

console.log(`Using JWT_SECRET: "${JWT_SECRET}"`);
console.log('Generating test JWT tokens...');

const tokens = testUsers.map(user => {
  const token = jwt.sign(
    { user_id: user.user_id, role: user.role },
    JWT_SECRET,
    { expiresIn: '1d' }
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
