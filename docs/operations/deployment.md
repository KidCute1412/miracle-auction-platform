# Deployment: Oracle VM, Supabase, Aiven and Vercel

> Status: Current | Owner: Platform | Last verified: 2026-08-10

The current production topology is defined by [`compose.production.yml`](../../compose.production.yml) and the canonical [worker-process architecture](../architecture/worker-processes.md).

## Services

- Vercel hosts the Vite frontend.
- Caddy terminates TLS and proxies the API on the Oracle VM.
- One multi-stage backend build produces a production-only runtime image; API and workers run compiled `node dist/*.js`. The separate migrator target retains Prisma CLI.
- Redis 7 primary and replica run only on the Docker private network. The API requires one replica acknowledgement by default. Primary AOF remains the persistence mechanism; replica ACK alone is not an fsync guarantee.
- Supabase hosts PostgreSQL; Aiven hosts Kafka.
- `migrate` is a one-shot service and is not an application process.

The production memory budget is Redis 1 GiB, API 768 MiB, auction worker 512 MiB, async worker 512 MiB, relay 256 MiB and Caddy 128 MiB. Redis/API receive higher CPU shares. These caps are production-only; local Compose deliberately has no resource caps.

## Required release configuration

Start from `Backend/.env.example`. Store values in the VM secret environment, never in Git. Required groups are:

- database: `DATABASE_URL`, `DIRECT_URL`;
- Redis: `REDIS_PASSWORD` (Compose constructs the private `REDIS_URL`);
- Kafka/Aiven: brokers, TLS/SASL credentials and the four steady-state topic names;
- API: client origin, JWT/refresh/CSRF, captcha, OAuth and Cloudinary secrets;
- async worker: Gmail credentials and `EMAIL_DELIVERY_MODE=smtp`.

Local tests and k6 must use `EMAIL_DELIVERY_MODE=disabled`.

## Startup

```bash
docker compose -f compose.production.yml build migrate
docker compose -f compose.production.yml run --rm migrate
docker compose -f compose.production.yml up -d redis auction-worker
docker compose -f compose.production.yml up -d outbox-relay async-worker
docker compose -f compose.production.yml up -d api caddy
```

Compose also encodes migration, Redis-health and auction-worker-health dependencies. Do not scale `auction-worker`.

For a move from another Redis authority, enable bidding maintenance, drain the old Stream/projector and outbox, stop the old API/projector, bootstrap Oracle Redis from the verified PostgreSQL checkpoint, confirm worker heartbeat/reconciliation, then start the new API.

## Smoke checks

1. `/health` returns 200.
2. `/ready` returns 200 with database, Redis primary, required replica count and auction worker true; Kafka may be false without changing readiness.
3. Create an auction and immediately place a bid.
4. Verify Redis mutation response, PostgreSQL projection, one outbox event and a post-commit Socket event.
5. Complete buy-now/close and verify exactly one order.
6. Verify outbox drains and dashboard lag converges.
7. In disabled mode, verify email delivery rows become `sent` without contacting SMTP.

## Redis persistence and monitoring

Monitor memory usage, rejected writes/OOM, AOF rewrite status, AOF size, Stream length, consumer PEL and projection lag. `noeviction` is intentional: memory exhaustion must reject authoritative writes instead of deleting auction, idempotency or Stream state.

Back up the named `redis_authority_data` volume with VM/volume snapshots. For a portable copy, schedule maintenance, stop bid traffic, wait for projection convergence, request an AOF rewrite, stop Redis cleanly, then copy/snapshot the volume. Periodically restore into an isolated Redis container and reconcile sample auctions against PostgreSQL; an untested backup is not a recovery plan.

## Rollback

Stop the new API, auction worker, relay and async worker. Only then start the previous API/worker to avoid dual projectors, dual close schedulers or duplicate mail. Keep the additive migration in place. If Redis state is suspect, keep bidding in maintenance, rebuild from the verified PostgreSQL checkpoint, reconcile, then reopen.

The VM target is conservatively sized for the Oracle-documented post-trial Ampere allowance; do not publish a 4 OCPU/24 GiB Always Free claim without tenancy-specific evidence: [OCI Free Tier](https://docs.oracle.com/en-us/iaas/Content/FreeTier/freetier.htm).
