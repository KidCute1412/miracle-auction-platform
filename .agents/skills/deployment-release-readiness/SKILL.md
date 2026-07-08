---
name: deployment-release-readiness
description: Use for production deployment, release handoff, environment variables, Docker/Vercel/backend hosting, secrets, smoke checks, rollback plans, and operational readiness.
---

# Deployment and Release Readiness

## When to Apply
- Use when preparing a demo deployment, production-like release, handoff notes, environment setup, Docker changes, Vercel/frontend deployment, backend hosting, secrets, or rollback steps.
- Use with `ci-cd-observability` for health checks, logs, Docker, and CI gates.
- Use with `secure-auth-owasp` for cookies, CORS, CSRF, OAuth, reCAPTCHA, SMTP, and secrets.
- Use with `portfolio-readiness` so public docs only claim deployment behavior that is actually configured.

## Repo Context
- Frontend is Vite and has `Frontend/vercel.json`.
- Backend has `Backend/Dockerfile` and Docker Compose local infrastructure for PostgreSQL, Redis, Kafka, and a Node worker.
- `.env.example` files exist for Backend and Frontend; local `.env` files may exist but should not be treated as shareable config.
- CI currently validates backend build, frontend lint/build, and Docker Compose config.

## Implementation Checklist
- Document required environment variables by service: backend API, frontend, database, Redis, Kafka, SMTP, Cloudinary, OAuth, captcha, and JWT.
- Keep secrets out of README, workflows, Dockerfiles, screenshots, logs, and committed `.env` files.
- Define production frontend origin and backend API URL explicitly.
- Configure CORS, cookie domain, Secure, SameSite, and CSRF settings for the deployed topology.
- Provide deployment commands for frontend, backend, worker, and infrastructure separately.
- Add health and readiness endpoints before relying on uptime checks.
- Include smoke checks for login, product list, product detail, bid placement, order flow, worker startup, and email-disabled behavior.
- Document rollback steps for frontend, backend, worker, and database changes.
- For database changes, document migration order and rollback or backup strategy.
- For Kafka/Redis outages, document expected degraded behavior.
- Keep deployment docs specific to the chosen platform; do not mix unimplemented providers.

## Acceptance Criteria
- A reviewer can identify every required secret without seeing secret values.
- Frontend and backend deployment settings match actual CORS and cookie behavior.
- Backend, worker, Redis, Kafka, and database startup order is documented.
- Release smoke checks cover the core auction path.
- Rollback notes exist for app code and schema changes.

## Verification Commands
```powershell
docker compose config
cd Backend; npm run build
cd Frontend; npm run lint
cd Frontend; npm run build
```

Target commands after deployment hardening:
```powershell
curl -i http://localhost:5000/health
curl -i http://localhost:5000/ready
docker build Backend
```

Release smoke checklist:
```text
frontend loads with deployed API URL
login sets expected cookies
product list and detail load
authenticated bidder can place valid bid
seller and non-winner restrictions still apply
worker starts and logs broker connection
order flow works for winning bidder
```

## Anti-Patterns
- Publishing local `.env` values as setup instructions.
- Claiming deployment support without health checks or smoke checks.
- Using wildcard CORS with credentialed cookies.
- Deploying backend without the worker path needed for auction side effects.
- Running schema changes without rollback or backup notes.

## Portfolio Signal
- The repo looks handoff-ready: deployable services, clear secrets, smoke checks, rollback notes, and operational limits are visible without exposing private credentials.
