# Codebase Upgrade Roadmap

This roadmap turns the `.agents` skills into focused implementation work. Do not combine all phases in one change; each phase should produce reviewable code, tests, verification commands, and a risk note.

## Priority 1: Testing Foundation and CI

Skills: `automated-testing-methodology`, `typescript-code-quality`, `ci-cd-observability`

- Add backend test tooling and scripts for unit, integration, and concurrency tests.
- Keep current required checks: `cd Backend; npm run build`, `cd Frontend; npm run lint`, `cd Frontend; npm run build`, and `docker compose config`.
- Existing `.github/workflows/ci.yml` already builds backend, lints/builds frontend, and validates Docker Compose.
- Add backend test jobs to CI only after committed test scripts exist.
- Acceptance: clean checkout can run CI-equivalent commands locally.

## Priority 2: Auction Correctness and Concurrency Safety

Skills: `auction-domain-correctness`, `concurrency-safeguards`, `database-integrity-migrations`, `payment-order-integrity`, `automated-testing-methodology`

- Move bid acceptance into PostgreSQL transactions with row locks.
- Enforce bid step, time window, seller exclusion, status, and idempotency.
- Make winner selection and order creation idempotent.
- Add race-condition tests for simultaneous bids.
- Acceptance: database state, bid history, winner, and emitted events agree after concurrent load.

## Priority 3: Order and Payment Integrity

Skills: `payment-order-integrity`, `auction-domain-correctness`, `enterprise-api-standards`, `automated-testing-methodology`

- Define order lifecycle and payment lifecycle explicitly.
- Ensure each closed auction winner gets at most one order.
- Guard checkout, cancellation, refund, and fulfillment transitions by role and current state.
- Add tests for duplicate checkout, non-winner checkout, cancelled auction, expired payment, and seller/admin actions.
- Acceptance: order/payment state cannot contradict auction winner state.

## Priority 4: Auth and Security Hardening

Skills: `secure-auth-owasp`, `enterprise-api-standards`, `automated-testing-methodology`

- Standardize cookie auth, refresh token rotation, reuse detection, CSRF, CORS allowlist, RBAC, and Redis-backed rate limits.
- Add `helmet` only as an explicit dependency change.
- Remove secrets from tracked files and document `.env.example`.
- Acceptance: auth tests cover login, refresh, logout, role denial, CSRF denial, and rate limit behavior.

## Priority 5: API Consistency and Error Handling

Skills: `enterprise-api-standards`, `typescript-code-quality`, `frontend-production-quality`

- Centralize errors, request IDs, response envelopes, and Joi validation.
- Align frontend service parsing with standard envelopes.
- Sanitize production errors.
- Acceptance: changed endpoints return consistent success/error shapes and frontend handles them without route-specific hacks.

## Priority 6: Observability and Health Checks

Skills: `ci-cd-observability`, `event-driven-resiliency`

- Add structured JSON logging, `/health`, `/ready`, graceful shutdown, and worker lifecycle logs.
- Include request IDs or job IDs in logs and error responses.
- Acceptance: one request or worker event can be traced through logs without leaking secrets.

## Priority 7: Load Testing and Performance Report

Skills: `systematic-load-testing`, `intelligent-cache-strategy`, `database-integrity-migrations`, `concurrency-safeguards`

- Standardize existing `PerformanceTests/` into repeatable k6 scripts with UTF-8 docs, token generation, and result artifacts.
- Add k6 scripts for product reads, bid submission, and bid correctness checks.
- Seed repeatable data and export summary artifacts.
- Add cache-aside and indexes only where tests or EXPLAIN notes justify them.
- Acceptance: k6 thresholds, bid correctness checks, and result artifacts exist.

## Priority 8: Portfolio Documentation and Release Handoff

Skills: `portfolio-readiness`, `deployment-release-readiness`

- Update README, architecture diagram, screenshots, demo script, tradeoffs, CI badge, security notes, and load-test summary.
- Document deployment environments, required secrets, smoke checks, rollback, and known operational limits.
- Ensure docs match implemented behavior only.
- Acceptance: an internship reviewer can run the app, understand the architecture, inspect evidence, and discuss tradeoffs.

## Operating Rules

- Keep each phase small enough to review.
- Do not rewrite unrelated code while applying a phase.
- Prefer repo conventions before adding new abstractions.
- End every implementation with commands run, commands not run, and a short risk note.
