# Oracle Always Free Portfolio Deployment

## 1. Deployment Decision

This portfolio deployment uses:

| Layer | Provider |
| --- | --- |
| React frontend | Vercel |
| API, Socket.IO, worker, HTTPS proxy | Oracle Cloud Always Free VM |
| PostgreSQL | Supabase |
| Redis | Upstash Redis |
| Apache Kafka | Aiven Free Kafka |

Upstash Kafka is not used because that product was discontinued. Aiven currently provides a permanent free Kafka tier for learning, prototypes, and demos. Its limits and availability can change, so verify the current [Aiven Free Kafka documentation](https://aiven.io/docs/products/kafka/free-tier/kafka-free-tier) before deployment.

This topology is suitable for an internship portfolio and public demo. It is not a high-availability business deployment and does not claim an SLA.

## 2. Production Topology

```text
app.example.com
    -> Vercel: React frontend

api.example.com
    -> Oracle VM
       -> Caddy HTTPS reverse proxy
          -> API container: Express + Socket.IO
          -> Worker container: Kafka consumers + scheduled jobs

API + worker
    -> Supabase PostgreSQL
    -> Upstash Redis
    -> Aiven Kafka
```

`compose.production.yml` is the production entry point. Only Caddy exposes ports 80 and 443. API and worker ports remain private inside the Compose network.

Local development continues to use the Apache Kafka, PostgreSQL, and Redis containers in `docker-compose.yml`.

## 3. Provider Limits and Expected Degradation

The Aiven Free Kafka plan is intended for small workloads:

- up to 250 KiB/s ingress and 250 KiB/s egress
- up to five topics with two partitions per topic
- up to three days of retention
- no Kafka Connect and no production SLA
- possible automatic shutdown after extended inactivity

These limits are sufficient for small auction and dashboard event messages. The application must remain correct when Kafka is unavailable:

- business transactions commit to PostgreSQL first
- unpublished events remain in the PostgreSQL transactional outbox
- the dispatcher retries after Kafka recovers
- the dashboard keeps serving its last PostgreSQL snapshot
- a scheduled dashboard refresh repairs missed or delayed events
- the UI displays snapshot age instead of claiming that stale data is live

Upstash Redis is also non-authoritative. A Redis outage may pause rate limiting, projection features, or live notifications according to the affected module, but it must not corrupt PostgreSQL data.

## 4. First-Time Oracle Setup

1. Create an Ubuntu `VM.Standard.A1.Flex` Always Free instance in the tenancy home region and stay within the current Oracle free allowance.
2. Allow inbound TCP 80 and 443. Restrict SSH 22 to the deployer's IP.
3. Install Docker Engine and the Docker Compose plugin.
4. Create a restricted `deploy` user and `/opt/online-auction` owned by that user.
5. Clone the repository to `/opt/online-auction/repo` with a read-only GitHub deploy key.
6. Point the DNS A record for `api.example.com` to the VM before starting Caddy.
7. Create `/opt/online-auction/.env.production`, readable only by `deploy`. Never commit it.

Production start:

```bash
cd /opt/online-auction/repo
docker compose --env-file /opt/online-auction/.env.production -f compose.production.yml up -d --build --remove-orphans
```

## 5. Managed Service Setup

### Supabase PostgreSQL

1. Create a Supabase project.
2. Use the pooled connection for `DATABASE_URL`.
3. Use the direct connection for `DIRECT_URL` and Prisma migrations.
4. Back up the database before data-changing migrations.
5. Treat versioned Prisma migrations as the only schema source of truth.
6. Do not run demo seed SQL in production.

The `migrate` Compose service runs `prisma migrate deploy` before API and worker startup.

### Upstash Redis

1. Create an Upstash Redis database near the Oracle and Supabase regions where possible.
2. Copy its TLS URL into `REDIS_URL`.
3. Do not expose Redis credentials to Vercel.

Redis is used for time-limited state, rate limiting, coordination, and cross-process notifications. It is not the authoritative store for dashboard analytics.

### Aiven Free Kafka

1. Create one Aiven for Apache Kafka Free service.
2. Select SASL with SCRAM-SHA-256.
3. Enable the public Let's Encrypt CA for the SASL endpoint so the current KafkaJS `ssl: true` configuration can use the system trust store.
4. Create these topics:
   - `bidding_events`
   - `dashboard_updates`
   - `dashboard_updates_dlq` after the dashboard retry/DLQ phase is implemented
5. Copy the SASL bootstrap server, username, and password into the Oracle environment file.
6. Keep topic count within the free-plan maximum.

The current backend uses KafkaJS with TLS and SCRAM-SHA-256 in production. If the public CA option is unavailable, add explicit `KAFKA_CA` loading to the backend before deploying; do not disable TLS verification.

## 6. Production Environment File

Set these values in `/opt/online-auction/.env.production`:

```text
NODE_ENV=production
PORT=5000
API_DOMAIN=api.example.com
CLIENT_URL=https://app.example.com

DATABASE_URL=postgresql://...pooled-supabase-host.../postgres?pgbouncer=true&schema=public
DIRECT_URL=postgresql://...direct-supabase-host.../postgres?schema=public
REDIS_URL=rediss://...

KAFKA_BROKERS=aiven-sasl-host:port
KAFKA_USERNAME=...
KAFKA_PASSWORD=...

JWT_SECRET=...
JWT_REFRESH_SECRET=...
CAPTCHA_SECRET_KEY=...
GOOGLE_CLIENT_ID=...
GMAIL_ADDRESS=...
GMAIL_APP_PASSWORD=...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

All database, Redis, Kafka, JWT, CAPTCHA, Gmail, and Cloudinary values are backend secrets. Never expose them through `VITE_*` variables, screenshots, logs, workflows, or committed files.

`/health` reports process health. `/ready` checks critical dependencies and should return `503` when a required dependency is unavailable.

## 7. Vercel Frontend

Import the repository with:

```text
Root directory: Frontend
Build command: npm run build
Output directory: dist
```

Configure only public frontend values:

```text
VITE_API_URL=https://api.example.com
VITE_PATH_ADMIN=admin
VITE_TINY_MCE=public_tinymce_key_if_used
VITE_CAPTCHA_SITE_KEY=public_recaptcha_site_key
VITE_GOOGLE_CLIENT_ID=google_oauth_client_id
```

Also configure:

- Google OAuth authorized origin: `https://app.example.com`
- reCAPTCHA allowed domain: `app.example.com`
- credentialed CORS origin: exactly `https://app.example.com`
- production cookies: `Secure`, `HttpOnly`, and the chosen `SameSite` policy

## 8. GitHub Actions Deployment

CI should build the backend, lint/build the frontend, run required tests, validate both Compose files, and build the production image before deployment.

Required GitHub repository secrets:

```text
ORACLE_SSH_HOST
ORACLE_DEPLOY_USER
ORACLE_SSH_PRIVATE_KEY
ORACLE_SSH_KNOWN_HOST
```

Application secrets remain only in `/opt/online-auction/.env.production`. The deployment checks out the exact successful `main` commit and runs the production Compose command.

## 9. Operations and Smoke Checks

```bash
curl -fsS https://api.example.com/health
curl -fsS https://api.example.com/ready
docker compose --env-file /opt/online-auction/.env.production -f compose.production.yml ps
docker compose --env-file /opt/online-auction/.env.production -f compose.production.yml logs -f api worker
```

Verify:

- HTTPS and CORS preflight
- secure login and refresh cookies
- normal login, Google login, and reCAPTCHA
- product listing and product details
- valid bid placement and final bid correctness
- outbox publication to Aiven Kafka
- worker consumption and graceful restart
- auction closing and winner order creation
- admin dashboard snapshot and authenticated Socket.IO refresh
- recovery behavior during temporary Kafka and Redis outages
- Cloudinary upload and Gmail delivery, or documented disabled behavior

Worker logs must include event ID, topic, partition, offset, consumer group, attempt, latency, and safe failure details.

## 10. Rollback

Application rollback:

```bash
cd /opt/online-auction/repo
git fetch --prune origin
git checkout --detach <previous-commit-sha>
docker compose --env-file /opt/online-auction/.env.production -f compose.production.yml up -d --build --remove-orphans
```

Database rollback is separate: restore the verified backup or run reviewed rollback SQL for the migration. Never roll back a data-changing schema blindly.

After rollback, verify API readiness, Kafka connectivity, outbox backlog recovery, worker health, bidding, and the admin dashboard snapshot.
