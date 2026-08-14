import test from "node:test";
import assert from "node:assert/strict";
import { compareBidEngines, compareRevisionSummaries, describeRunGateFailures, diagnosticContinuationEnabled, median, officialResourceEligibility, sampleStandardDeviation, stability, summarizeRuns } from "../lib/metrics.js";
import { resolveProfile } from "../config/profiles.js";
import { benchmarkTuningEnvironment, resolveBenchmarkTuning } from "../lib/benchmark-tuning.js";
import { benchmarkResourceProfileEnvironment, resolveBenchmarkResourceProfile } from "../lib/benchmark-resource-profile.js";
import { auctionRedisUrls, redisShardResourceEnvironment, resolveRedisShards } from "../lib/benchmark-redis-shards.js";

const summary = (rate, p99, errors = 0) => ({ metrics: {
  http_reqs: { values: { rate } }, http_req_duration: { values: { "p(95)": p99 / 2, "p(99)": p99 } },
  system_errors: { values: { rate: errors } }, accepted_bids: { values: { count: 2 } }, business_rejections: { values: { count: 1 } },
} });

test("median is stable for odd and even samples", () => {
  assert.equal(median([3, 1, 2]), 2);
  assert.equal(median([4, 2, 1, 3]), 2.5);
});

test("stability reports sample variation and warns above the configured CV", () => {
  assert.equal(sampleStandardDeviation([100, 100, 100]), 0);
  const result = stability([100, 80, 120]);
  assert.equal(result.sampleCount, 3);
  assert.equal(result.min, 80);
  assert.equal(result.max, 120);
  assert.equal(result.warning, true);
});

test("run aggregate includes throughput and latency stability without changing core gates", () => {
  const aggregate = summarizeRuns([
    { summary: summary(100, 400), invariants: { corePassed: true, downstreamPassed: true }, k6Passed: true, invariantCommandPassed: true },
    { summary: summary(80, 600), invariants: { corePassed: true, downstreamPassed: true }, k6Passed: true, invariantCommandPassed: true },
    { summary: summary(120, 500), invariants: { corePassed: true, downstreamPassed: true }, k6Passed: true, invariantCommandPassed: true },
  ]);
  assert.equal(aggregate.corePassed, true);
  assert.equal(aggregate.stabilityWarning, true);
  assert.equal(aggregate.throughputStability.min, 80);
  assert.equal(aggregate.p95Stability.max, 300);
});

test("revision comparison accepts bounded regression with valid invariants", () => {
  const baseline = summarizeRuns([{ summary: summary(100, 50), invariants: { passed: true } }]);
  const target = summarizeRuns([{ summary: summary(97, 52), invariants: { passed: true } }]);
  assert.equal(compareRevisionSummaries(baseline, target).passed, true);
});

test("revision comparison rejects infrastructure errors and correctness failures", () => {
  const baseline = summarizeRuns([{ summary: summary(100, 50), invariants: { passed: true } }]);
  const errors = summarizeRuns([{ summary: summary(110, 45, 0.02), invariants: { passed: true } }]);
  const invalid = summarizeRuns([{ summary: summary(110, 45), invariants: { passed: false } }]);
  assert.equal(compareRevisionSummaries(baseline, errors).passed, false);
  assert.equal(compareRevisionSummaries(baseline, invalid).passed, false);
});

test("engine comparison reports a valid Redis improvement only with healthy pipelines", () => {
  const redis = summarizeRuns([{ summary: summary(160, 700), invariants: { corePassed: true, downstreamPassed: true } }]);
  const postgres = summarizeRuns([{ summary: summary(100, 1000), invariants: { corePassed: true, downstreamPassed: true } }]);
  const result = compareBidEngines(redis, postgres);
  assert.equal(result.valid, true);
  assert.equal(result.verdict, "VALID — Redis faster");
  assert.ok(Math.abs(result.delta.throughput - 0.6) < 1e-12);
});

test("engine comparison remains valid when downstream freshness lags but bidding core is healthy", () => {
  const redis = summarizeRuns([{ summary: summary(160, 700), invariants: { corePassed: true, downstreamPassed: true } }]);
  const postgres = summarizeRuns([{ summary: summary(100, 1000), invariants: { corePassed: true, downstreamPassed: false } }]);
  assert.equal(compareBidEngines(redis, postgres).valid, true);
});

test("profile override preserves profile thresholds while changing duration", () => {
  const profile = resolveProfile("smoke", "2s");
  assert.equal(profile.duration, "2s");
  assert.equal(profile.thresholds.p95Ms, 1000);
});

test("distributed profile accepts a fixed VU override without changing latency thresholds", () => {
  const profile = resolveProfile("distributed", undefined, "150");
  assert.equal(profile.vus, 150);
  assert.equal(profile.thresholds.p95Ms, 500);
});

test("staged profiles reject a VU override", () => {
  assert.throws(() => resolveProfile("hot", undefined, "150"), /fixed-VU/);
});

test("hot and distributed profiles use the same peak VU count for comparison", () => {
  const peak = (profile) => profile.vus ?? Math.max(...profile.stages.map((stage) => stage.target));
  assert.equal(peak(resolveProfile("hot")), 100);
  assert.equal(peak(resolveProfile("distributed")), 100);
});

test("bid-path remains durable while excluding downstream consumers from its diagnostic scope", () => {
  const profile = resolveProfile("bid-path");
  assert.equal(profile.durable, true);
  assert.equal(profile.downstream, false);
  assert.equal(profile.vus, 100);
});

