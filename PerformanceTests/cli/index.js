import { spawn } from "node:child_process";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { createReadStream, createWriteStream } from "node:fs";
import { pipeline } from "node:stream/promises";
import { createGzip } from "node:zlib";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { compareRevisionSummaries, describeRunGateFailures, diagnosticContinuationEnabled, officialResourceEligibility, summarizeRuns } from "../lib/metrics.js";
import { resolveProfile } from "../config/profiles.js";

const performanceRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repositoryRoot = resolve(performanceRoot, "..");
const composeFile = resolve(performanceRoot, "compose/benchmark.compose.yml");

class BenchmarkGateError extends Error {}

function imageTagFor(runId) {
  return runId.replace(/[^a-z0-9_.-]/gi, "-").toLowerCase();
}

function parseArgs(values) {
  const parsed = { _: [] };
  for (let index = 0; index < values.length; index += 1) {
    const value = values[index];
    if (!value.startsWith("--")) parsed._.push(value);
    else {
      const [key, inlineValue] = value.slice(2).split("=", 2);
      parsed[key] = inlineValue ?? (values[index + 1]?.startsWith("--") ? true : values[++index]);
    }
  }
  return parsed;
}

function command(commandName, commandArgs, options = {}) {
  return new Promise((resolveCommand, rejectCommand) => {
    const child = spawn(commandName, commandArgs, {
      cwd: options.cwd ?? repositoryRoot,
      env: { ...process.env, ...options.env },
      shell: false,
      stdio: options.quiet ? ["ignore", "pipe", "pipe"] : "inherit",
    });
    let stdout = "";
    let stderr = "";
    if (options.quiet) {
      child.stdout.on("data", (chunk) => { stdout += chunk; });
      child.stderr.on("data", (chunk) => { stderr += chunk; });
    }
    child.on("error", rejectCommand);
    child.on("close", (code) => {
      if (code === 0 || options.allowFailure) resolveCommand({ code, stdout, stderr });
      else rejectCommand(new Error(`${commandName} ${commandArgs.join(" ")} failed with exit code ${code}${stderr ? `: ${stderr}` : ""}${stdout ? `\n${stdout}` : ""}`));
    });
  });
}

function dockerCompose(project, sourceRoot, runId, args, quiet = false, options = {}) {
  return command("docker", ["compose", "-p", project, "-f", composeFile, ...args], {
    quiet,
    allowFailure: options.allowFailure,
    env: {
      BENCHMARK_SOURCE_ROOT: sourceRoot,
      BENCHMARK_RUN_ID: runId,
      BENCHMARK_IMAGE_TAG: options.imageTag ?? imageTagFor(runId),
      BID_DURABILITY_REPLICAS: options.durabilityReplicas ?? process.env.BID_DURABILITY_REPLICAS,
      BID_PROJECTOR_CONCURRENCY: options.projectorConcurrency ?? process.env.BID_PROJECTOR_CONCURRENCY,
    },
  });
}

function asBoolean(value) {
  return value === true || value === "true";
}

function runIdFor(prefix = "run") {
  const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14);
  return `${prefix}-${timestamp}-${Math.random().toString(16).slice(2, 8)}`;
}

async function preflight(options = {}) {
  for (const [binary, args] of [["docker", ["version", "--format", "{{.Client.Version}}"]], ["k6", ["version"]], ["git", ["--version"]]]) {
    await command(binary, args, { quiet: true });
  }
  if (!asBoolean(options["allow-competing-stacks"])) {
    const running = await command("docker", ["ps", "--filter", "label=com.docker.compose.project", "--format", "{{.Label \"com.docker.compose.project\"}}"], { quiet: true });
    const competitors = [...new Set(running.stdout.split(/\r?\n/).filter((name) => name === "online-auction" || name.startsWith("auction-benchmark-")))];
    if (competitors.length) throw new Error(`Competing auction stack detected (${competitors.join(", ")}). Stop it or pass --allow-competing-stacks=true.`);
  }
  const officialDistributed = (options.scenario ?? "smoke") === "distributed" &&
    options.duration === undefined && Number(options.runs ?? 3) === 3;
  if (officialDistributed && !asBoolean(options["allow-low-resources"])) {
    const [cpuResult, memoryResult] = await Promise.all([
      command("docker", ["info", "--format", "{{.NCPU}}"], { quiet: true }),
      command("docker", ["info", "--format", "{{.MemTotal}}"], { quiet: true }),
    ]);
    const cpus = Number(cpuResult.stdout.trim());
    const memoryBytes = Number(memoryResult.stdout.trim());
    const resources = officialResourceEligibility(cpus, memoryBytes);
    if (!resources.passed) {
      throw new Error(
        `Official distributed benchmark requires at least 4 Docker CPUs and 6 GiB RAM; detected ${cpus} CPUs and ${(memoryBytes / 1024 ** 3).toFixed(2)} GiB. ` +
        "Increase Docker/WSL2 resources or pass --allow-low-resources=true for a non-claim profiling run.",
      );
    }
  }
}

