# Skill Index

Use this index to select the smallest set of skills needed for a task.

## Common Tasks

| Task | Skills |
| --- | --- |
| Fix bidding race condition | `concurrency-safeguards`, `auction-domain-correctness`, `automated-testing-methodology`, `database-integrity-migrations` |
| Add or change bid rules | `auction-domain-correctness`, `concurrency-safeguards`, `enterprise-api-standards`, `automated-testing-methodology` |
| Secure login/session | `secure-auth-owasp`, `enterprise-api-standards`, `automated-testing-methodology`, `typescript-code-quality` |
| Standardize API responses | `enterprise-api-standards`, `typescript-code-quality`, `frontend-production-quality`, `automated-testing-methodology` |
| Improve frontend bidding UX | `frontend-production-quality`, `auction-domain-correctness`, `enterprise-api-standards`, `typescript-code-quality` |
| Fix winner order creation or checkout | `payment-order-integrity`, `auction-domain-correctness`, `concurrency-safeguards`, `automated-testing-methodology` |
| Add database constraints or indexes | `database-integrity-migrations`, `concurrency-safeguards`, `systematic-load-testing` |
| Add Redis cache or rate limits | `intelligent-cache-strategy`, `secure-auth-owasp`, `systematic-load-testing` |
| Add Kafka/worker resiliency | `event-driven-resiliency`, `ci-cd-observability`, `automated-testing-methodology` |
| Prepare for internship portfolio | `portfolio-readiness`, `ci-cd-observability`, `systematic-load-testing`, `frontend-production-quality` |
| Prepare deployment or release handoff | `deployment-release-readiness`, `ci-cd-observability`, `secure-auth-owasp`, `portfolio-readiness` |
| Add CI pipeline | `ci-cd-observability`, `automated-testing-methodology`, `typescript-code-quality` |
| Improve TypeScript quality | `typescript-code-quality`, plus the domain skill for the touched area |
| Run load tests | `systematic-load-testing`, `concurrency-safeguards`, `intelligent-cache-strategy`, `portfolio-readiness` |

## Skill Set

- `automated-testing-methodology`: backend unit/integration/concurrency tests, frontend lint/build gates, CI-ready commands.
- `enterprise-api-standards`: Joi validation, standard envelopes, centralized errors, request IDs, sanitized production errors.
- `secure-auth-owasp`: cookie auth, refresh rotation, CSRF, CORS, RBAC, secrets, headers, rate limits, audit.
- `concurrency-safeguards`: PostgreSQL transactions and locks as source of truth, Redis as optimization only, race tests.
- `database-integrity-migrations`: Knex/PostgreSQL migrations, constraints, indexes, reversible schema changes, EXPLAIN notes.
- `ci-cd-observability`: backend/frontend CI jobs, Docker build, structured logs, health checks, graceful shutdown.
- `event-driven-resiliency`: Kafka/RabbitMQ-style idempotency, retries, DLQ, shutdown, worker observability.
- `intelligent-cache-strategy`: cache-aside Redis, TTLs, invalidation, rate limiting, graceful degradation.
- `systematic-load-testing`: k6 scenarios, thresholds, repeatable seed data, bid correctness checks, report artifacts.
- `auction-domain-correctness`: bid increments, seller exclusion, close races, winner selection, order creation, anti-sniping.
- `payment-order-integrity`: winner checkout, order state, payment state, one-order-per-auction, cancellation, refunds, fulfillment.
- `frontend-production-quality`: accessibility, states, forms, responsive UI, socket cleanup, API error handling.
- `typescript-code-quality`: strict typing, service boundaries, typed env config, DTOs, request/response/event types.
- `portfolio-readiness`: README, architecture diagram, screenshots, demo script, tradeoffs, load-test summary, CI badge.
- `deployment-release-readiness`: production envs, Docker/Vercel/backend deployment, release checklist, rollback, secrets, smoke checks.

## Global Rule

Every implementation should end with verification commands and a short risk note.
