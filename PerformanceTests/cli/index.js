import { spawn } from "node:child_process";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { createReadStream, createWriteStream } from "node:fs";
import { pipeline } from "node:stream/promises";
import { createGzip } from "node:zlib";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { compareBidEngines, compareRevisionSummaries, describeRunGateFailures, diagnosticContinuationEnabled, metric, officialResourceEligibility, summarizeRuns } from "../lib/metrics.js";
import { benchmarkTuningEnvironment, resolveBenchmarkTuning } from "../lib/benchmark-tuning.js";
import { benchmarkResourceProfileEnvironment, resolveBenchmarkResourceProfile } from "../lib/benchmark-resource-profile.js";
import { auctionRedisUrls, redisShardResourceEnvironment, resolveRedisShards } from "../lib/benchmark-redis-shards.js";
import { resolveProfile } from "../config/profiles.js";

const performanceRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repositoryRoot = resolve(performanceRoot, "..");
const composeFile = resolve(performanceRoot, "compose/benchmark.compose.yml");

class BenchmarkGateError extends Error {}

function imageTagFor(runId) {
  return runId.replace(/[^a-z0-9_.-]/gi, "-").toLowerCase();
}

function resolveBidEngine(value = "redis") {
  if (value === "redis" || value === "postgres") return value;
  throw new Error(`Unsupported benchmark bid engine '${value}'. Expected redis or postgres.`);
}

async function buildRuntimeImages(sourceRoot, imageTag) {
  const dockerfile = resolve(sourceRoot, "Backend/Dockerfile");
  await command("docker", ["build", "--target", "runtime", "-t", `online-auction-benchmark-runtime:${imageTag}`, "-f", dockerfile, sourceRoot]);
  await command("docker", ["build", "--target", "migrator", "-t", `online-auction-benchmark-migrator:${imageTag}`, "-f", dockerfile, sourceRoot]);
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
    let settled = false;
    let timeout;
    const finish = (callback, value) => {
      if (settled) return;
      settled = true;
      if (timeout) clearTimeout(timeout);
      callback(value);
    };
    if (options.quiet) {
      child.stdout.on("data", (chunk) => { stdout += chunk; });
      child.stderr.on("data", (chunk) => { stderr += chunk; });
    }
    timeout = options.timeoutMs && options.timeoutMs > 0
      ? setTimeout(() => {
        child.kill();
        const error = new Error(`${commandName} ${commandArgs.join(" ")} timed out after ${options.timeoutMs}ms`);
        error.code = "COMMAND_TIMEOUT";
        finish(rejectCommand, error);
      }, options.timeoutMs)
      : undefined;
    child.on("error", (error) => finish(rejectCommand, error));
    child.on("close", (code) => {
      if (code === 0 || options.allowFailure) finish(resolveCommand, { code, stdout, stderr });
      else finish(rejectCommand, new Error(`${commandName} ${commandArgs.join(" ")} failed with exit code ${code}${stderr ? `: ${stderr}` : ""}${stdout ? `\n${stdout}` : ""}`));
    });
  });
}

function dockerCompose(project, sourceRoot, runId, args, quiet = false, options = {}) {
  return command("docker", ["compose", "-p", project, "-f", composeFile, ...args], {
    quiet,
    allowFailure: options.allowFailure,
    timeoutMs: options.timeoutMs,
    env: {
      BENCHMARK_SOURCE_ROOT: sourceRoot,
      BENCHMARK_RUN_ID: runId,
      BENCHMARK_IMAGE_TAG: options.imageTag ?? imageTagFor(runId),
      BID_DURABILITY_REPLICAS: options.durabilityReplicas ?? process.env.BID_DURABILITY_REPLICAS,
      ...benchmarkResourceProfileEnvironment(options.resourceProfile ?? resolveBenchmarkResourceProfile(undefined, process.env)),
      ...redisShardResourceEnvironment(options.resourceProfile ?? resolveBenchmarkResourceProfile(undefined, process.env), options.redisShards ?? 1),
      ...benchmarkTuningEnvironment(options.tuning ?? resolveBenchmarkTuning({}, process.env)),
      BID_ENGINE: options.bidEngine ?? process.env.BID_ENGINE ?? "redis",
      AUCTION_REDIS_URLS: auctionRedisUrls(options.redisShards ?? 1),
      COMPOSE_PROFILES: options.downstream === false ? "" : "downstream",
    },
  });
}