async function getApiUrl(project, sourceRoot, runId, composeOptions = {}) {
  const result = await dockerCompose(project, sourceRoot, runId, ["port", "api", "5000"], true, composeOptions);
  const address = result.stdout.trim().split(/\r?\n/).at(-1);
  if (!address) throw new Error("Could not resolve benchmark API port");
  const port = address.match(/:(\d+)$/)?.[1];
  if (!port) throw new Error(`Unexpected Docker port response: ${address}`);
  return `http://127.0.0.1:${port}`;
}

async function waitForReady(baseUrl, timeoutMs = 90_000) {
  const deadline = Date.now() + timeoutMs;
  let lastError = "not checked";
  let attempts = 0;
  while (Date.now() < deadline) {
    attempts += 1;
    try {
      const response = await fetch(`${baseUrl}/ready`, { signal: AbortSignal.timeout(5_000) });
      if (response.status === 200) return;
      lastError = `ready returned ${response.status}`;
    } catch (error) {
      lastError = error instanceof Error ? error.message : "unknown request error";
    }
    if (attempts % 5 === 0) process.stdout.write(`[benchmark] waiting for API readiness (${lastError})\n`);
    await new Promise((resolveDelay) => setTimeout(resolveDelay, 1000));
  }
  throw new Error(`Benchmark API did not become ready: ${lastError}`);
}