test("official resource gate rejects undersized Docker and accepts the documented floor", () => {
  assert.equal(officialResourceEligibility(2, 2 * 1024 ** 3).passed, false);
  assert.equal(officialResourceEligibility(4, 6 * 1024 ** 3).passed, true);
});

test("diagnostic continuation requires an explicit truthy flag", () => {
  assert.equal(diagnosticContinuationEnabled(undefined), false);
  assert.equal(diagnosticContinuationEnabled("false"), false);
  assert.equal(diagnosticContinuationEnabled("true"), true);
});

test("downstream Kafka lag does not fail the bidding core aggregate", () => {
  const aggregate = summarizeRuns([{
    summary: summary(150, 400),
    invariants: { corePassed: true, downstreamPassed: false },
    k6Passed: true,
    invariantCommandPassed: true,
  }]);
  assert.equal(aggregate.corePassed, true);
  assert.equal(aggregate.invariantsPassed, true);
  assert.equal(aggregate.downstreamPassed, false);
});

test("benchmark tuning uses explicit CLI values and preserves them for Compose", () => {
  const tuning = resolveBenchmarkTuning({
    "mutation-connections": "8",
    "projector-concurrency": "6",
    "dashboard-batch-concurrency": "4",
    "notification-batch-concurrency": "4",
  }, {});
  assert.deepEqual(benchmarkTuningEnvironment(tuning), {
    BID_MUTATION_CONNECTIONS: "8",
    BID_PROJECTOR_CONCURRENCY: "6",
    DASHBOARD_BATCH_CONCURRENCY: "4",
    NOTIFICATION_BATCH_CONCURRENCY: "4",
  });
});

test("benchmark tuning rejects unsafe concurrency values", () => {
  assert.throws(() => resolveBenchmarkTuning({ "projector-concurrency": "0" }, {}), /projector-concurrency/);
});

test("bid-priority resource profile moves fixed benchmark CPU to the bid path", () => {
  const profile = resolveBenchmarkResourceProfile("bid-priority", {});
  assert.equal(profile.limits.api, "1.8");
  assert.equal(profile.limits.redis, "0.65");
  assert.equal(profile.limits.asyncWorker, "0.15");
  assert.deepEqual(benchmarkResourceProfileEnvironment(profile), {
    BENCHMARK_POSTGRES_CPU_LIMIT: "0.75",
    BENCHMARK_REDIS_CPU_LIMIT: "0.65",
    BENCHMARK_REDIS_REPLICA_CPU_LIMIT: "0.35",
    BENCHMARK_KAFKA_CPU_LIMIT: "0.35",
    BENCHMARK_API_CPU_LIMIT: "1.8",
    BENCHMARK_AUCTION_WORKER_CPU_LIMIT: "1.25",
    BENCHMARK_OUTBOX_RELAY_CPU_LIMIT: "0.25",
    BENCHMARK_ASYNC_WORKER_CPU_LIMIT: "0.15",
  });
});

test("resource profile rejects unknown names", () => {
  assert.throws(() => resolveBenchmarkResourceProfile("unbounded", {}), /resource-profile/);
});

test("Redis shard topology preserves the active Redis CPU budget", () => {
  const profile = resolveBenchmarkResourceProfile("balanced", {});
  assert.equal(resolveRedisShards(1), 1);
  assert.equal(resolveRedisShards(2), 2);
  assert.throws(() => resolveRedisShards(3), /redis-shards/);
  assert.equal(auctionRedisUrls(2), "redis://redis-0:6379/0,redis://redis-1:6379/0");
  assert.deepEqual(redisShardResourceEnvironment(profile, 1), {
    BENCHMARK_REDIS_0_CPU_LIMIT: "0.4",
    BENCHMARK_REDIS_REPLICA_0_CPU_LIMIT: "0.25",
    BENCHMARK_REDIS_1_CPU_LIMIT: "0.01",
    BENCHMARK_REDIS_REPLICA_1_CPU_LIMIT: "0.01",
  });
  assert.deepEqual(redisShardResourceEnvironment(profile, 2), {
    BENCHMARK_REDIS_0_CPU_LIMIT: "0.2",
    BENCHMARK_REDIS_REPLICA_0_CPU_LIMIT: "0.125",
    BENCHMARK_REDIS_1_CPU_LIMIT: "0.2",
    BENCHMARK_REDIS_REPLICA_1_CPU_LIMIT: "0.125",
  });
});

test("latency threshold failure does not masquerade as a core correctness failure", () => {
  const aggregate = summarizeRuns([{
    summary: summary(150, 400),
    invariants: { corePassed: true, downstreamPassed: true },
    k6Passed: false,
    invariantCommandPassed: true,
  }]);
  assert.equal(aggregate.corePassed, true);
  assert.equal(aggregate.invariantsPassed, true);
});

test("run gate failure explains the required threshold and actual value", () => {
  const failures = describeRunGateFailures({
    summary: { metrics: { http_req_duration: {
      values: { "p(95)": 1150.4604, "p(99)": 1787.9181 },
      thresholds: { "p(95)<750": { ok: false }, "p(99)<2000": { ok: true } },
    } } },
    invariants: { passed: true, violations: [] },
    k6Code: 99,
    invariantCode: 0,
  });
  assert.deepEqual(failures, ["http_req_duration: required p(95)<750, actual p(95)=1150.46"]);
});
