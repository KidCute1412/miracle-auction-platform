import test from "node:test";
import assert from "node:assert/strict";
import { compareRevisionSummaries, describeRunGateFailures, diagnosticContinuationEnabled, median, officialResourceEligibility, sampleStandardDeviation, stability, summarizeRuns } from "../lib/metrics.js";
import { resolveProfile } from "../config/profiles.js";

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

test("profile override preserves profile thresholds while changing duration", () => {
  const profile = resolveProfile("smoke", "2s");
  assert.equal(profile.duration, "2s");
  assert.equal(profile.thresholds.p95Ms, 1000);
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