async function writeJson(path, value) {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

async function recordRunnerPhase(outputRoot, phase, details = {}) {
  await writeJson(resolve(outputRoot, "runner-status.json"), {
    phase,
    ...details,
    recordedAt: new Date().toISOString(),
  });
}

async function gzipFile(path) {
  await pipeline(createReadStream(path), createGzip(), createWriteStream(`${path}.gz`));
  await rm(path, { force: true });
  return `${path}.gz`;
}

function finalJsonLine(output) {
  const line = output.trim().split(/\r?\n/).reverse().find((candidate) => candidate.trim().startsWith("{"));
  if (!line) throw new Error("Expected JSON output from benchmark command");
  return JSON.parse(line);
}

async function collectMetadata(project, sourceRoot, runId, destination, baseUrl, composeOptions = {}) {
  await mkdir(destination, { recursive: true });
  const [dockerVersion, dockerCpu, dockerMemory, composeConfig, containerIds] = await Promise.all([
    command("docker", ["version"], { quiet: true }),
    command("docker", ["info", "--format", "{{.NCPU}}"], { quiet: true }),
    command("docker", ["info", "--format", "{{.MemTotal}}"], { quiet: true }),
    dockerCompose(project, sourceRoot, runId, ["config"], true, composeOptions),
    dockerCompose(project, sourceRoot, runId, ["ps", "-q"], true, composeOptions),
  ]);
  await writeFile(resolve(destination, "docker-version.txt"), dockerVersion.stdout, "utf8");
  await writeFile(resolve(destination, "compose-config.yml"), composeConfig.stdout, "utf8");
  const ids = containerIds.stdout.trim().split(/\s+/).filter(Boolean);
  if (ids.length) {
    const stats = await command("docker", ["stats", "--no-stream", "--format", "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}", ...ids], { quiet: true });
    await writeFile(resolve(destination, "docker-stats.txt"), stats.stdout, "utf8");
  }
  await writeJson(resolve(destination, "metadata.json"), {
    runId,
    baseUrl,
    sourceRevision: (await command("git", ["-C", sourceRoot, "rev-parse", "HEAD"], { quiet: true })).stdout.trim(),
    capturedAt: new Date().toISOString(),
    platform: process.platform,
    node: process.version,
    cpu: process.arch,
    dockerCpus: Number(dockerCpu.stdout.trim()),
    dockerMemoryBytes: Number(dockerMemory.stdout.trim()),
    sourceRoot,
    isolated: true,
  });
}

async function startStatsSampler(project, sourceRoot, runId, destination, baseUrl, composeOptions) {
  const containers = await dockerCompose(project, sourceRoot, runId, ["ps", "-q"], true, composeOptions);
  const ids = containers.stdout.trim().split(/\s+/).filter(Boolean);
  const samples = [];
  const runtimeSamples = [];
  let stopped = false;
  let wake;
  let timer;
  const loop = (async () => {
    while (!stopped) {
      const stats = ids.length
        ? await command("docker", ["stats", "--no-stream", "--format", "{{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.BlockIO}}", ...ids], { quiet: true, allowFailure: true })
        : { stdout: "" };
      samples.push(`${new Date().toISOString()}\n${stats.stdout.trim()}\n`);
      try {
        const response = await fetch(`${baseUrl}/ready`);
        runtimeSamples.push(JSON.stringify({ capturedAt: new Date().toISOString(), status: response.status, body: await response.json() }));
      } catch (error) {
        runtimeSamples.push(JSON.stringify({ capturedAt: new Date().toISOString(), error: error instanceof Error ? error.message : String(error) }));
      }
      await new Promise((resolveDelay) => {
        wake = resolveDelay;
        timer = setTimeout(resolveDelay, 5_000);
      });
    }
  })();
  return async () => {
    stopped = true;
    if (timer) clearTimeout(timer);
    if (wake) wake();
    await loop;
    await writeFile(destination, samples.join("\n"), "utf8");
    await writeFile(destination.replace("-container-stats.txt", "-runtime-metrics.ndjson"), `${runtimeSamples.join("\n")}\n`, "utf8");
  };
}

async function executeSuite(options) {
  const scenario = options.scenario ?? "smoke";
  const profile = resolveProfile(scenario, options.duration);
  const runs = Number(options.runs ?? (scenario === "smoke" ? 1 : 3));
  if (!Number.isInteger(runs) || runs < 1) throw new Error("--runs must be a positive integer");
  const sourceRoot = resolve(options["source-root"] ?? repositoryRoot);
  const runId = options["run-id"] ?? runIdFor(scenario);
  const project = `auction-benchmark-${runId}`.replace(/[^a-z0-9_-]/gi, "").toLowerCase();
  const outputRoot = resolve(options.output ?? resolve(performanceRoot, "artifacts/runs"), runId);
  const keepEnvironment = asBoolean(options["keep-env"]);
  const continueOnGateFailure = diagnosticContinuationEnabled(
    options.continue ?? options["continue-on-gate-failure"],
  );
  const composeOptions = {
    durabilityReplicas: profile.durable === false ? "0" : "1",
    projectorConcurrency: String(options["projector-concurrency"] ?? 8),
  };
  const warmupDuration = options["warmup-duration"] ?? (scenario === "smoke" ? "5s" : "30s");
  const runRecords = [];
  process.stdout.write(`[benchmark] scenario=${scenario} runs=${runs} profile=${profile.productMode}${options.duration ? ` duration=${options.duration}` : ""}\n`);
  await mkdir(outputRoot, { recursive: true });
  await writeJson(resolve(outputRoot, "run-config.json"), {
    runId, scenario, runs, profile, sourceRoot, project,
    continueOnGateFailure,
    diagnosticOnly: continueOnGateFailure,
    isolation: "fresh-stack-per-run",
    warmupDuration,
  });
  try {
    await recordRunnerPhase(outputRoot, "building-runtime-images");
    const imageTag = imageTagFor(runId);
    const dockerfile = resolve(sourceRoot, "Backend/Dockerfile");
    await command("docker", ["build", "--target", "runtime", "-t", `online-auction-benchmark-runtime:${imageTag}`, "-f", dockerfile, sourceRoot]);
    await command("docker", ["build", "--target", "migrator", "-t", `online-auction-benchmark-migrator:${imageTag}`, "-f", dockerfile, sourceRoot]);
    const attemptComposeOptions = { ...composeOptions, imageTag };
    for (let attempt = 1; attempt <= runs; attempt += 1) {
      const attemptRunId = `${runId}-r${attempt}`;
      const attemptProject = `auction-benchmark-${attemptRunId}`.replace(/[^a-z0-9_-]/gi, "").toLowerCase();
      let baseUrl;
      await recordRunnerPhase(outputRoot, "starting-compose", { attempt, runs, project: attemptProject });
      try {
        await dockerCompose(attemptProject, sourceRoot, attemptRunId, ["up", "-d", "--no-build"], false, attemptComposeOptions);
        await recordRunnerPhase(outputRoot, "resolving-api", { attempt, runs, project: attemptProject });
        baseUrl = await getApiUrl(attemptProject, sourceRoot, attemptRunId, attemptComposeOptions);
        await recordRunnerPhase(outputRoot, "waiting-for-api", { attempt, runs, project: attemptProject, baseUrl });
        await waitForReady(baseUrl);
        await recordRunnerPhase(outputRoot, "seeding-warmup", { attempt, runs, project: attemptProject, baseUrl });
        const warmupSeed = await dockerCompose(attemptProject, sourceRoot, attemptRunId, [
          "exec", "-T", "api", "sh", "-lc",
          `NODE_ENV=benchmark BENCHMARK_ISOLATED=true BENCHMARK_RUN_ID=${attemptRunId}-warmup npm run benchmark:seed`,
        ], true, attemptComposeOptions);
        const warmupManifest = finalJsonLine(warmupSeed.stdout);
        const warmupManifestPath = resolve(outputRoot, `${scenario}-${attempt}-warmup-manifest.json`);
        const warmupTokensPath = resolve(outputRoot, `${scenario}-${attempt}-warmup-tokens.json`);
        await writeJson(warmupManifestPath, warmupManifest);
        await command("node", [resolve(performanceRoot, "setup/generate-tokens.js")], {
          env: { JWT_SECRET: "benchmark-local-secret-only", TOKENS_OUTPUT: warmupTokensPath },
        });
        await recordRunnerPhase(outputRoot, "running-warmup-k6", { attempt, runs, project: attemptProject, baseUrl, warmupDuration });
        await command("k6", ["run", resolve(performanceRoot, "scenarios/bidding.js")], {
          cwd: performanceRoot,
          allowFailure: true,
          env: {
            SCENARIO: scenario, DURATION: warmupDuration, BASE_URL: baseUrl, CLIENT_URL: "http://benchmark.local",
            MANIFEST_PATH: warmupManifestPath, TOKENS_PATH: warmupTokensPath,
            ARTIFACT_PREFIX: resolve(outputRoot, `${scenario}-${attempt}-warmup`),
          },
        });
        await recordRunnerPhase(outputRoot, "checking-warmup-invariants", { attempt, runs, project: attemptProject });
        await dockerCompose(attemptProject, sourceRoot, attemptRunId, [
          "exec", "-T", "api", "sh", "-lc",
          "NODE_ENV=benchmark BID_ENGINE=redis WAIT_FOR_CONVERGENCE_MS=30000 npm run benchmark:invariants",
        ], true, { ...attemptComposeOptions, allowFailure: true });
        await recordRunnerPhase(outputRoot, "starting-measured-run", { attempt, runs, project: attemptProject, baseUrl });
      const prefix = resolve(outputRoot, `${scenario}-${attempt}`);
      const manifestPath = `${prefix}-manifest.json`;
      const seed = await dockerCompose(attemptProject, sourceRoot, attemptRunId, [
        "exec", "-T", "api", "sh", "-lc",
        `NODE_ENV=benchmark BENCHMARK_ISOLATED=true BENCHMARK_RUN_ID=${runId} npm run benchmark:seed`,
      ], true, attemptComposeOptions);
      const manifest = finalJsonLine(seed.stdout);
      await writeJson(manifestPath, manifest);
      const tokensPath = `${prefix}-tokens.json`;
      await command("node", [resolve(performanceRoot, "setup/generate-tokens.js")], {
        env: { JWT_SECRET: "benchmark-local-secret-only", TOKENS_OUTPUT: tokensPath },
      });
      const stopStatsSampler = await startStatsSampler(attemptProject, sourceRoot, attemptRunId, `${prefix}-container-stats.txt`, baseUrl, attemptComposeOptions);
      await recordRunnerPhase(outputRoot, "running-measured-k6", { attempt, runs, baseUrl });
      let k6Result;
      try {
        k6Result = await command("k6", ["run", "--out", `json=${prefix}-raw.json`, resolve(performanceRoot, "scenarios/bidding.js")], {
          cwd: performanceRoot,
          allowFailure: true,
          env: {
            SCENARIO: scenario,
            DURATION: options.duration ?? "",
            BENCHMARK_BIDDER_COUNT: String(manifest.users),
            BENCHMARK_START_ID: String(manifest.startId),
            BASE_URL: baseUrl,
            CLIENT_URL: "http://benchmark.local",
            MANIFEST_PATH: manifestPath,
            TOKENS_PATH: tokensPath,
            ARTIFACT_PREFIX: prefix,
          },
        });
      } finally {
        await stopStatsSampler();
      }
      const invariantContainerPath = "/tmp/benchmark-invariants.json";
      const invariantResult = await dockerCompose(attemptProject, sourceRoot, attemptRunId, [
        "exec", "-T", "api", "sh", "-lc",
        `NODE_ENV=benchmark BID_ENGINE=redis WAIT_FOR_CONVERGENCE_MS=30000 INVARIANT_OUTPUT=${invariantContainerPath} npm run benchmark:invariants`,
      ], true, { ...attemptComposeOptions, allowFailure: true });
      const invariantPath = `${prefix}-invariants.json`;
      await dockerCompose(attemptProject, sourceRoot, attemptRunId, ["cp", `api:${invariantContainerPath}`, invariantPath]);
      const rawPath = await gzipFile(`${prefix}-raw.json`);
      const summary = JSON.parse(await readFile(`${prefix}-summary.json`, "utf8"));
      const invariants = JSON.parse(await readFile(invariantPath, "utf8"));
      const metadataDirectory = resolve(outputRoot, `${scenario}-${attempt}-metadata`);
      await collectMetadata(attemptProject, sourceRoot, attemptRunId, metadataDirectory, baseUrl, attemptComposeOptions);
      runRecords.push({
        attempt,
        summary,
        invariants,
        k6Passed: k6Result.code === 0,
        invariantCommandPassed: invariantResult.code === 0,
        files: { prefix, manifestPath, tokensPath, invariantPath, rawPath, metadataDirectory },
      });
      const coreInvariantsPassed = invariants.corePassed ?? invariants.passed;
      const downstreamInvariantsPassed = invariants.downstreamPassed ?? invariants.passed;
      if (!downstreamInvariantsPassed) {
        process.stderr.write(`Benchmark run ${attempt}: downstream Kafka freshness did not converge; continuing bid-path evaluation.\n`);
      }
      if (k6Result.code !== 0 || invariantResult.code !== 0 || coreInvariantsPassed !== true) {
        const failures = describeRunGateFailures({
          summary,
          invariants,
          k6Code: k6Result.code,
          invariantCode: invariantResult.code,
        });
        if (!continueOnGateFailure) {
          throw new BenchmarkGateError([
            `Benchmark run ${attempt} FAILED:`,
            ...failures.map((failure) => `  - ${failure}`),
            "No later run was started and no incomplete suite was aggregated.",
          ].join("\n"));
        }
        process.stderr.write([
          `Benchmark run ${attempt} FAILED (diagnostic continuation enabled):`,
          ...failures.map((failure) => `  - ${failure}`),
          "Continuing for diagnostic run statistics; this suite is not eligible for an official claim.",
        ].join("\n") + "\n");
      }
      } finally {
        if (!keepEnvironment) {
          await dockerCompose(attemptProject, sourceRoot, attemptRunId, ["down", "--volumes", "--remove-orphans"], true).catch(() => undefined);
        } else {
          process.stdout.write(`[benchmark] keeping environment for attempt ${attempt}: ${attemptProject}\n`);
        }
      }
    }
    await recordRunnerPhase(outputRoot, "collecting-metadata");
    const aggregate = summarizeRuns(runRecords);
    const officialGate = scenario !== "distributed" || (
      aggregate.throughput >= 300 && aggregate.acceptedBidsPerSecond >= 150 &&
      aggregate.acceptanceRatio >= 0.5 && aggregate.p95Ms < 500 && aggregate.p99Ms < 1000
    );
    const passed = officialGate && aggregate.invariantsPassed && aggregate.maxSystemErrorRate === 0 &&
      runRecords.every((record) => record.k6Passed && record.invariantCommandPassed);
    const report = [
      `# Auction bidding benchmark: ${scenario}`, "",
      `- Run ID: \`${runId}\``, `- Revision: \`${(await command("git", ["-C", sourceRoot, "rev-parse", "HEAD"], { quiet: true })).stdout.trim()}\``,
      `- Runs: ${runs}`, `- Throughput median: ${aggregate.throughput.toFixed(2)} req/s`,
      `- p95 median: ${aggregate.p95Ms.toFixed(2)} ms`, `- p99 median: ${aggregate.p99Ms.toFixed(2)} ms`,
      `- Max infrastructure error rate: ${(aggregate.maxSystemErrorRate * 100).toFixed(4)}%`,
      `- Accepted bids: ${aggregate.acceptedBids}`, `- Business rejections: ${aggregate.businessRejections}`,
      `- Accepted bids/s median: ${aggregate.acceptedBidsPerSecond.toFixed(2)}`,
      `- Rejected bids/s median: ${aggregate.rejectedBidsPerSecond.toFixed(2)}`,
      `- Acceptance ratio median: ${(aggregate.acceptanceRatio * 100).toFixed(2)}%`,
      `- Throughput CV: ${(aggregate.throughputStability.coefficientOfVariation * 100).toFixed(2)}%`,
      `- Throughput range: ${aggregate.throughputStability.min.toFixed(2)}-${aggregate.throughputStability.max.toFixed(2)} req/s`,
      `- p95 range: ${aggregate.p95Stability.min.toFixed(2)}-${aggregate.p95Stability.max.toFixed(2)} ms`,
      `- Stability: ${runs < 2 ? "INSUFFICIENT SAMPLES" : aggregate.stabilityWarning ? "UNSTABLE (warning; not an automatic gate failure)" : "STABLE"}`,
      `- Bidding core invariants: ${aggregate.corePassed ? "PASS" : "FAIL"}`,
      `- Downstream Kafka freshness: ${aggregate.downstreamPassed ? "PASS" : "FAIL"}`,
      `- Benchmark gate: ${passed ? "PASS" : "FAIL"}`, "",
      "This report is valid only with its paired manifest, invariant reports and environment metadata.", "",
    ].join("\n");
    await writeJson(resolve(outputRoot, "summary.json"), { runId, scenario, profile, aggregate, passed, runs: runRecords.map(({ summary, invariants, ...record }) => record) });
    await writeFile(resolve(outputRoot, "report.md"), report + (continueOnGateFailure
      ? "\nDiagnostic continuation was enabled. This report must not be used as an official benchmark claim.\n"
      : ""), "utf8");
    await recordRunnerPhase(outputRoot, "completed", { passed, runs: runRecords.length });
    return { outputRoot, runId, scenario, aggregate, passed };
  } catch (error) {
    await writeJson(resolve(outputRoot, "runner-error.json"), {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      recordedAt: new Date().toISOString(),
    }).catch(() => undefined);
    throw error;
  } finally {
    if (!keepEnvironment) await dockerCompose(project, sourceRoot, runId, ["down", "--volumes", "--remove-orphans"], true).catch(() => undefined);
  }
}

async function benchmark(args) {
  await preflight(args);
  const result = await executeSuite(args);
  process.stdout.write(`Benchmark ${result.passed ? "PASS" : "FAIL"}: ${result.outputRoot}\n`);
  if (!result.passed) process.exitCode = 1;
}

async function compare(args) {
  await preflight(args);
  const baseline = args.baseline;
  if (!baseline || baseline === true) throw new Error("compare requires --baseline <clean-git-sha>");
  const scenarios = String(args.scenarios ?? "hot,distributed").split(",").map((value) => value.trim());
  const comparisonId = runIdFor("comparison");
  const outputRoot = resolve(args.output ?? resolve(performanceRoot, "artifacts/runs"), comparisonId);
  const worktree = resolve(performanceRoot, ".worktrees", `${comparisonId}-baseline`);
  await mkdir(outputRoot, { recursive: true });
  const clean = (await command("git", ["status", "--porcelain"], { quiet: true })).stdout.trim();
  if (clean) throw new Error("compare requires a clean current worktree so target evidence is reproducible");
  await command("git", ["worktree", "add", "--detach", worktree, String(baseline)]);
  try {
    const results = {};
    for (const scenario of scenarios) {
      const base = await executeSuite({ ...args, scenario, "source-root": worktree, "run-id": `${comparisonId}-before-${scenario}`, output: outputRoot });
      const target = await executeSuite({ ...args, scenario, "source-root": repositoryRoot, "run-id": `${comparisonId}-after-${scenario}`, output: outputRoot });
      results[scenario] = { baseline: base.aggregate, target: target.aggregate, comparison: compareRevisionSummaries(base.aggregate, target.aggregate) };
    }
    const passed = Object.values(results).every((result) => result.comparison.passed);
    await writeJson(resolve(outputRoot, "comparison.json"), { comparisonId, baseline, target: "HEAD", results, passed });
    const rows = Object.entries(results).map(([scenario, result]) =>
      `| ${scenario} | ${result.baseline.throughput.toFixed(2)} | ${result.target.throughput.toFixed(2)} | ${(result.comparison.throughputChange * 100).toFixed(2)}% | ${result.baseline.p99Ms.toFixed(2)} | ${result.target.p99Ms.toFixed(2)} | ${(result.comparison.p99Change * 100).toFixed(2)}% | ${result.comparison.passed ? "PASS" : "FAIL"} |`);
    await writeFile(resolve(outputRoot, "comparison.md"), ["# Clean revision benchmark comparison", "", `- Baseline: \`${baseline}\``, "- Target: `HEAD`", "", "| Scenario | Before req/s | After req/s | Throughput change | Before p99 | After p99 | p99 change | Gate |", "|---|---:|---:|---:|---:|---:|---:|---|", ...rows, ""].join("\n"), "utf8");
    process.stdout.write(`Comparison ${passed ? "PASS" : "FAIL"}: ${outputRoot}\n`);
    if (!passed) process.exitCode = 1;
  } finally {
    await command("git", ["worktree", "remove", "--force", worktree], { allowFailure: true }).catch(() => undefined);
    await rm(worktree, { recursive: true, force: true });
  }
}

const [action = "benchmark", ...rawArgs] = process.argv.slice(2);
const args = parseArgs(rawArgs);
// npm can expose arguments after `--` as npm_config_* environment variables
// on Windows shells. Preserve the explicit CLI value when it is present, but
// also honor the resource-profile override in that execution mode.
if (args["allow-low-resources"] === undefined && process.env.npm_config_allow_low_resources !== undefined) {
  args["allow-low-resources"] = process.env.npm_config_allow_low_resources;
}
const actions = { benchmark, compare };
if (!actions[action]) throw new Error(`Unknown command '${action}'. Use benchmark or compare.`);
actions[action](args).catch((error) => {
  const output = error instanceof BenchmarkGateError ? error.message : error instanceof Error ? error.stack : error;
  process.stderr.write(`${output}\n`);
  process.exitCode = 1;
});
