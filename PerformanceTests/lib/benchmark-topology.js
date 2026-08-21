export function resolveBenchmarkTopology(value = "standalone") {
  if (value === "standalone" || value === "ha") return value;
  throw new Error("--topology must be standalone or ha.");
}

/** Keep the same whole-stack CPU budget while replacing the standalone pair
 * with one primary, two replicas and three Sentinels. */
export function haRedisResourceEnvironment(profile) {
  const standaloneRedis = Number(profile.limits.redis) + Number(profile.limits.redisReplica);
  const total = Math.max(0.9, standaloneRedis);
  const shifted = total - standaloneRedis;
  return {
    BENCHMARK_REDIS_0_CPU_LIMIT: (total - 0.6).toString(),
    BENCHMARK_REDIS_REPLICA_0_CPU_LIMIT: "0.15",
    BENCHMARK_REDIS_1_CPU_LIMIT: "0.15",
    BENCHMARK_REDIS_REPLICA_1_CPU_LIMIT: "0.01",
    // Below 0.1 CPU, Docker Desktop throttling can pause Sentinel for >2 seconds and
    // trigger Redis TILT mode, which intentionally suppresses failover.
    BENCHMARK_REDIS_SENTINEL_CPU_LIMIT: "0.1",
    // HA needs six schedulable Redis processes. For the balanced profile only,
    // move CPU from API/worker into Redis while preserving the whole-stack cap.
    BENCHMARK_HA_API_CPU_LIMIT: (Number(profile.limits.api) - shifted * 0.6).toString(),
    BENCHMARK_HA_AUCTION_WORKER_CPU_LIMIT: (Number(profile.limits.auctionWorker) - shifted * 0.4).toString(),
  };
}
