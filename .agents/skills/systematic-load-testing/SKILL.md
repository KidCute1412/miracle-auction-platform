# Systematic Load Testing

## When to Apply
- Use for performance work, bidding stress tests, cache validation, Socket.io scaling checks, and portfolio evidence.
- Use after core correctness tests exist; load tests must not hide correctness bugs.
- Use with `concurrency-safeguards`, `intelligent-cache-strategy`, and `portfolio-readiness`.

## Repo Context
- k6 is the target load-test tool, but no committed k6 folder is currently visible.
- Docker Compose provides local PostgreSQL, Redis, Kafka, and worker infrastructure.
- High-value paths are product listing, product detail, bid submission, login/refresh, dashboard, and Socket.io bid updates.

## Implementation Checklist
- Add a `load-tests/` or `tests/load/` folder with k6 scripts and README.
- Seed repeatable users, products, active auctions, bid steps, and tokens before running tests.
- Avoid live OAuth, captcha, email, Cloudinary, or payment calls during load tests.
- Prefer pre-generated JWTs or a dedicated test-login setup.
- Define k6 thresholds for p95 latency, error rate, check failure rate, and HTTP request duration.
- Include a bid correctness check after load: winning bid, product price owner, bid history count, and rejected duplicate/lower bids.
- Separate smoke, baseline, stress, and spike scenarios.
- Record environment details: CPU, memory, database config, Redis enabled/disabled, worker enabled/disabled.
- Export k6 summaries to JSON or Markdown artifacts for portfolio documentation.
- Compare before/after results when changing cache, SQL indexes, or concurrency control.
- Keep load tests pointed at local/staging data, never shared production data.

## Acceptance Criteria
- k6 scripts can be run from a clean checkout after local services start.
- Thresholds fail the run when latency or error rate exceeds agreed targets.
- Bid load tests verify final database correctness, not just HTTP status.
- Results are saved as artifacts and summarized in portfolio docs.
- Test data setup and teardown are repeatable.

## Verification Commands
```powershell
docker compose up -d postgres redis kafka
cd Backend; npm run build
```

Target commands after adding k6 scripts:
```powershell
k6 run load-tests/bidding-smoke.js
k6 run --summary-export load-tests/artifacts/bidding-summary.json load-tests/bidding-stress.js
cd Backend; npm run test:integration -- bids
```

Suggested thresholds:
```javascript
export const options = {
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<500'],
    checks: ['rate>0.99'],
  },
};
```

## Anti-Patterns
- Running load tests against production.
- Measuring only `200 OK` while ignoring bid correctness.
- Creating random untracked test data with no teardown.
- Calling external providers during load.
- Publishing performance claims without machine and dataset details.

## Portfolio Signal
- The project can show evidence: repeatable k6 scripts, thresholds, artifacts, and correctness checks under pressure.