async function cleanupBenchmarkProject(project, sourceRoot, runId, options = {}) {
  if (!project) return true;
  const result = await dockerCompose(
    project,
    sourceRoot,
    runId,
    ["down", "--volumes", "--remove-orphans"],
    true,
    { ...options, allowFailure: true },
  );
  if (result.code !== 0) {
    process.stderr.write(`[benchmark] cleanup failed for ${project}; run docker compose -p ${project} -f PerformanceTests/compose/benchmark.compose.yml down --volumes --remove-orphans\n`);
    return false;
  }
  return true;
}

function asBoolean(value) {
  return value === true || value === "true";
}

function runIdFor(prefix = "run") {
  const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14);
  return `${prefix}-${timestamp}-${Math.random().toString(16).slice(2, 8)}`;
}

function benchmarkRunIdFromProject(project) {
  const match = /^auction-benchmark-(.+)-r\d+$/.exec(project);
  return match?.[1];
}

function runnerOwnerPath(runId) {
  return resolve(performanceRoot, "artifacts/runs", runId, "runner-owner.json");
}

function isProcessAlive(pid) {
  if (!Number.isInteger(pid) || pid <= 0) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return error?.code === "EPERM";
  }
}

async function isActiveBenchmarkProject(project) {
  const runId = benchmarkRunIdFromProject(project);
  if (!runId) return false;
  try {
    const owner = JSON.parse(await readFile(runnerOwnerPath(runId), "utf8"));
    return isProcessAlive(Number(owner.pid));
  } catch {
    return false;
  }
}

