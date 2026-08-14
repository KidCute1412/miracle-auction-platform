const resourceProfiles = {
  balanced: {
    postgres: "0.75",
    redis: "0.4",
    redisReplica: "0.25",
    kafka: "0.5",
    api: "1.5",
    auctionWorker: "1.25",
    outboxRelay: "0.5",
    asyncWorker: "0.4",
  },
  "bid-priority": {
    postgres: "0.75",
    redis: "0.65",
    redisReplica: "0.35",
    kafka: "0.35",
    api: "1.8",
    auctionWorker: "1.25",
    outboxRelay: "0.25",
    asyncWorker: "0.15",
  },
};

const environmentNames = {
  postgres: "BENCHMARK_POSTGRES_CPU_LIMIT",
  redis: "BENCHMARK_REDIS_CPU_LIMIT",
  redisReplica: "BENCHMARK_REDIS_REPLICA_CPU_LIMIT",
  kafka: "BENCHMARK_KAFKA_CPU_LIMIT",
  api: "BENCHMARK_API_CPU_LIMIT",
  auctionWorker: "BENCHMARK_AUCTION_WORKER_CPU_LIMIT",
  outboxRelay: "BENCHMARK_OUTBOX_RELAY_CPU_LIMIT",
  asyncWorker: "BENCHMARK_ASYNC_WORKER_CPU_LIMIT",
};

/** Resolves an explicit, reproducible CPU budget for the isolated benchmark stack. */
export function resolveBenchmarkResourceProfile(value, environment = process.env) {
  const name = value ?? environment.BENCHMARK_RESOURCE_PROFILE ?? "balanced";
  const limits = resourceProfiles[name];
  if (!limits) throw new Error(`Unknown --resource-profile '${name}'. Expected one of: ${Object.keys(resourceProfiles).join(", ")}.`);
  return { name, limits: { ...limits } };
}

export function benchmarkResourceProfileEnvironment(profile) {
  return Object.fromEntries(Object.entries(environmentNames).map(([property, environmentName]) => [
    environmentName,
    profile.limits[property],
  ]));
}
