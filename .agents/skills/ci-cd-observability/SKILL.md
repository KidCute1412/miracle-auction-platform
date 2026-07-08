---
name: ci-cd-observability
description: Use for CI/CD, Docker, logging, request IDs, health checks, metrics, and graceful shutdown.
---

# CI/CD & Observability

## When to Apply
- Use when adding GitHub Actions, Docker changes, logging, request IDs, health checks, metrics, or graceful shutdown.
- Use with `automated-testing-methodology` before making tests required in CI.
- Use with `event-driven-resiliency` for worker visibility.

## Repo Context
- Backend Dockerfile exists under `Backend/Dockerfile`.
- Docker Compose starts PostgreSQL, Redis, Kafka, and the Node worker.
- `.github/workflows/ci.yml` already has separate backend, frontend, and Docker Compose validation jobs.
- Current CI builds the backend, lints/builds the frontend, and runs `docker compose config`; it does not run backend tests because test scripts are not committed yet.
- Backend scripts include build, dev, worker, and watch.
- Frontend scripts include lint and build.
- Current logging uses `console.log` in several places; structured logging is a target improvement.

## Implementation Checklist
- Keep separate CI jobs for backend and frontend.
- Backend CI should install dependencies, build TypeScript, and add test commands only after scripts exist.
- Frontend CI should install dependencies, run lint, and build.
- Add a Docker build job for backend image validation.
- Use dependency caching based on `package-lock.json`.
- Add service containers or Docker Compose steps for integration tests that need PostgreSQL, Redis, or Kafka.
- Add `/health` and `/ready` endpoints that check process state and critical dependencies.
- Add request ID middleware and include IDs in logs and API errors.
- Replace ad hoc `console.log` with structured JSON logging using a selected logger.
- Log worker start, stop, retries, DLQ sends, Kafka group, topic, partition, and offset.
- Add graceful shutdown for HTTP server, Socket.io, Redis, Kafka producer/consumers, and database connections.
- Keep secrets in CI variables, never in workflow files.

## Acceptance Criteria
- CI fails on backend TypeScript build errors.
- CI fails on frontend lint or build errors.
- Docker image builds from a clean checkout.
- Test gates are added only when commands exist locally and can run from a clean checkout.
- Health and readiness checks return stable machine-readable JSON.
- Logs include timestamp, level, message, requestId or jobId, and safe context.
- SIGTERM shutdown stops accepting work and closes dependencies.

## Verification Commands
```powershell
cd Backend; npm run build
cd Frontend; npm run lint
cd Frontend; npm run build
docker compose config
docker build Backend
```

Target commands after adding tests:
```powershell
cd Backend; npm test
```

Manual smoke checks:
```powershell
curl -i http://localhost:8000/health
curl -i http://localhost:8000/ready
```

## Anti-Patterns
- One CI job that mixes backend and frontend failures.
- Requiring test commands in CI before scripts exist.
- Logging full request bodies for auth or payment routes.
- Health checks that only return `200 OK` without dependency status.
- Killing workers without waiting for in-flight messages.

## Portfolio Signal
- The repo looks deployable: automated gates, Docker confidence, structured logs, request tracing, and clean shutdown behavior.
