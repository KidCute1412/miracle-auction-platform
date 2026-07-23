import { spawn } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { GenericContainer, Wait, type StartedTestContainer } from "testcontainers";
import { Redis } from "ioredis";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const databaseName = "online_auction_ephemeral_test";
const databaseUser = "auction_test";
const databasePassword = "test_only_password";
const postgresPort = 5432;
const redisPort = 6379;

type DatabaseSuite = "all" | "integration" | "concurrency" | "coverage";

function parseSuite(value: string | undefined): DatabaseSuite {
  if (value === undefined) return "all";
  if (value === "all" || value === "integration" || value === "concurrency" || value === "coverage") return value;
  throw new Error(`Unknown database test suite '${value}'. Expected all, integration, concurrency, or coverage.`);
}

function runNodeModule(entrypoint: string, args: string[], env: NodeJS.ProcessEnv): Promise<void> {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(process.execPath, [entrypoint, ...args], { cwd: root, env, stdio: "inherit" });
    child.once("error", reject);
    child.once("exit", (code, signal) => {
      if (code === 0) resolvePromise();
      else reject(new Error(`${entrypoint} exited with ${signal ? `signal ${signal}` : `code ${code ?? "unknown"}`}.`));
    });
  });
}

function wait(milliseconds: number): Promise<void> {
  return new Promise((resolvePromise) => setTimeout(resolvePromise, milliseconds));
}

async function runMigrationWhenDatabaseIsReachable(env: NodeJS.ProcessEnv): Promise<void> {
  const migrationEntrypoint = resolve(root, "node_modules/prisma/build/index.js");
  let lastError: unknown;

  for (let attempt = 1; attempt <= 5; attempt += 1) {
    try {
      await runNodeModule(migrationEntrypoint, ["migrate", "deploy", "--schema", "prisma/schema.prisma"], env);
      return;
    } catch (error: unknown) {
      lastError = error;
      if (attempt === 5) break;
      const delay = attempt * 1_000;
      console.warn(`[test-db] Migration attempt ${attempt}/5 failed; retrying in ${delay}ms while PostgreSQL finishes startup...`);
      await wait(delay);
    }
  }

  throw lastError;
}

function buildDatabaseUrl(container: StartedTestContainer): string {
  const url = new URL(`postgresql://${databaseUser}:${databasePassword}@127.0.0.1:${container.getMappedPort(postgresPort)}/${databaseName}`);
  url.hostname = container.getHost();
  url.searchParams.set("schema", "public");
  return url.toString();
}

async function verifyRedisAofRestart(container: StartedTestContainer): Promise<string> {
  const redisUrl = `redis://${container.getHost()}:${container.getMappedPort(redisPort)}`;
  const beforeRestart = new Redis(redisUrl);
  await beforeRestart.set("test:aof-restart", "preserved");
  await wait(1_100);
  await beforeRestart.quit();
  await container.restart({ timeout: 30_000 });
  const afterRestart = new Redis(redisUrl);
  const value = await afterRestart.get("test:aof-restart");
  await afterRestart.flushdb();
  await afterRestart.quit();
  if (value !== "preserved") throw new Error("Redis AOF restart lost an acknowledged write");
  return redisUrl;
}

async function printContainerLogTail(container: StartedTestContainer): Promise<void> {
  const stream = await container.logs({ tail: 200 });
  await new Promise<void>((resolvePromise, reject) => {
    stream.on("data", (chunk: Buffer | string) => process.stderr.write(chunk));
    stream.once("end", resolvePromise);
    stream.once("error", reject);
  });
}

async function main(): Promise<void> {
  const suite = parseSuite(process.argv[2]);
  let container: StartedTestContainer | undefined;
  let redisContainer: StartedTestContainer | undefined;
  let cleanupPromise: Promise<void> | undefined;

  const cleanup = (): Promise<void> => {
    if (!cleanupPromise) {
      cleanupPromise = (async () => {
        if (container) {
          console.log("[test-db] Removing ephemeral PostgreSQL container...");
          await container.stop({ remove: true, removeVolumes: true });
          container = undefined;
        }
        if (redisContainer) {
          console.log("[test-db] Removing ephemeral Redis container...");
          await redisContainer.stop({ remove: true, removeVolumes: true });
          redisContainer = undefined;
        }
      })();
    }
    return cleanupPromise;
  };

  const handleSignal = (signal: NodeJS.Signals): void => {
    void cleanup().finally(() => {
      process.exit(signal === "SIGINT" ? 130 : 143);
    });
  };
  process.once("SIGINT", handleSignal);
  process.once("SIGTERM", handleSignal);

  try {
    console.log("[test-db] Starting isolated PostgreSQL 15 container...");
    container = await new GenericContainer("postgres:15-alpine")
      .withEnvironment({ POSTGRES_DB: databaseName, POSTGRES_USER: databaseUser, POSTGRES_PASSWORD: databasePassword })
      .withExposedPorts(postgresPort)
      // The official image starts a temporary init server before the final server.
      // Waiting for the second readiness message avoids racing Prisma against that restart.
      .withWaitStrategy(Wait.forLogMessage(/database system is ready to accept connections/, 2))
      .withStartupTimeout(120_000)
      .start();
    console.log("[test-db] Starting isolated Redis 7 container with AOF...");
    redisContainer = await new GenericContainer("redis:7-alpine")
      .withCommand(["redis-server", "--appendonly", "yes", "--appendfsync", "everysec"])
      .withExposedPorts(redisPort)
      .withWaitStrategy(Wait.forLogMessage(/Ready to accept connections/))
      .withStartupTimeout(120_000)
      .start();
    console.log("[test-db] Verifying Redis AOF survives a container restart...");
    const redisUrl = await verifyRedisAofRestart(redisContainer);

    const databaseUrl = buildDatabaseUrl(container);
    const testEnvironment: NodeJS.ProcessEnv = {
      ...process.env,
      NODE_ENV: "test",
      DATABASE_URL: databaseUrl,
      DIRECT_URL: databaseUrl,
      TEST_DATABASE_MANAGED: "true",
      TEST_DATABASE_HOST: container.getHost(),
      TEST_DATABASE_PORT: String(container.getMappedPort(postgresPort)),
      REDIS_URL: redisUrl,
    };

    console.log("[test-db] Applying committed Prisma migrations...");
    await runMigrationWhenDatabaseIsReachable(testEnvironment);

    const testDirectories = suite === "coverage"
      ? ["tests", "--coverage"]
      : suite === "all"
        ? ["tests/integration", "tests/concurrency"]
        : [`tests/${suite}`];
    console.log(`[test-db] Running ${suite} database tests...`);
    await runNodeModule(resolve(root, "node_modules/vitest/vitest.mjs"), ["run", ...testDirectories], testEnvironment);
  } catch (error: unknown) {
    if (container) {
      console.error("[test-db] PostgreSQL log tail before cleanup:");
      await printContainerLogTail(container).catch((logError: unknown) => {
        console.error("[test-db] Unable to read PostgreSQL logs:", logError);
      });
    }
    throw error;
  } finally {
    process.removeListener("SIGINT", handleSignal);
    process.removeListener("SIGTERM", handleSignal);
    await cleanup();
  }
}

main().catch((error: unknown) => {
  console.error("[test-db] Test database run failed:", error);
  process.exitCode = 1;
});
