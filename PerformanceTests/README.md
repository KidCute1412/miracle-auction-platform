# Local process-split bidding benchmark

Benchmarks run only against local deterministic data. Never point k6 at Aiven, Supabase, Oracle Free Tier or shared production.

## Runtime under test

Run PostgreSQL, Redis, Kafka, `auction-worker`, `outbox-relay`, `async-worker` and API. Set `EMAIL_DELIVERY_MODE=disabled`. Background projection, outbox and dashboard work remain enabled so results include production-like contention.

```powershell
docker compose up -d postgres redis kafka
cd Backend
npm run prisma:migrate:deploy
$env:NODE_ENV="benchmark"; $env:DATABASE_URL="postgresql://postgres:my_local_password@localhost:15432/online_auction_benchmark_test?schema=public"; npm run benchmark:seed
cd ..
docker compose -f docker-compose.yml -f PerformanceTests/docker-compose.benchmark.override.yml up -d auction-worker outbox-relay async-worker
```

Start the API separately with `BID_ENGINE=redis`, `REDIS_URL=redis://127.0.0.1:16379/1`,
`DATABASE_URL=postgresql://postgres:my_local_password@localhost:15432/online_auction_benchmark_test?schema=public`,
`NODE_ENV=benchmark` and `EMAIL_DELIVERY_MODE=disabled`. Generate tokens from
`PerformanceTests`, then run `smoke` before every measured suite. After benchmarking,
run `npm run benchmark:clean` to reset benchmark data, and recreate workers without the override to return local development to Redis DB 0.

## Before/after artifact contract

For each revision, create:

```text
artifacts/process-split/
  before/<commit>/
  after/<commit>/
```

Each directory must contain environment metadata (commit SHA, CPU/RAM/OS, Docker versions/config, Redis config and `docker stats`), losslessly compressed raw k6 JSON (`*-raw.json.gz`), summary Markdown/JSON and invariant output. Reset the deterministic seed before every run.

Run `hot` and `distributed` at least three times each:

```powershell
$env:SCENARIO = "smoke"
k6 run bidding_stress_test.js

npm --prefix ../Backend run benchmark:seed
$env:SCENARIO = "hot"
$env:ARTIFACT_PREFIX = "artifacts/process-split/after/<commit>/hot-1"
k6 run --out json=artifacts/process-split/after/<commit>/hot-1-raw.json bidding_stress_test.js

npm --prefix ../Backend run benchmark:invariants
```

Repeat for `hot-2`, `hot-3`, `distributed-1..3`, and the baseline revision in `before/`.
Compress each raw JSON file with gzip after the suite; do not commit multi-hundred-megabyte
uncompressed traces.

## Acceptance gate

Compare medians of three runs on the same machine/dataset/profile:

- throughput regression no worse than 5%;
- p99 regression no worse than 5%;
- infrastructure error rate below 1%;
- zero invariant violations;
- projection converges within the configured timeout.

The invariant checker must verify Redis/PostgreSQL sequence and version convergence, winner/current price agreement, no duplicate order/event/history sequence, Redis Stream PEL zero, drained outbox, and converged Kafka/dashboard lag.

Do not claim a performance improvement without repeatable artifacts. The separate Redis-vs-PostgreSQL engine comparison may claim success only when Redis reaches at least 2x throughput or at least 50% lower p99 with zero correctness violations.

If either before or after evidence is missing, the performance milestone remains unverified.
