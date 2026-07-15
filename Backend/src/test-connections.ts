import { checkDatabaseConnection } from "./config/database.config.ts";
import { checkRedisConnection, redisClient } from "./config/redis.config.ts";
import { checkKafkaConnection, closeKafkaConnection } from "./config/kafka.config.ts";

async function main() {
  const checks = [["PostgreSQL", checkDatabaseConnection], ["Redis", checkRedisConnection], ["Kafka", checkKafkaConnection]] as const;
  let healthy = true;
  for (const [name, check] of checks) { const result = await check(); healthy &&= result; console.log(`${result ? "PASS" : "FAIL"} ${name}`); }
  redisClient.disconnect();
  await closeKafkaConnection();
  process.exit(healthy ? 0 : 1);
}
main().catch((error) => { console.error("Connection test failed:", error); redisClient.disconnect(); process.exit(1); });
