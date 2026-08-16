# Miracle Auction Platform

[![CI/CD Pipeline](https://github.com/KidCute1412/miracle-auction-platform/actions/workflows/ci.yml/badge.svg)](https://github.com/KidCute1412/miracle-auction-platform/actions/workflows/ci.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Docker Compose](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)](https://docs.docker.com/compose/)
[![Redis](https://img.shields.io/badge/Redis-7-DC382D?logo=redis&logoColor=white)](https://redis.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Kafka](https://img.shields.io/badge/Kafka-3.7-231F20?logo=apachekafka&logoColor=white)](https://kafka.apache.org/)

A real-time auction platform engineered for concurrent bidding: atomic Redis Lua decisions, ordered durable projection, transactional outbox delivery, Kafka consumers, and post-commit Socket.IO updates.

Miracle Auction combines a React storefront and administration console with a TypeScript modular monolith built to preserve ordering, correctness, and recoverability under concurrent bid traffic.

**Live demo:** [Auction storefront](https://miracle-auction-platform.lok1412.site) · [API health](https://miracle-auction-platform.api.lok1412.site/health)

> This is an engineering portfolio project. It demonstrates production-oriented patterns and their tradeoffs, but does not claim unlimited scale or exactly-once delivery.

## Highlights

- Real-time bidding, proxy maxima, buy-now, anti-sniping, winner, seller, and order workflows
- Atomic Redis Lua mutations with ordered Stream events
- Idempotent PostgreSQL projection with event and per-auction sequence fences
- Transactional outbox publication to Kafka
- Retryable dashboard and email consumers with durable DLQ records
- Socket.IO updates emitted only after projection commits
- Cookie authentication, CSRF, CORS, Helmet, rate limits, RBAC, and request IDs
- Unit, API contract, integration, concurrency, frontend, and k6 test assets

## Why this project stands out

- **Concurrency-safe bidding:** Redis Lua scripts validate and mutate each active auction atomically, with ordered Stream events for projection.
- **Durable recovery path:** Redis Streams, idempotent PostgreSQL projection, and a transactional outbox make failed work observable and retryable.
- **Correct realtime UX:** Socket.IO events are emitted only after the authoritative state has committed, so clients do not receive speculative updates.

## Architecture

The backend is one modular-monolith codebase and image with four composition roots. This preserves shared domain boundaries while isolating HTTP latency, ordered projection, relay, and asynchronous work.

```mermaid
flowchart LR
    UI["React 19 + Vite<br/>storefront and admin"] -->|HTTPS / Socket.IO| API["API process<br/>Express 5"]
    API -->|EVALSHA + WAIT 1| REDIS[("Redis 7 primary<br/>active-auction authority")]
    REDIS -.->|AOF replication| REPLICA[("Redis replica")]
    REDIS -->|ordered Stream| AW["auction-worker<br/>single projector"]
    AW -->|transaction| PG[("PostgreSQL<br/>durable projection")]
    PG --> OUTBOX[("transactional outbox")]
    OUTBOX --> RELAY["outbox-relay"]
    RELAY --> KAFKA[("Kafka")]
    KAFKA --> ASYNC["async-worker<br/>dashboard + notifications"]
    ASYNC --> PG
    ASYNC --> SMTP["SMTP provider"]
    AW -->|post-commit Pub/Sub| API
    API -->|product room| UI
```

### Bid processing

```mermaid
sequenceDiagram
    autonumber
    participant C as Browser
    participant A as API
    participant R as Redis authority
    participant W as auction-worker
    participant P as PostgreSQL
    participant O as outbox-relay
    participant K as Kafka
    participant X as async-worker

    C->>A: Submit bid
    A->>R: Atomic Lua mutation (EVALSHA)
    R->>R: Validate window, role, ban, step,<br/>proxy maximum, idempotency, anti-sniping
    R->>R: Update authority + append Stream event
    A->>R: WAIT 1 replica acknowledgement
    R-->>A: Durable authoritative result
    A-->>C: HTTP response
    W->>R: Read ordered Stream entry
    W->>P: Project state/history/order + outbox
    P-->>W: Commit
    W-->>A: Publish committed socket event
    A-->>C: Socket.IO update
    W->>R: Acknowledge Stream entry
    O->>P: Lease pending outbox rows
    O->>K: Publish with aggregate key
    K-->>O: Broker acknowledgement
    O->>P: Mark delivered
    K->>X: At-least-once delivery
    X->>P: Idempotent effect
```

The synchronous bid request ends after Redis accepts the Lua mutation **and** the configured replica acknowledgement succeeds (`WAIT 1` in the benchmark). PostgreSQL, Kafka, Socket.IO, dashboards, and email are not part of bid HTTP latency. See the [system overview](docs/architecture/system-overview.md), [bid architecture](docs/architecture/bidding.md), and [worker failure model](docs/architecture/worker-processes.md).

## Reliability model

| Concern | Design |
|---|---|
| Active-auction decisions | Redis is authoritative. A Lua script validates and mutates the complete state atomically. |
| Durable business view | PostgreSQL stores users, products, bid history, orders, outbox rows, and consumer receipts as an eventually convergent projection. |
| Ordering | One `auction-worker` consumes Redis Stream entries and projects per-auction keyed lanes; sequence/version fences preserve each auction's order. |
| Projection retries | Database failure leaves the entry pending for idempotent reclaim and retry. |
| Event publication | Projection and outbox insert commit together; delivery is recorded only after Kafka acknowledges publication. |
| Duplicate delivery | Event IDs, sequence constraints, consumer receipts, and effect-specific unique constraints suppress duplicates. |
| Poison events | Bounded retries terminate in durable DLQ records for inspection and controlled replay. |
| Live updates | Redis Pub/Sub and Socket.IO are best-effort after commit; clients reject stale versions and refetch after reconnect. |

The system provides **at-least-once delivery with idempotent effects**, not exactly-once delivery.

## Technology

| Layer | Main technology |
|---|---|
| Frontend | React 19, TypeScript, Vite 7, Tailwind CSS 4, Radix UI, Socket.IO client |
| API | Node.js 22, TypeScript, Express 5, Socket.IO |
| Persistence | PostgreSQL 15, Prisma migrations/client |
| Auction authority | Redis 7, Lua, Streams, Pub/Sub, AOF |
| Events | Kafka 3.7, KafkaJS, transactional outbox |
| Testing | Vitest, Supertest, Testcontainers, k6 |
| Operations | Docker Compose, GitHub Actions, health/readiness endpoints |

## Repository map

```text
Backend/             API, modules, Prisma schema, workers, and tests
Frontend/            React storefront and administration console
AgentService/        Development automation tooling, outside the auction runtime
PerformanceTests/    Repeatable k6 scenarios and benchmark artifacts
data/                Local demonstration seed data
docs/                Architecture, demo, evidence, and operating notes
.github/workflows/   CI quality gates
```

## Quick reviewer path

1. Open the [live auction storefront](https://miracle-auction-platform.lok1412.site).
2. Follow the [five-minute demo guide](docs/product/demo-guide.md).
3. Inspect the [bidding architecture](docs/architecture/bidding.md) and [engineering evidence](docs/testing/engineering-evidence.md).
4. Run the complete local demo with `start.bat`.

## Local development

### Prerequisites

- Node.js 22
- npm
- Docker Desktop with Docker Compose
- Windows PowerShell for the one-command launcher

External email, OAuth, CAPTCHA, Cloudinary, and editor integrations are optional for the core local auction flow.

### One-command Windows start

```powershell
Copy-Item Backend/.env.example Backend/.env
Copy-Item Frontend/.env.example Frontend/.env
.\start.bat
```

`start.bat` starts PostgreSQL, Redis, and Kafka; installs dependencies; generates Prisma; applies migrations; seeds only when the database is empty; starts all three workers; and opens backend/frontend development processes.

- Frontend: `http://localhost:5173`
- API: `http://localhost:5000`
- Liveness: `http://localhost:5000/health`
- Readiness: `http://localhost:5000/ready`

### Manual start

```powershell
docker compose up -d postgres redis kafka

Set-Location Backend
npm install
npm run prisma:generate
npm run prisma:migrate:deploy
npm run dev
```

In separate terminals:

```powershell
Set-Location Frontend
npm install
npm run dev
```

```powershell
docker compose up -d auction-worker outbox-relay async-worker
```

Use `start.bat` when you want the provided demo data; the manual commands do not import it automatically.

## Environment

Start from the committed examples:

- `Backend/.env.example` — database, Redis, Kafka, auth, providers, workers, and topics
- `Frontend/.env.example` — API URL and optional browser integrations
- `AgentService/.env.example` — agent service configuration

Production secrets must be injected by the deployment environment. Never commit `.env` files, JWT secrets, provider keys, SMTP credentials, or database passwords.

## Verification

CI runs separate gates for the backend, frontend, AgentService, Compose definitions, and production image.

```powershell
Set-Location Backend
npm run build
npm run test:unit
npm run test:contracts
npm run test:coverage

Set-Location ../Frontend
npm run lint
npm test
npm run build

Set-Location ../AgentService
npm run build
npm test

Set-Location ..
docker compose config
docker compose --env-file Backend/.env.example -f compose.production.yml config
```

Database and concurrency tests use isolated Testcontainers rather than shared development data. See [engineering evidence](docs/testing/engineering-evidence.md) for current results and benchmark provenance.

## Security notes

- Access and refresh tokens use secure cookie flows; authorization remains server-side.
- State-changing browser requests pass CSRF validation.
- CORS is restricted to the configured client origin; Helmet supplies baseline security headers.
- Global and authentication-specific rate limits protect sensitive endpoints.
- Bid rules, seller restrictions, bidder bans, winner permissions, and admin actions are enforced by backend use cases.
- Request IDs are returned and propagated as correlation IDs where supported.
- Live external providers are excluded from deterministic tests and benchmarks.

This is not a security certification. Refresh-token reuse tests, broader audit coverage, secret-redaction tests, and a complete OWASP review remain roadmap work.

## Performance evidence

The selected bid-core benchmark is a three-run local, isolated Docker/k6 measurement using **100 VUs for 75 seconds**, one Redis auction shard, Redis AOF, Lua validation, idempotency, replica acknowledgement (`WAIT 1`), projection, and post-run core invariants:

| Scenario | Throughput median | Accepted bids/s | p95 | p99 | Infrastructure errors | Throughput CV |
|---|---:|---:|---:|---:|---:|---:|
| `bid-path` + `bid-priority` | **309.33 req/s** | **275.16** | **536.57 ms** | **689.85 ms** | **0%** | **1.89%** |

All three runs passed Redis/PostgreSQL convergence, Stream/outbox drain, ordering, and idempotency invariants. `bid-path` excludes dashboard and notification consumers, so it measures the durable bidding core rather than end-to-end downstream capacity. It is local benchmark evidence, not a production SLA or a claim of unlimited scale. Reproduce it with:

```powershell
cd PerformanceTests
npm.cmd run benchmark:bid-path -- --resource-profile=bid-priority --redis-shards=1
```

`distributed` keeps downstream consumers enabled and is the production-like companion scenario. See [PerformanceTests](PerformanceTests/README.md) and [engineering evidence](docs/testing/engineering-evidence.md) for thresholds, artifacts, and interpretation.

## Demo and media

Follow the [five-minute demo guide](docs/product/demo-guide.md) to present product discovery, live bidding, winner/order behavior, administration, and engineering evidence. Real UI captures belong under `docs/assets/`; mockups are not accepted as portfolio evidence.

| Storefront — product discovery | Active auction — realtime bidding |
|---|---|
| ![Miracle Auction storefront](docs/assets/storefront.webp) | ![Miracle Auction active product](docs/assets/product-bidding.webp) |

## Documentation

- [Five-minute demo](docs/product/demo-guide.md)
- [Engineering evidence](docs/testing/engineering-evidence.md)
- [System architecture](docs/architecture/system-overview.md)
- [Redis-authoritative bidding](docs/architecture/bidding.md)
- [Worker architecture and recovery](docs/architecture/worker-processes.md)
- [Hetzner demo deployment](docs/operations/deployment-v2-hetzner-demo.md)
- [Hetzner operations cheat sheet](docs/operations/hetzner-demo-operations.md)
- [API route contracts](docs/contracts/api-routes.md)
- [Engineering roadmap](docs/planning/roadmap.md)
