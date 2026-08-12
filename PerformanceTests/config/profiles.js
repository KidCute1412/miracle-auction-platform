export const profiles = {
  smoke: {
    description: "Fast end-to-end validation before any measured workload.",
    vus: 1,
    duration: "10s",
    productMode: "single",
    // Smoke proves lifecycle and correctness; measured latency gates belong to
    // baseline/hot/distributed runs after cold-start effects are gone.
    thresholds: { p95Ms: 1000, p99Ms: 2000 },
  },
  baseline: {
    description: "Steady, low-contention reference workload.",
    stages: [{ duration: "15s", target: 25 }, { duration: "45s", target: 50 }, { duration: "15s", target: 0 }],
    productMode: "distributed",
    thresholds: { p95Ms: 500, p99Ms: 1500 },
  },
  hot: {
    description: "Many bidders compete for one active auction.",
    stages: [{ duration: "15s", target: 50 }, { duration: "45s", target: 100 }, { duration: "15s", target: 0 }],
    productMode: "single",
    thresholds: { p95Ms: 750, p99Ms: 2000 },
  },
  distributed: {
    description: "Official durable workload: 100 VUs for 75 seconds across active auctions.",
    vus: 100,
    duration: "75s",
    productMode: "distributed",
    durable: true,
    minimumAcceptanceRatio: 0.5,
    thresholds: { p95Ms: 500, p99Ms: 1000 },
  },
  "bid-path": {
    description: "Diagnostic durable bid-path workload without dashboard or notification consumers competing for local resources.",
    vus: 100,
    duration: "75s",
    productMode: "distributed",
    durable: true,
    downstream: false,
    minimumAcceptanceRatio: 0.5,
    thresholds: { p95Ms: 500, p99Ms: 1000 },
  },
  fast: {
    description: "Non-official profile without replica acknowledgement, used only to measure durability overhead.",
    vus: 100,
    duration: "75s",
    productMode: "distributed",
    durable: false,
    thresholds: { p95Ms: 500, p99Ms: 1000 },
  },
  spike: {
    description: "Abrupt burst to expose queueing, rate-limit and recovery behaviour.",
    stages: [{ duration: "10s", target: 20 }, { duration: "5s", target: 250 }, { duration: "30s", target: 250 }, { duration: "10s", target: 0 }],
    productMode: "distributed",
    thresholds: { p95Ms: 1500, p99Ms: 3000 },
  },
  soak: {
    description: "Long-running stability workload.",
    vus: 50,
    duration: "15m",
    productMode: "distributed",
    thresholds: { p95Ms: 1000, p99Ms: 2500 },
  },
};

export function resolveProfile(name, durationOverride) {
  const profile = profiles[name];
  if (!profile) throw new Error(`Unknown scenario '${name}'. Expected one of: ${Object.keys(profiles).join(", ")}`);
  return durationOverride ? { ...profile, duration: durationOverride, stages: undefined } : profile;
}
