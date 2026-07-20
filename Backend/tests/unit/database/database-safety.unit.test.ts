import { describe, expect, it } from "vitest";
import { assertManagedDatabaseName, validateManagedTestDatabaseEnvironment } from "../../support/database-safety.ts";

const managedUrl = "postgresql://auction_test:test_only_password@127.0.0.1:49152/online_auction_ephemeral_test?schema=public";
const validEnvironment = {
  NODE_ENV: "test",
  DATABASE_URL: managedUrl,
  DIRECT_URL: managedUrl,
  TEST_DATABASE_MANAGED: "true",
  TEST_DATABASE_HOST: "127.0.0.1",
  TEST_DATABASE_PORT: "49152",
};

describe("destructive test database safety guard", () => {
  it("accepts only the runner-managed ephemeral database", () => {
    expect(validateManagedTestDatabaseEnvironment(validEnvironment).pathname).toBe("/online_auction_ephemeral_test");
    expect(() => assertManagedDatabaseName("online_auction_ephemeral_test")).not.toThrow();
  });

  it.each([
    ["development mode", { NODE_ENV: "development" }],
    ["missing managed marker", { TEST_DATABASE_MANAGED: undefined }],
    ["development database", { DATABASE_URL: managedUrl.replace("online_auction_ephemeral_test", "online_auction_test"), DIRECT_URL: managedUrl.replace("online_auction_ephemeral_test", "online_auction_test") }],
    ["different direct URL", { DIRECT_URL: managedUrl.replace("49152", "49153") }],
    ["different host", { TEST_DATABASE_HOST: "localhost" }],
    ["different port", { TEST_DATABASE_PORT: "5432" }],
  ])("rejects %s before cleanup", (_scenario, override) => {
    expect(() => validateManagedTestDatabaseEnvironment({ ...validEnvironment, ...override })).toThrow("Refusing destructive test database cleanup");
  });

  it("rejects a connection whose actual database name differs", () => {
    expect(() => assertManagedDatabaseName("online_auction_test")).toThrow("Refusing destructive test database cleanup");
  });
});
