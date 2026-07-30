# Engineering roadmap

This roadmap reflects the current implementation. It replaces the historical plan that described RabbitMQ, PostgreSQL-authoritative bidding, and a two-process runtime.

## Current baseline

- React storefront, authentication, profiles, product administration, order views, and admin dashboard
- TypeScript modular monolith with API, `auction-worker`, `outbox-relay`, and `async-worker`
- Redis-authoritative active auctions using Lua, Streams, Pub/Sub, AOF, and no-eviction
- Single sequential PostgreSQL projector with event and sequence fences
- Transactional outbox publication to Kafka
- Idempotent dashboard/notification consumers, durable email delivery, retries, and DLQs
- Post-commit Socket.IO updates with reconnect refetch
- Health/readiness, worker heartbeats, request IDs, and operational dashboard data
- Backend unit, contract, integration, concurrency, and coverage scripts
- Frontend tests, ESLint, and production build gates
- CI gates for backend, frontend, AgentService, Compose, and the production image
- Deterministic k6 workloads and preserved benchmark/invariant artifacts

## Near term — highest value

### Portfolio and frontend

- Capture real storefront, bidding, order, and admin screenshots/GIFs.
- Add Playwright flows for auth, accepted/rejected bids, reconnect, orders, and admin.
- Eliminate lint warnings and unsafe hook/socket subscriptions.
- Standardize loading, error, empty, retry, disabled, and reconnecting states.
- Improve keyboard navigation, labels, focus, and screen-reader errors.
- Add route-level lazy loading and measure the bundle.

### Correctness and recovery

- Compare Redis/PostgreSQL sequence, version, price, leader, winner, deadline, and order state.
- Require maintenance mode and explicit verification before any repair changes authority.
- Inject Redis, PostgreSQL, Kafka, duplicate-delivery, crash, restart, reclaim, and recovery failures.
- Formalize order/payment transitions as transactional state machines with role validation.
- Verify idempotency keys for bids, buy-now, checkout, consumers, email, and admin retries.
- Remove deprecated workers and paths after proving no runtime depends on them.

### Operations

- Finish structured JSON logging and end-to-end correlation IDs.
- Publish API/bid latency, rejection, projection lag, outbox age, Kafka lag, retry, DLQ, and email queue metrics.
- Define alert thresholds and a worker-failure diagnosis runbook.
- Add delivered-outbox retention or archival.
- Consider OpenTelemetry only after logs and metrics stabilize.

### Evidence

- Record full integration, concurrency, contract, frontend, and coverage results from a clean commit.
- Rerun k6 from a clean tag with hardware, configuration, deterministic data, three-run medians, and invariants.
- Add Lighthouse checks and profile important SQL with `EXPLAIN ANALYZE`.
- Change indexes only when measurements prove a benefit.

## Conditional scaling

The single `auction-worker` preserves global ordering. Do not redesign it without measured projection lag:

1. Measure throughput, pending entries, reclaim frequency, heartbeat freshness, and convergence.
2. Keep one worker if it meets recovery and throughput targets.
3. If proven insufficient, partition by auction aggregate.
4. Preserve per-auction ordering while processing different auctions concurrently.
5. Prove rebalance, crash recovery, duplicate delivery, and ordering before adding replicas.

## Optional product work

- Payment states and signed, replay-protected, idempotent webhooks
- Searchable moderation, ban, account, order, DLQ, and admin audit history
- Operator reconciliation/recovery views and controlled event replay
- Notification preferences, unsubscribe behavior, template versions, and delivery history

## Deliberate non-goals

- No microservices without an organizational or scaling need.
- No Kubernetes, extra broker, or extra cache for technology breadth.
- No exactly-once claim; retain at-least-once delivery with idempotent effects.
- No PostgreSQL bid fallback during Redis outages.
- No horizontal projector scaling before partitioned ordering is proven.

## Completion criteria

A reviewer can start a clean clone, follow the five-minute demo, trace a bid through the complete pipeline, inspect passing evidence for the same revision, review a clean three-run benchmark, and understand the chosen limits.
