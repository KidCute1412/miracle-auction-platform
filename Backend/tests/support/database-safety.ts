const MANAGED_TEST_DATABASE = "online_auction_ephemeral_test";
const MANAGED_TEST_USER = "auction_test";

type TestDatabaseEnvironment = Pick<
  NodeJS.ProcessEnv,
  | "NODE_ENV"
  | "DATABASE_URL"
  | "DIRECT_URL"
  | "TEST_DATABASE_MANAGED"
  | "TEST_DATABASE_HOST"
  | "TEST_DATABASE_PORT"
>;

function refuse(reason: string): never {
  throw new Error(`Refusing destructive test database cleanup: ${reason}`);
}

export function validateManagedTestDatabaseEnvironment(env: TestDatabaseEnvironment): URL {
  if (env.NODE_ENV !== "test") refuse("NODE_ENV must be exactly 'test'.");
  if (env.TEST_DATABASE_MANAGED !== "true") refuse("the ephemeral database marker is missing.");
  if (!env.DATABASE_URL || !env.DIRECT_URL) refuse("DATABASE_URL and DIRECT_URL are required.");
  if (env.DATABASE_URL !== env.DIRECT_URL) refuse("DATABASE_URL and DIRECT_URL must identify the same ephemeral database.");
  if (!env.TEST_DATABASE_HOST || !env.TEST_DATABASE_PORT) refuse("the container host and port markers are missing.");

  let databaseUrl: URL;
  try {
    databaseUrl = new URL(env.DATABASE_URL);
  } catch {
    return refuse("DATABASE_URL is not a valid URL.");
  }

  const databaseName = decodeURIComponent(databaseUrl.pathname.replace(/^\//, ""));
  if (databaseUrl.protocol !== "postgresql:" && databaseUrl.protocol !== "postgres:") {
    refuse("only PostgreSQL URLs are allowed.");
  }
  if (databaseName !== MANAGED_TEST_DATABASE) refuse(`database must be exactly '${MANAGED_TEST_DATABASE}'.`);
  if (decodeURIComponent(databaseUrl.username) !== MANAGED_TEST_USER) refuse(`database user must be exactly '${MANAGED_TEST_USER}'.`);
  if (databaseUrl.hostname !== env.TEST_DATABASE_HOST) refuse("database host does not match the managed container.");
  if (databaseUrl.port !== env.TEST_DATABASE_PORT) refuse("database port does not match the managed container.");

  return databaseUrl;
}

export function assertManagedDatabaseName(actualDatabaseName: string): void {
  if (actualDatabaseName !== MANAGED_TEST_DATABASE) {
    refuse(`connected database is '${actualDatabaseName}', expected '${MANAGED_TEST_DATABASE}'.`);
  }
}

