/** Resolves benchmark-only auction shard topology and keeps active Redis CPU constant. */
export function resolveRedisShards(value = 1) {
  const shards = Number(value);
  if (shards === 1 || shards === 2) return shards;
  throw new Error("--redis-shards must be 1 or 2.");
}

export function auctionRedisUrls(shards) {
  return Array.from({ length: shards }, (_, index) => `redis://redis-${index}:6379/0`).join(",");
}

export function redisShardResourceEnvironment(profile, shards) {
  const primary = (Number(profile.limits.redis) / shards).toString();
  const replica = (Number(profile.limits.redisReplica) / shards).toString();
  return Object.fromEntries(Array.from({ length: 2 }, (_, index) => [
    // Docker Desktop rejects the 0.001 CPU cgroup quota; leave an inert pair
    // at its smallest portable quota without changing active-pair limits.
    [`BENCHMARK_REDIS_${index}_CPU_LIMIT`, index < shards ? primary : "0.01"],
    [`BENCHMARK_REDIS_REPLICA_${index}_CPU_LIMIT`, index < shards ? replica : "0.01"],
  ]).flat());
}
