# Local bidding benchmark

This suite compares `BID_ENGINE=postgres` and `BID_ENGINE=redis` on the same local machine, containers, deterministic users, and auctions. It never targets production.

## Prepare one run

```powershell
docker compose up -d postgres redis kafka
docker exec online-auction-postgres createdb -U postgres -O postgres online_auction_benchmark_test
cd Backend
$env:NODE_ENV = "benchmark"
$env:DATABASE_URL = "postgresql://postgres:my_local_password@localhost:15432/online_auction_benchmark_test?schema=public"
$env:DIRECT_URL = $env:DATABASE_URL
$env:REDIS_URL = "redis://localhost:16379/14"
npm run prisma:migrate:deploy
npm run benchmark:seed
cd ../PerformanceTests
npm install
node generate_tokens.js
```

Start the API with the selected engine, then run one scenario. Reset with `npm run benchmark:seed` before switching engines.

```powershell
$env:BID_ENGINE = "postgres"
$env:SCENARIO = "hot"
$env:ARTIFACT_PREFIX = "artifacts/postgres-hot"
k6 run --out json=artifacts/postgres-hot-raw.json bidding_stress_test.js
cd ../Backend
$env:INVARIANT_OUTPUT = "../PerformanceTests/artifacts/postgres-hot-invariants.json"
npm run benchmark:invariants
cd ../PerformanceTests

$env:BID_ENGINE = "redis"
$env:SCENARIO = "hot"
$env:ARTIFACT_PREFIX = "artifacts/redis-hot"
k6 run --out json=artifacts/redis-hot-raw.json bidding_stress_test.js
cd ../Backend
$env:INVARIANT_OUTPUT = "../PerformanceTests/artifacts/redis-hot-invariants.json"
$env:WAIT_FOR_CONVERGENCE_MS = "60000"
npm run benchmark:invariants
cd ../PerformanceTests

node compare-results.js artifacts/postgres-hot-summary.json artifacts/redis-hot-summary.json artifacts/comparison-hot.md artifacts/postgres-hot-invariants.json artifacts/redis-hot-invariants.json
```

Available scenarios are `smoke`, `hot`, `distributed`, `spike`, and `soak`. Set `PRODUCT_IDS=1,2,...,20` for `distributed`; set `SOAK_DURATION` to override the default 15 minutes.

Record CPU, memory, operating system, Docker resource limits, PostgreSQL configuration, Redis configuration, and git revision alongside every artifact. A target run passes only when post-run invariant checks report zero violations, system errors are below 1%, projection has converged, and throughput is at least 2x baseline or p99 is at least 50% lower.
