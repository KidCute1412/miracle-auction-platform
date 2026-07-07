# Automated Testing Methodology

## When to Apply
- Use for any backend behavior change, frontend build-risk change, bug fix, or portfolio-readiness task.
- Always use with `concurrency-safeguards` and `auction-domain-correctness` for bidding work.
- Use before CI work so scripts are stable and repeatable.

## Repo Context
- Backend: Express 5, TypeScript, Knex, PostgreSQL, Redis, Kafka, Socket.io.
- Frontend: React 19, Vite, TypeScript, Tailwind, Socket.io client.
- Current backend scripts: `npm run build`, `npm run dev`, `npm run worker`, `npm run watch`.
- Current frontend scripts: `npm run lint`, `npm run build`, `npm run dev`, `npm run preview`.
- Docker Compose provides local PostgreSQL, Redis, Kafka, and a Node worker.
- Backend does not currently expose committed test scripts; add them before requiring CI test gates.

## Implementation Checklist
- Add backend test tooling appropriate for ESM TypeScript, such as Vitest or Jest plus Supertest.
- Add scripts: `test`, `test:unit`, `test:integration`, and `test:concurrency` under `Backend/package.json`.
- Keep unit tests pure for services, helpers, validation, auth utilities, and DTO mapping.
- Use integration tests for route, controller, validation, database, Redis, Kafka producer, and Socket.io boundary behavior.
- Run integration tests against isolated PostgreSQL test data from `docker-compose.yml` or a dedicated test database.
- Reset test data with transactions, schema cleanup, or deterministic seed IDs.
- Add race-condition tests that submit concurrent bids to the same product and assert one durable winner state.
- Verify rejected bids do not create bid history rows, update product price owner, emit Socket.io events, or publish worker messages.
- Add frontend checks for build, lint, key hooks, API clients, socket cleanup, and form validation when frontend behavior changes.
- Keep tests deterministic: no dependency on real email, Cloudinary, Google OAuth, reCAPTCHA, or live external APIs.
- Document any missing test seam before changing production code.

## Acceptance Criteria
- Backend build passes after test dependencies and scripts are added.
- Unit tests cover changed service and validation branches.
- Integration tests cover successful and failed API flows with stable response envelopes.
- Concurrency tests prove duplicate or stale bids cannot win.
- Frontend lint and build pass for UI changes.
- CI can run all verification commands without manual local steps.

## Verification Commands
```powershell
docker compose up -d postgres redis kafka
cd Backend; npm run build
cd Frontend; npm run lint
cd Frontend; npm run build
```

Target commands after adding backend test scripts:
```powershell
cd Backend; npm run test:unit
cd Backend; npm run test:integration
cd Backend; npm run test:concurrency
cd Backend; npm test
```

## Anti-Patterns
- Relying on manual browser checks as the only verification.
- Mocking the database for bidding correctness tests.
- Calling live auth, email, payment, image upload, or captcha providers in automated tests.
- Adding tests that pass only because they depend on execution order.
- Treating frontend build success as a substitute for backend API tests.

## Portfolio Signal
- A reviewer sees a CI-ready test pyramid with specific coverage for the hardest auction risk: concurrent bidding correctness.
