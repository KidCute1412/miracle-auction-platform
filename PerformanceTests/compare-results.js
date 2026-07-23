import fs from "node:fs";

const [, , baselinePath, targetPath, reportPath, baselineInvariantPath, targetInvariantPath] = process.argv;
if (!baselinePath || !targetPath || !reportPath) {
  throw new Error("Usage: node compare-results.js <baseline-summary.json> <target-summary.json> <report.md>");
}

const baseline = JSON.parse(fs.readFileSync(baselinePath, "utf8"));
const target = JSON.parse(fs.readFileSync(targetPath, "utf8"));
const metric = (summary, name, value) => Number(summary.metrics?.[name]?.values?.[value] ?? 0);
const baselineRate = metric(baseline, "http_reqs", "rate");
const targetRate = metric(target, "http_reqs", "rate");
const baselineP99 = metric(baseline, "http_req_duration", "p(99)");
const targetP99 = metric(target, "http_req_duration", "p(99)");
const targetErrors = metric(target, "system_errors", "rate");
const throughputGain = baselineRate === 0 ? 0 : targetRate / baselineRate;
const latencyReduction = baselineP99 === 0 ? 0 : 1 - targetP99 / baselineP99;
const performancePass = throughputGain >= 2 || latencyReduction >= 0.5;
const httpPass = targetErrors < 0.01;
const baselineInvariant = baselineInvariantPath ? JSON.parse(fs.readFileSync(baselineInvariantPath, "utf8")) : undefined;
const targetInvariant = targetInvariantPath ? JSON.parse(fs.readFileSync(targetInvariantPath, "utf8")) : undefined;
const invariantPass = baselineInvariant?.passed === true && targetInvariant?.passed === true;
const convergencePass = Array.isArray(targetInvariant?.reconciliation) &&
  targetInvariant.reconciliation.every((item) => item.status === "converged");
const overallPass = performancePass && httpPass && invariantPass && convergencePass;

const report = [
  "# Bidding engine comparison",
  "",
  "| Metric | PostgreSQL | Redis |",
  "|---|---:|---:|",
  `| Throughput (req/s) | ${baselineRate.toFixed(2)} | ${targetRate.toFixed(2)} |`,
  `| p99 (ms) | ${baselineP99.toFixed(2)} | ${targetP99.toFixed(2)} |`,
  `| System error rate | ${(metric(baseline, "system_errors", "rate") * 100).toFixed(4)}% | ${(targetErrors * 100).toFixed(4)}% |`,
  "",
  `- Throughput multiplier: ${throughputGain.toFixed(2)}x`,
  `- p99 reduction: ${(latencyReduction * 100).toFixed(2)}%`,
  `- HTTP performance gate: ${performancePass && httpPass ? "PASS" : "FAIL"}`,
  `- Invariant gate: ${invariantPass ? "PASS" : "PENDING/FAIL"}`,
  `- Projection convergence gate: ${convergencePass ? "PASS" : "PENDING/FAIL"}`,
  `- Overall gate: ${overallPass ? "PASS" : "FAIL"}`,
  "",
  "No superiority claim is valid until all three gates pass.",
  "",
].join("\n");

fs.writeFileSync(reportPath, report);
console.log(report);
