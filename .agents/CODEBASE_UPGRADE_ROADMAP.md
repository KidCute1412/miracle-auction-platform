# Codebase Upgrade Roadmap

This roadmap turns the `.agents` skills into focused implementation work. Do not combine all phases in one change; each phase should produce reviewable code, tests, verification commands, and a risk note.

## Priority 1: Testing Foundation and CI

Skills: `automated-testing-methodology`, `typescript-code-quality`, `ci-cd-observability`

- Add backend test tooling and scripts for unit, integration, and concurrency tests.
- Keep current required checks: `cd Backend; npm run build`, `cd Frontend; npm run lint`, `cd Frontend; npm run build`.
- Add CI jobs for backend and frontend once test scripts exist.
- Acceptance: clean checkout can run CI-equivalent commands locally.

## Priority 2: Auction Correctness and Concurrency Safety

Skills: `auction-domain-correctness`, `concurrency-safeguards`, `database-integrity-migrations`, `automated-testing-methodology`

- Move bid acceptance into PostgreSQL transactions with row locks.
- Enforce bid step, time window, seller exclusion, status, and idempotency.
- Make winner selection and order creation idempotent.
- Add race-condition tests for simultaneous bids.
- Acceptance: database state, bid history, winner, and emitted events agree after concurrent load.

## Priority 3: Auth and Security Hardening

Skills: `secure-auth-owasp`, `enterprise-api-standards`, `automated-testing-methodology`

- Standardize cookie auth, refresh token rotation, reuse detection, CSRF, CORS allowlist, RBAC, and Redis-backed rate limits.
- Add `helmet` only as an explicit dependency change.
- Remove secrets from tracked files and document `.env.example`.
- Acceptance: auth tests cover login, refresh, logout, role denial, CSRF denial, and rate limit behavior.

## Priority 4: API Consistency and Error Handling

Skills: `enterprise-api-standards`, `typescript-code-quality`, `frontend-production-quality`

- Centralize errors, request IDs, response envelopes, and Joi validation.
- Align frontend service parsing with standard envelopes.
- Sanitize production errors.
- Acceptance: changed endpoints return consistent success/error shapes and frontend handles them without route-specific hacks.

## Priority 5: Observability and Health Checks

Skills: `ci-cd-observability`, `event-driven-resiliency`

- Add structured JSON logging, `/health`, `/ready`, graceful shutdown, and worker lifecycle logs.
- Include request IDs or job IDs in logs and error responses.
- Acceptance: one request or worker event can be traced through logs without leaking secrets.

## Priority 6: Load Testing and Performance Report

Skills: `systematic-load-testing`, `intelligent-cache-strategy`, `database-integrity-migrations`, `concurrency-safeguards`

- Add k6 scripts for product reads and bid submission.
- Seed repeatable data and export summary artifacts.
- Add cache-aside and indexes only where tests or EXPLAIN notes justify them.
- Acceptance: k6 thresholds, bid correctness checks, and result artifacts exist.

## Priority 7: Portfolio Documentation

Skills: `portfolio-readiness`

- Update README, architecture diagram, screenshots, demo script, tradeoffs, CI badge, security notes, and load-test summary.
- Ensure docs match implemented behavior only.
- Acceptance: an internship reviewer can run the app, understand the architecture, inspect evidence, and discuss tradeoffs.

## Operating Rules

- Keep each phase small enough to review.
- Do not rewrite unrelated code while applying a phase.
- Prefer repo conventions before adding new abstractions.
- End every implementation with commands run, commands not run, and a short risk note.
