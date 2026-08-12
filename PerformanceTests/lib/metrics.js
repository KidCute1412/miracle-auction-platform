export function metric(summary, name, field) {
  return Number(summary?.metrics?.[name]?.values?.[field] ?? 0);
}

export function median(values) {
  if (!values.length) return 0;
  const sorted = [...values].sort((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

export function sampleStandardDeviation(values) {
  if (values.length < 2) return 0;
  const mean = values.reduce((total, value) => total + value, 0) / values.length;
  return Math.sqrt(values.reduce((total, value) => total + ((value - mean) ** 2), 0) / (values.length - 1));
}

export function stability(values, threshold = 0.1) {
  const mean = values.length ? values.reduce((total, value) => total + value, 0) / values.length : 0;
  const standardDeviation = sampleStandardDeviation(values);
  const coefficientOfVariation = mean === 0 ? 0 : standardDeviation / mean;
  return {
    sampleCount: values.length,
    mean,
    standardDeviation,
    coefficientOfVariation,
    min: values.length ? Math.min(...values) : 0,
    max: values.length ? Math.max(...values) : 0,
    spread: values.length && mean !== 0 ? (Math.max(...values) - Math.min(...values)) / mean : 0,
    warning: values.length > 1 && coefficientOfVariation > threshold,
    sufficientSamples: values.length > 1,
    threshold,
  };
}

export function summarizeRuns(runs) {
  const corePassed = runs.every((run) => {
    const invariants = run.invariants ?? {};
    return (invariants.corePassed ?? invariants.passed) === true && run.invariantCommandPassed !== false;
  });
  const downstreamPassed = runs.every((run) => (run.invariants?.downstreamPassed ?? run.invariants?.passed) === true);
  const throughputValues = runs.map((run) => metric(run.summary, "http_reqs", "rate"));
  const p95Values = runs.map((run) => metric(run.summary, "http_req_duration", "p(95)"));
  const throughputStability = stability(throughputValues);
  const p95Stability = stability(p95Values, 0.2);
  return {
    runs: runs.length,
    throughput: median(runs.map((run) => metric(run.summary, "http_reqs", "rate"))),
    p95Ms: median(runs.map((run) => metric(run.summary, "http_req_duration", "p(95)"))),
    p99Ms: median(runs.map((run) => metric(run.summary, "http_req_duration", "p(99)"))),
    maxSystemErrorRate: Math.max(0, ...runs.map((run) => metric(run.summary, "system_errors", "rate"))),
    acceptedBids: runs.reduce((total, run) => total + metric(run.summary, "accepted_bids", "count"), 0),
    acceptedBidsPerSecond: median(runs.map((run) => metric(run.summary, "accepted_bids", "rate"))),
    rejectedBidsPerSecond: median(runs.map((run) => metric(run.summary, "business_rejections", "rate"))),
    acceptanceRatio: median(runs.map((run) => metric(run.summary, "accepted_ratio", "rate"))),
    businessRejections: runs.reduce((total, run) => total + metric(run.summary, "business_rejections", "count"), 0),
    invariantsPassed: corePassed,
    corePassed,
    downstreamPassed,
    throughputStability,
    p95Stability,
    stabilityWarning: throughputStability.warning || p95Stability.warning,
  };
}

export function compareRevisionSummaries(baseline, target, tolerance = 0.05) {
  const throughputChange = baseline.throughput === 0 ? 0 : target.throughput / baseline.throughput - 1;
  const p99Change = baseline.p99Ms === 0 ? 0 : target.p99Ms / baseline.p99Ms - 1;
  const passed = target.invariantsPassed && target.maxSystemErrorRate < 0.01 &&
    throughputChange >= -tolerance && p99Change <= tolerance;
  return { throughputChange, p99Change, passed };
}

export function officialResourceEligibility(cpus, memoryBytes) {
  const minimumCpus = 4;
  const minimumMemoryBytes = 6 * 1024 ** 3;
  return {
    minimumCpus,
    minimumMemoryBytes,
    passed: Number.isFinite(cpus) && Number.isFinite(memoryBytes) && cpus >= minimumCpus && memoryBytes >= minimumMemoryBytes,
  };
}

export function diagnosticContinuationEnabled(value) {
  return value === true || ["1", "true", "yes", "on"].includes(String(value).toLowerCase());
}

export function describeRunGateFailures({ summary, invariants, k6Code, invariantCode }) {
  const failures = [];
  for (const [metricName, metricData] of Object.entries(summary?.metrics ?? {})) {
    for (const [expression, result] of Object.entries(metricData?.thresholds ?? {})) {
      if (result?.ok !== false) continue;
      const field = expression.match(/^([^<>=!]+)/)?.[1]?.trim();
      const actual = field ? Number(metricData?.values?.[field]) : Number.NaN;
      failures.push(
        `${metricName}: required ${expression}` +
        (Number.isFinite(actual) ? `, actual ${field}=${actual.toFixed(2)}` : ""),
      );
    }
  }
  if (k6Code !== 0 && failures.length === 0) failures.push(`k6 exited with code ${k6Code}`);
  if (invariantCode !== 0 || (invariants?.corePassed ?? invariants?.passed) !== true) {
    const coreViolations = invariants?.coreViolations ?? invariants?.violations;
    const violationCount = Array.isArray(coreViolations) ? coreViolations.length : "unknown";
    failures.push(`correctness invariants failed (violations=${violationCount}, commandExit=${invariantCode})`);
  }
  return failures;
}
