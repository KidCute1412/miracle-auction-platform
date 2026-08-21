import { Redis, type RedisOptions } from "ioredis";
import { redisOptions } from "./redis-options.ts";

export type RedisTopologyMode = "standalone" | "sentinel";

export interface RedisTopology {
  mode: RedisTopologyMode;
  masterName: string | null;
  sentinels: Array<{ host: string; port: number }>;
}

function parseSentinelNode(value: string): { host: string; port: number } {
  const separator = value.lastIndexOf(":");
  if (separator <= 0) throw new Error(`Invalid Redis Sentinel node '${value}'`);
  const host = value.slice(0, separator).trim();
  const port = Number(value.slice(separator + 1));
  if (!host || !Number.isInteger(port) || port < 1 || port > 65_535) {
    throw new Error(`Invalid Redis Sentinel node '${value}'`);
  }
  return { host, port };
}

export function resolveRedisTopology(environment: NodeJS.ProcessEnv = process.env): RedisTopology {
  const mode = environment.REDIS_MODE ?? "standalone";
  if (mode !== "standalone" && mode !== "sentinel") {
    throw new Error(`Unsupported REDIS_MODE '${mode}'`);
  }
  if (mode === "standalone") return { mode, masterName: null, sentinels: [] };
  const masterName = environment.REDIS_SENTINEL_MASTER?.trim();
  const nodes = (environment.REDIS_SENTINEL_NODES ?? "")
    .split(",")
    .map((node) => node.trim())
    .filter(Boolean)
    .map(parseSentinelNode);
  if (!masterName) throw new Error("REDIS_SENTINEL_MASTER is required in sentinel mode");
  if (nodes.length < 3) throw new Error("At least three REDIS_SENTINEL_NODES are required in sentinel mode");
  return { mode, masterName, sentinels: nodes };
}

export function createRedisClient(
  standaloneUrl: string,
  overrides: RedisOptions = {},
  environment: NodeJS.ProcessEnv = process.env,
): Redis {
  const topology = resolveRedisTopology(environment);
  if (topology.mode === "standalone") return new Redis(standaloneUrl, { ...redisOptions, ...overrides });
  return new Redis({
    ...redisOptions,
    ...overrides,
    sentinels: topology.sentinels,
    name: topology.masterName!,
    role: "master",
    ...(environment.REDIS_PASSWORD ? { password: environment.REDIS_PASSWORD } : {}),
    ...(environment.REDIS_SENTINEL_PASSWORD ? { sentinelPassword: environment.REDIS_SENTINEL_PASSWORD } : {}),
    sentinelRetryStrategy: (attempts) => Math.min(attempts * 100, 3_000),
  });
}
