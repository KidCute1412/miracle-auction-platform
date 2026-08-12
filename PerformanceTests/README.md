# Isolated auction benchmark

This folder runs repeatable local k6 benchmarks for the Redis-authoritative bidding pipeline. It never connects to production, Oracle, Aiven, Supabase, or the development Docker stack.

## Prerequisites

- Docker Desktop with Compose v2
- Node.js 20+
- k6 installed and available on `PATH`
- `npm ci` in `PerformanceTests`
- At least 4 Docker CPUs and 6 GiB Docker/WSL2 RAM for the official distributed three-run suite

The runner builds an independent Compose project containing PostgreSQL, Redis, Kafka, the API, `auction-worker`, `outbox-relay`, and `async-worker`. Every measured attempt gets its own project, volumes, network, migrations, deterministic seed, and temporary host port; that stack is removed before the next attempt starts. This prevents Kafka backlog, database pressure, and cache state from leaking between runs.

## Run a benchmark

```powershell
cd PerformanceTests
npm ci

# Fast correctness and wiring check
npm run benchmark:smoke

# Measured workload: three independent seeded runs
npm run benchmark:hot
npm run benchmark:distributed
npm run benchmark:bid-path
```

The normal hot and distributed commands always run all three configured attempts and produce a diagnostic aggregate even when latency thresholds fail. They never turn a failed suite into an official claim. A strict fail-fast run can be invoked through the generic CLI with continuation disabled. The normal commands are:

```powershell
# Always run all three hot runs; report is diagnostic-only when a gate fails
npm.cmd run benchmark:hot

# Always run all three distributed runs; report is diagnostic-only when a gate fails
npm.cmd run benchmark:distributed

# Durable HTTP bid path (Redis replica ACK + auction projection), with dashboard
# and notification consumers excluded during measurement. This is diagnostic-only.
npm.cmd run benchmark:bid-path
```

Diagnostic continuation still records each failed run and computes descriptive median statistics, but it never turns a failed suite into an official claim. A bidding-core invariant failure must still be investigated; continuing does not make the run valid. Dashboard and notification Kafka freshness is reported as a separate downstream gate because those consumers are side effects, not bid acceptance or winner state. Every measured attempt uses a lightweight 5-second smoke warm-up so local workers and PostgreSQL are not overloaded before measurement. Invariant checks wait up to 30 seconds for convergence by default. Reports include throughput CV and p95 spread; CV above 10% is an instability warning, not an automatic gate failure. Use `--keep-env=true` only to investigate a failed run. The CLI prints the artifact directory. Results are written to `artifacts/runs/<run-id>/`; raw k6 output is gzip-compressed and ignored by Git.

## Compare clean revisions

```powershell
npm run compare -- --baseline <clean-git-sha> --scenarios hot,distributed --runs 3
```

The command refuses a dirty current worktree, creates a temporary detached worktree for the baseline, runs both revisions through the same benchmark tooling and emits median comparison data. It passes only when every run has valid invariants, infrastructure errors stay below 1%, throughput does not regress more than 5%, and p99 does not increase more than 5%.

## Configuration

Profiles are in `config/profiles.js`:

- `smoke`: one VU, pipeline validation.
- `baseline`: steady low-contention reference.
- `hot`: concurrent bids on one auction.
- `distributed`: deterministic traffic across auctions.
- `bid-path`: durable bid-path diagnostic without dashboard/notification worker contention; it checks core invariants but deliberately skips downstream Kafka freshness and is not a CV/official claim.
- `spike`: abrupt burst and recovery.
- `soak`: long stability run.

For custom runs, call Node directly (this avoids npm argument-forwarding differences between shells): `node cli/index.js benchmark --scenario=hot --runs=5 --duration=30s`. Optional parameters include `--duration`, `--warmup-duration`, `--convergence-timeout-ms`, `--runs`, `--output`, `--projector-concurrency`, `--keep-env`, and `--continue=true` (the longer `--continue-on-gate-failure=true` name is also supported). The official distributed command refuses an undersized Docker allocation; `--allow-low-resources=true` is only for non-claim profiling. Use `--allow-competing-stacks=true` only after verifying the other containers cannot distort the result. The benchmark manifest determines product IDs, bidder IDs and bid prices; k6 does not hard-code a dataset.

The default benchmark topology uses 16 keyed projector lanes and 16 dashboard receipt handlers. The dashboard consumer has no per-batch sleep because it already coalesces its expensive dashboard refresh to once per Kafka batch, and caps each partition fetch at 128 KiB so a large burst does not hold the committed offset behind thousands of receipt writes. These are throughput settings, not correctness shortcuts: Kafka offsets are still committed only after the batch receipts and refresh succeed.

## Evidence and interpretation

Each attempt saves its k6 summary/report, compressed raw events, seed manifest and invariant result. The final `report.md` includes a per-run table plus median, range, CV, latency, acceptance, correctness and downstream gate overview; `summary.json` also exposes machine-readable `runMetrics`. Invariant artifacts expose `corePassed` and `downstreamPassed` separately; `corePassed` covers Redis/PostgreSQL auction state, Stream, outbox and ordering, while `downstreamPassed` covers dashboard/notification Kafka consumer freshness. The suite also saves periodic container CPU/memory/I/O samples and `/ready` metrics for auth cache, Redis mutation and replica ACK latency. Final metadata includes Docker CPU and memory allocation. A request is a **bid attempt**; `accepted_bids` and `business_rejections` are reported separately. HTTP 400/403/409/429 are expected business outcomes, while 5xx/network failures are infrastructure errors.

Do not publish a CV performance claim until a clean three-run report has passed and its report, metadata, summary and invariants have been copied to `docs/testing/benchmarks/<revision>/`. Historical `artifacts/process-split` results are retained only for audit.