async function preflight(options = {}) {
  for (const [binary, args] of [["docker", ["version", "--format", "{{.Client.Version}}"]], ["k6", ["version"]], ["git", ["--version"]]]) {
    await command(binary, args, { quiet: true });
  }
  if (!asBoolean(options["allow-competing-stacks"])) {
    const running = await command("docker", ["ps", "--filter", "label=com.docker.compose.project", "--format", "{{.Label \"com.docker.compose.project\"}}"], { quiet: true });
    const competitors = [...new Set(running.stdout.split(/\r?\n/).filter((name) => name === "online-auction" || name.startsWith("auction-benchmark-")))];
    const staleProjects = [];
    const activeCompetitors = [];
    for (const project of competitors) {
      if (project.startsWith("auction-benchmark-") && !await isActiveBenchmarkProject(project)) staleProjects.push(project);
      else activeCompetitors.push(project);
    }
    const sourceRoot = resolve(options["source-root"] ?? repositoryRoot);
    for (const staleProject of staleProjects) {
      process.stdout.write(`[benchmark] removing orphaned benchmark stack ${staleProject}\n`);
      await cleanupBenchmarkProject(staleProject, sourceRoot, staleProject, { allowFailure: true });
    }
    if (activeCompetitors.length) throw new Error(`Competing auction stack detected (${activeCompetitors.join(", ")}). Wait for it to finish or pass --allow-competing-stacks=true.`);
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

async function waitForReady(baseUrl, timeoutMs = 300_000) {
  const deadline = Date.now() + timeoutMs;
  let lastError = "not checked";
  let attempts = 0;
  while (Date.now() < deadline) {
    attempts += 1;
    let timeout;
    try {
      const controller = new AbortController();
      timeout = setTimeout(() => controller.abort(), 5_000);
      const response = await fetch(`${baseUrl}/ready`, { signal: controller.signal });
      if (response.status === 200) return;
      lastError = `ready returned ${response.status}`;
    } catch (error) {
      lastError = error instanceof Error ? error.message : "unknown request error";
    } finally {
      if (timeout) clearTimeout(timeout);
    }
    if (attempts % 5 === 0) process.stdout.write(`[benchmark] waiting for API readiness (${Math.round((Date.now() - (deadline - timeoutMs)) / 1000)}s/${Math.round(timeoutMs / 1000)}s; ${lastError})\n`);
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
    redisShards: composeOptions.redisShards ?? 1,
    auctionRedisUrls: auctionRedisUrls(composeOptions.redisShards ?? 1).split(","),
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
  const profile = resolveProfile(scenario, options.duration, options.vus);
  const runs = Number(options.runs ?? (scenario === "smoke" ? 1 : 3));
  if (!Number.isInteger(runs) || runs < 1) throw new Error("--runs must be a positive integer");
  const sourceRoot = resolve(options["source-root"] ?? repositoryRoot);
  const runId = options["run-id"] ?? runIdFor(scenario);
  const project = `auction-benchmark-${runId}`.replace(/[^a-z0-9_-]/gi, "").toLowerCase();
  const outputRoot = resolve(options.output ?? resolve(performanceRoot, "artifacts/runs"), runId);
  const keepEnvironment = asBoolean(options["keep-env"]);
  const bidEngine = resolveBidEngine(options["bid-engine"] ?? options.bidEngine);
  const continueOnGateFailure = diagnosticContinuationEnabled(
    options.continue ?? options["continue-on-gate-failure"],
  );
  const tuning = resolveBenchmarkTuning(options);
  const resourceProfile = resolveBenchmarkResourceProfile(options["resource-profile"]);
  const redisShards = resolveRedisShards(options["redis-shards"] ?? process.env.BENCHMARK_REDIS_SHARDS ?? 1);
  const composeOptions = {
    bidEngine,
    durabilityReplicas: profile.durable === false ? "0" : "1",
    tuning,
    resourceProfile,
    redisShards,
    downstream: profile.downstream !== false,
  };
  // Keep warm-up intentionally lightweight: a full 100-VU warm-up creates
  // database/Kafka backlog on local runners and depresses the measured run.
  const warmupDuration = options["warmup-duration"] ?? "5s";
  const convergenceTimeoutMs = Number(options["convergence-timeout-ms"] ?? 30_000);
  if (!Number.isFinite(convergenceTimeoutMs) || convergenceTimeoutMs < 0) throw new Error("--convergence-timeout-ms must be a non-negative number");
  const runRecords = [];
  const projectsCreated = new Set();
  process.stdout.write(`[benchmark] scenario=${scenario} runs=${runs} redis-shards=${redisShards} profile=${profile.productMode}${options.duration ? ` duration=${options.duration}` : ""}\n`);
  await mkdir(outputRoot, { recursive: true });
  await writeJson(runnerOwnerPath(runId), { pid: process.pid, runId, startedAt: new Date().toISOString() });
  await writeJson(resolve(outputRoot, "run-config.json"), {
    runId, scenario, runs, profile, sourceRoot, project, bidEngine,
    continueOnGateFailure,
    diagnosticOnly: continueOnGateFailure,
    isolation: "fresh-stack-per-run",
    warmupDuration,
    convergenceTimeoutMs,
    tuning,
    resourceProfile,
    redisShards,
    auctionRedisUrls: auctionRedisUrls(redisShards).split(","),
  });
  try {
    await recordRunnerPhase(outputRoot, "building-runtime-images");
    const imageTag = options["image-tag"] ?? imageTagFor(runId);
    if (!asBoolean(options["skip-build"])) await buildRuntimeImages(sourceRoot, imageTag);
    const attemptComposeOptions = { ...composeOptions, imageTag };
    for (let attempt = 1; attempt <= runs; attempt += 1) {
      const attemptRunId = `${runId}-r${attempt}`;
      const attemptProject = `auction-benchmark-${attemptRunId}`.replace(/[^a-z0-9_-]/gi, "").toLowerCase();
      projectsCreated.add(attemptProject);
      let baseUrl;
      await recordRunnerPhase(outputRoot, "starting-compose", { attempt, runs, project: attemptProject });
      try {
        try {
          await dockerCompose(attemptProject, sourceRoot, attemptRunId, ["up", "-d", "--no-build"], false, {
            ...attemptComposeOptions,
            timeoutMs: 120_000,
          });
        } catch (error) {
          if (error?.code !== "COMMAND_TIMEOUT") throw error;
          process.stdout.write(`[benchmark] compose up timed out for attempt ${attempt}; checking the started stack instead\n`);
        }
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
            SCENARIO: "smoke", DURATION: warmupDuration, BASE_URL: baseUrl, CLIENT_URL: "http://benchmark.local",
            MANIFEST_PATH: warmupManifestPath, TOKENS_PATH: warmupTokensPath,
            ARTIFACT_PREFIX: resolve(outputRoot, `${scenario}-${attempt}-warmup`),
          },
        });
        await recordRunnerPhase(outputRoot, "checking-warmup-invariants", { attempt, runs, project: attemptProject });
        await dockerCompose(attemptProject, sourceRoot, attemptRunId, [
          "exec", "-T", "api", "sh", "-lc",
          `NODE_ENV=benchmark BID_ENGINE=${bidEngine} WAIT_FOR_CONVERGENCE_MS=${convergenceTimeoutMs} npm run benchmark:invariants`,
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
            VUS: profile.vus === undefined ? "" : String(profile.vus),
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
        `NODE_ENV=benchmark BID_ENGINE=${bidEngine} WAIT_FOR_CONVERGENCE_MS=${convergenceTimeoutMs} INVARIANT_OUTPUT=${invariantContainerPath} npm run benchmark:invariants`,
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
        process.stderr.write(`Benchmark run ${attempt}: downstream Kafka freshness did not converge; recorded as an observation and excluded from the bid-path gate.\n`);
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
          await cleanupBenchmarkProject(attemptProject, sourceRoot, attemptRunId, attemptComposeOptions);
        } else {
          process.stdout.write(`[benchmark] keeping environment for attempt ${attempt}: ${attemptProject}\n`);
        }
      }
    }
    await recordRunnerPhase(outputRoot, "collecting-metadata");
    const aggregate = summarizeRuns(runRecords);
    const officialGate = scenario === "bid-path" ? false : scenario !== "distributed" || (
      aggregate.throughput >= 300 && aggregate.acceptedBidsPerSecond >= 150 &&
      aggregate.acceptanceRatio >= 0.5 && aggregate.p95Ms < 500 && aggregate.p99Ms < 1000
    );
    const passed = officialGate && aggregate.invariantsPassed && aggregate.maxSystemErrorRate === 0 &&
      runRecords.every((record) => record.k6Passed && record.invariantCommandPassed);
    const runMetrics = runRecords.map((record) => ({
      attempt: record.attempt,
      throughput: metric(record.summary, "http_reqs", "rate"),
      p95Ms: metric(record.summary, "http_req_duration", "p(95)"),
      p99Ms: metric(record.summary, "http_req_duration", "p(99)"),
      systemErrorRate: metric(record.summary, "system_errors", "rate"),
      acceptedBidsPerSecond: metric(record.summary, "accepted_bids", "rate"),
      acceptanceRatio: metric(record.summary, "accepted_ratio", "rate"),
      k6Passed: record.k6Passed,
      corePassed: record.invariants.corePassed ?? record.invariants.passed,
      downstreamPassed: record.invariants.downstreamPassed ?? record.invariants.passed,
    }));
    const runTable = [
      "| Run | Throughput | Accepted/s | p95 | p99 | Errors | Acceptance | Core | Downstream | k6 |",
      "|---:|---:|---:|---:|---:|---:|---:|:---:|:---:|:---:|",
      ...runMetrics.map((run) => `| ${run.attempt} | ${run.throughput.toFixed(2)} req/s | ${run.acceptedBidsPerSecond.toFixed(2)} | ${run.p95Ms.toFixed(2)} ms | ${run.p99Ms.toFixed(2)} ms | ${(run.systemErrorRate * 100).toFixed(4)}% | ${(run.acceptanceRatio * 100).toFixed(2)}% | ${run.corePassed ? "PASS" : "FAIL"} | ${run.downstreamPassed ? "PASS" : "FAIL"} | ${run.k6Passed ? "PASS" : "FAIL"} |`),
    ];
    const report = [
      `# Auction bidding benchmark: ${scenario}`, "",
      `- Run ID: \`${runId}\``, `- Revision: \`${(await command("git", ["-C", sourceRoot, "rev-parse", "HEAD"], { quiet: true })).stdout.trim()}\``,
      `- Runs: ${runs}`, `- Throughput median: ${aggregate.throughput.toFixed(2)} req/s`,
      `- Redis auction shards: ${redisShards} (${auctionRedisUrls(redisShards)})`,
      `- Resource profile: ${resourceProfile.name} (${Object.entries(resourceProfile.limits).map(([name, limit]) => `${name}=${limit}`).join(", ")} CPU)`,
      `- Tuning: mutation=${tuning.mutationConnections}; projector=${tuning.projectorConcurrency}; dashboard=${tuning.dashboardBatchConcurrency}; notification=${tuning.notificationBatchConcurrency}`,
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
      `- Downstream Kafka freshness (observation only): ${profile.downstream === false ? "SKIPPED (bid-path diagnostic)" : aggregate.downstreamPassed ? "PASS" : "LAGGING"}`,
      `- Benchmark gate (bid core only): ${profile.downstream === false ? "DIAGNOSTIC ONLY" : passed ? "PASS" : "FAIL"}`, "",
      "## Per-run results", "", ...runTable, "",
      "This report is valid only with its paired manifest, invariant reports and environment metadata.", "",
    ].join("\n");
    await writeJson(resolve(outputRoot, "summary.json"), { runId, scenario, profile, bidEngine, tuning, resourceProfile, redisShards, auctionRedisUrls: auctionRedisUrls(redisShards).split(","), aggregate, passed, runMetrics, runs: runRecords.map(({ summary, invariants, ...record }) => record) });
    await writeFile(resolve(outputRoot, "report.md"), report + (continueOnGateFailure
      ? "\nDiagnostic continuation was enabled. This report must not be used as an official benchmark claim.\n"
      : ""), "utf8");
    process.stdout.write([
      "",
      `[benchmark] FINAL SUMMARY (${scenario}, ${runs} runs)`,
      `median throughput=${aggregate.throughput.toFixed(2)} req/s; accepted=${aggregate.acceptedBidsPerSecond.toFixed(2)} bids/s; p95=${aggregate.p95Ms.toFixed(2)} ms; p99=${aggregate.p99Ms.toFixed(2)} ms`,
      `throughput range=${aggregate.throughputStability.min.toFixed(2)}-${aggregate.throughputStability.max.toFixed(2)} req/s; CV=${(aggregate.throughputStability.coefficientOfVariation * 100).toFixed(2)}%; infra errors=${(aggregate.maxSystemErrorRate * 100).toFixed(4)}%`,
      `gates: core=${aggregate.corePassed ? "PASS" : "FAIL"}, downstream=${profile.downstream === false ? "SKIPPED" : aggregate.downstreamPassed ? "PASS" : "LAGGING (observation)"}, benchmark=${profile.downstream === false ? "DIAGNOSTIC" : passed ? "PASS" : "FAIL"}`,
      "run | req/s | accepted/s | p95 ms | p99 ms | core | downstream",
      ...runMetrics.map((run) => `${run.attempt} | ${run.throughput.toFixed(2)} | ${run.acceptedBidsPerSecond.toFixed(2)} | ${run.p95Ms.toFixed(2)} | ${run.p99Ms.toFixed(2)} | ${run.corePassed ? "PASS" : "FAIL"} | ${profile.downstream === false ? "SKIPPED" : run.downstreamPassed ? "PASS" : "FAIL"}`),
      `report: ${resolve(outputRoot, "report.md")}`,
      "",
    ].join("\n"));
    await recordRunnerPhase(outputRoot, "completed", { passed, runs: runRecords.length });
    return { outputRoot, runId, scenario, bidEngine, aggregate, passed };
  } catch (error) {
    await writeJson(resolve(outputRoot, "runner-error.json"), {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      recordedAt: new Date().toISOString(),
    }).catch(() => undefined);
    throw error;
  } finally {
    if (!keepEnvironment) {
      // A failed compose/k6/invariant step can bypass the normal per-attempt
      // cleanup path. Sweep every project created by this invocation as well
      // as the parent project so the next benchmark is never blocked by a
      // leftover container.
      projectsCreated.add(project);
      for (const staleProject of projectsCreated) {
        await cleanupBenchmarkProject(staleProject, sourceRoot, runId, { allowFailure: true });
      }
    }
    await rm(runnerOwnerPath(runId), { force: true });
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

function formatPercent(value) {
  return value === null ? "n/a" : `${(value * 100).toFixed(2)}%`;
}

function engineRunRow(name, result) {
  if (!result) return `| ${name} | unavailable | unavailable | unavailable | unavailable | unavailable | FAIL | FAIL |`;
  const aggregate = result.aggregate;
  return `| ${name} | ${aggregate.throughput.toFixed(2)} | ${aggregate.acceptedBidsPerSecond.toFixed(2)} | ${aggregate.p95Ms.toFixed(2)} | ${aggregate.p99Ms.toFixed(2)} | ${(aggregate.maxSystemErrorRate * 100).toFixed(4)}% | ${aggregate.corePassed ? "PASS" : "FAIL"} | ${aggregate.downstreamPassed ? "PASS" : "FAIL"} |`;
}

async function compareEngines(args) {
  await preflight(args);
  const scenario = args.scenario ?? "distributed";
  if (scenario !== "distributed") throw new Error("compare-engines supports only the distributed profile so both engines share the full topology");
  const runs = Number(args.runs ?? 1);
  if (!Number.isInteger(runs) || runs < 1) throw new Error("--runs must be a positive integer");

  const comparisonId = args["run-id"] ?? runIdFor("compare-redis-pessimistic");
  const outputRoot = resolve(args.output ?? resolve(performanceRoot, "artifacts/runs"), comparisonId);
  const imageTag = imageTagFor(comparisonId);
  await mkdir(outputRoot, { recursive: true });
  const [revision, dirty] = await Promise.all([
    command("git", ["rev-parse", "HEAD"], { quiet: true }),
    command("git", ["status", "--porcelain"], { quiet: true }),
  ]);
  await writeJson(resolve(outputRoot, "comparison-config.json"), {
    comparisonId,
    scenario,
    runs,
    engines: ["redis", "postgres"],
    revision: revision.stdout.trim(),
    dirty: Boolean(dirty.stdout.trim()),
    sourceRoot: repositoryRoot,
    measuredAt: new Date().toISOString(),
  });

  process.stdout.write(`[benchmark] comparing Redis authority with PostgreSQL pessimistic lock (${runs} run per engine)\n`);
  await buildRuntimeImages(repositoryRoot, imageTag);

  const results = {};
  const errors = {};
  for (const bidEngine of ["redis", "postgres"]) {
    try {
      results[bidEngine] = await executeSuite({
        ...args,
        scenario,
        runs,
        "bid-engine": bidEngine,
        "run-id": `${comparisonId}-${bidEngine}`,
        output: resolve(outputRoot, bidEngine),
        "image-tag": imageTag,
        "skip-build": true,
        continue: true,
      });
    } catch (error) {
      errors[bidEngine] = error instanceof Error ? { message: error.message, stack: error.stack } : { message: String(error) };
      process.stderr.write(`[benchmark] ${bidEngine} comparison side failed to execute; continuing with the other engine.\n`);
    }
  }

  const comparison = results.redis && results.postgres
    ? compareBidEngines(results.redis.aggregate, results.postgres.aggregate)
    : { valid: false, delta: { throughput: null, acceptedBidsPerSecond: null, p95Ms: null, p99Ms: null }, verdict: "INVALID" };
  await writeJson(resolve(outputRoot, "comparison.json"), {
    comparisonId,
    scenario,
    runs,
    revision: revision.stdout.trim(),
    dirty: Boolean(dirty.stdout.trim()),
    redis: results.redis?.aggregate,
    postgres: results.postgres?.aggregate,
    errors,
    comparison,
  });
  const report = [
    "# Redis authority vs PostgreSQL pessimistic-lock benchmark", "",
    `- Revision: \`${revision.stdout.trim()}\``, `- Dirty worktree: ${dirty.stdout.trim() ? "yes" : "no"}`,
    `- Profile: \`${scenario}\`; runs per engine: ${runs}`, "",
    "| Engine | req/s | Accepted/s | p95 ms | p99 ms | Infra errors | Core | Downstream |",
    "|---|---:|---:|---:|---:|---:|:---:|:---:|",
    engineRunRow("Redis authority", results.redis),
    engineRunRow("PostgreSQL FOR UPDATE", results.postgres),
    "", "## Redis delta vs PostgreSQL", "",
    `- Throughput: ${formatPercent(comparison.delta.throughput)}`,
    `- Accepted bids/s: ${formatPercent(comparison.delta.acceptedBidsPerSecond)}`,
    `- p95 latency: ${formatPercent(comparison.delta.p95Ms)}`,
    `- p99 latency: ${formatPercent(comparison.delta.p99Ms)}`,
    `- Comparison: **${comparison.verdict}**`, "",
    "Redis responds after Lua/XADD and replica acknowledgement; PostgreSQL responds after its locked transaction commits. This is an end-to-end architecture comparison, not a lock-only microbenchmark.", "",
  ].join("\n");
  await writeFile(resolve(outputRoot, "comparison.md"), report, "utf8");
  process.stdout.write([
    "", "[benchmark] REDIS vs POSTGRES PESSIMISTIC-LOCK",
    "engine | req/s | accepted/s | p95 ms | p99 ms | infra errors | core | downstream",
    engineRunRow("redis", results.redis),
    engineRunRow("postgres", results.postgres),
    `delta Redis vs PostgreSQL: throughput=${formatPercent(comparison.delta.throughput)}; accepted=${formatPercent(comparison.delta.acceptedBidsPerSecond)}; p95=${formatPercent(comparison.delta.p95Ms)}; p99=${formatPercent(comparison.delta.p99Ms)}`,
    `comparison: ${comparison.verdict}`,
    `report: ${resolve(outputRoot, "comparison.md")}`, "",
  ].join("\n"));
  if (!comparison.valid) process.exitCode = 1;
}

const [action = "benchmark", ...rawArgs] = process.argv.slice(2);
const args = parseArgs(rawArgs);
// npm can expose arguments after `--` as npm_config_* environment variables
// on Windows shells. Preserve the explicit CLI value when it is present, but
// also honor the resource-profile override in that execution mode.
if (args["allow-low-resources"] === undefined && process.env.npm_config_allow_low_resources !== undefined) {
  args["allow-low-resources"] = process.env.npm_config_allow_low_resources;
}
const actions = { benchmark, compare, "compare-engines": compareEngines };
if (!actions[action]) throw new Error(`Unknown command '${action}'. Use benchmark, compare or compare-engines.`);
actions[action](args).catch((error) => {
  const output = error instanceof BenchmarkGateError ? error.message : error instanceof Error ? error.stack : error;
  process.stderr.write(`${output}\n`);
  process.exitCode = 1;
});
