# Engineering evidence

This page separates reproducible verification from historical measurements so portfolio claims remain auditable.

## Automated quality gates

GitHub Actions defines five independent jobs:

| Gate | Commands or checks |
|---|---|
| Backend | Prisma generation/validation, TypeScript build, unit tests, database/concurrency coverage |
| Frontend | ESLint and TypeScript/Vite production build |
| AgentService | TypeScript build and automated tests |
| Compose | Local and production Compose validation |
| Production image | Clean backend image build |

The workflow is [`.github/workflows/ci.yml`](../.github/workflows/ci.yml). The README badge reflects GitHub’s current result; this page does not claim a remote pass independently of that link.

## Reproducible local verification

Run from a clean checkout with Node.js 22 and Docker Desktop:

```powershell
Set-Location Backend
npm ci
npm run prisma:generate
npm run build
npm run test:unit
npm run test:contracts
npm run test:coverage

Set-Location ../Frontend
npm ci
npm run lint
npm test
npm run build

Set-Location ../AgentService
npm ci
npm run build
npm test

Set-Location ..
docker compose config
docker compose --env-file Backend/.env.example -f compose.production.yml config
docker build Backend
```

Backend tests include pure unit tests, route contract tests, isolated PostgreSQL/Redis integration tests, and concurrent bidding tests. Database suites use Testcontainers and deterministic cleanup. Frontend tests use Vitest and Testing Library.

## Verification record

| Date | Revision | Worktree | Verification |
|---|---|---|---|
| 2026-07-30 | `e7ceb2a80ebf330d084a5b4a6dba8602c97d9b44` | Documentation changes present | Backend build passed; 89/89 unit and 94/94 contract tests passed; full database coverage run passed 217/224 and failed 7; frontend lint completed with 72 warnings, 7/7 tests passed, build passed; AgentService 10/10 passed; both Compose configurations passed |

### Current failing gate

The 7 failing backend tests are all Redis-authority integration/concurrency cases. They receive HTTP 503 because the test Redis client exposed to `redis-auction.authority.ts` does not implement `script()`. This affects six bid API integration tests and one concurrent bid-placement test.

`tests/run-database-tests.ts coverage` returned process exit code 0 even though Vitest reported those failures. Until the wrapper propagates the failing Vitest exit code, CI can incorrectly accept a failed coverage run. The current suite must therefore be read from its test output, not inferred from the command exit status.

No coverage percentage was published because the failed run did not produce the expected `Backend/coverage` artifact.

## k6 evidence contract

`PerformanceTests/bidding_stress_test.js` provides smoke, hot-auction, and distributed-auction profiles. PostgreSQL, Redis, Kafka, all workers, and the API run during measurement. External email delivery is disabled while projection, outbox, and dashboard work remain active.

Every publishable suite must include:

- exact commit and clean/dirty state;
- CPU, memory, OS, Docker, Compose, and Redis configuration;
- deterministic seed and scenario;
- three runs per profile and median results;
- raw k6 output, summaries, and post-run invariants;
- Redis/PostgreSQL sequence, version, price, leader, and winner agreement;
- no duplicate orders, events, or history sequences;
- drained Stream pending entries and outbox;
- converged Kafka/dashboard lag.

Acceptance thresholds:

- throughput regression no worse than 5%;
- p99 regression no worse than 5%;
- infrastructure error rate below 1%;
- zero invariant violations;
- projection convergence within the configured timeout.

## Historical process-split result

The repository preserves baseline `36146d3` and optimized snapshot `d98833a-dirty-614026966cba`. Three runs were compared by median:

| Scenario | Baseline req/s | Optimized req/s | Change | Baseline p99 | Optimized p99 | Change | Infra errors | Invariants |
|---|---:|---:|---:|---:|---:|---:|---:|---|
| Hot auction | 1,488.67 | 1,463.60 | -1.68% | 82.89 ms | 81.11 ms | -2.14% | 0% | Passed |
| Distributed | 1,217.94 | 1,468.67 | +20.59% | 147.01 ms | 116.77 ms | -20.57% | 0% | Passed |

The extended invariant check reported Redis/PostgreSQL agreement, zero Stream pending/lag, a drained outbox, and zero dashboard/notification consumer lag.

Source artifacts:

- [comparison report](../PerformanceTests/artifacts/process-split/after/d98833a-dirty-614026966cba/comparison.md)
- [comparison data](../PerformanceTests/artifacts/process-split/after/d98833a-dirty-614026966cba/comparison.json)
- [extended invariants](../PerformanceTests/artifacts/process-split/after/d98833a-dirty-614026966cba/suite-final-extended-invariants.json)
- [baseline environment](../PerformanceTests/artifacts/process-split/before/36146d3/environment.txt)
- [optimized environment](../PerformanceTests/artifacts/process-split/after/d98833a-dirty-614026966cba/environment.txt)
- [archived working-tree patch](../PerformanceTests/artifacts/process-split/after/d98833a-dirty-614026966cba/working-tree.patch)

### Interpretation

This is useful historical evidence because the workload, outputs, environment, comparison, and invariants were preserved. It is not a clean-release benchmark because the optimized revision contained uncommitted changes. Rerun the suite from a clean tagged commit before using these numbers as release or CV performance claims.

The standalone [smoke report](../PerformanceTests/artifacts/smoke-report.md) is not correctness evidence by itself; it requires a post-run convergence check.

## Current limitations

- No committed Playwright suite covers the complete login, live bid, reconnect, winner/order, and admin workflows.
- Frontend test coverage is smaller than backend coverage.
- A clean current-HEAD benchmark has not replaced the dirty-revision result.
- Real screenshots/GIFs must be refreshed from a running seeded environment.
- Live provider behavior is intentionally excluded from deterministic tests.
- Coverage percentages should be published only from the matching coverage artifact.
- The database-test wrapper currently fails to propagate Vitest failures, and the Redis test client is missing the scripting method required by the production authority adapter.
