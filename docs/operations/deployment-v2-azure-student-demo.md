# Deployment v2: Azure for Students Portfolio Demo

> Status: Planned | Owner: Platform | Last reviewed: 2026-08-14

This is the low-cost, production-like **portfolio demo** topology. It is intentionally different from the resilient production topology in [deployment.md](./deployment.md). It must never replace or weaken `compose.production.yml`.

## Goal and non-goals

The goal is a working public demo that a recruiter can open, sign in, inspect an auction and submit a normal bid. It is not intended to sustain the distributed benchmark, be highly available, or provide a durable Redis replica acknowledgement.

The demo keeps every application process that makes the auction flow work:

- API server;
- exactly one `auction-worker`;
- exactly one `outbox-relay`;
- exactly one `async-worker`;
- one local Redis primary.

It deliberately omits the Redis replica and changes `BID_DURABILITY_REPLICAS` to `0`. This removes the production replica-ack guarantee and is acceptable only for a clearly labelled portfolio demo. PostgreSQL remains the durable system of record and the existing projector/outbox flows remain enabled.

## Target topology

```text
Vercel: app.example.com (Vite frontend)
                    |
                    | HTTPS, cookies and Socket.IO
                    v
Azure B-series Ubuntu VM: api.example.com
  Caddy -> API container
           |-- auction-worker container
           |-- outbox-relay container
           |-- async-worker container
           `-- Redis 7 primary with an AOF volume
                    |                 |
                    v                 v
           Supabase PostgreSQL     Confluent Cloud Kafka
```

Use `app.example.com` and `api.example.com` beneath one domain. The backend currently issues `Secure; SameSite=Lax` cookies in production. A Vercel `*.vercel.app` origin plus an unrelated Azure hostname is cross-site and is not a reliable cookie-auth topology.

## Provider and free-tier reality

| Component | Provider | Demo plan | Free-duration rule |
| --- | --- | --- | --- |
| Frontend | Vercel | Existing deployment | Subject to Vercel's current hobby limits. |
| VM | Azure for Students | One Ubuntu B-series VM, target 2 GiB RAM | $100 credit expires 12 months after issue; service is disabled when credit is exhausted. Eligible students can renew annually, but cannot renew early merely because credit was exhausted. |
| Database | Supabase | Free PostgreSQL | 500 MB database limit; low-activity projects can pause after one week. Treat it as demo infrastructure, not an SLA. |
| Kafka | Confluent Cloud | Basic | Check the current billing dashboard before publishing. Credits and usage terms are provider-controlled; Kafka activity is not assumed to be permanently free. |
| Redis | Azure VM | Local Redis container and named volume | Included in VM cost; no managed Redis bill or command quota. |

Azure for Students needs an eligible university identity, has no credit-card requirement, and gives $100 credit valid for 12 months. When credit is exhausted without an upgrade, Azure disables the subscription and its resources. See [Azure for Students](https://azure.microsoft.com/en-us/free/students) and [credit-expiry behaviour](https://learn.microsoft.com/en-us/azure/cost-management-billing/manage/azurestudents-subscription-disabled).

### Budget expectation

Choose a low-priority burstable VM with **2 GiB RAM** (for example, a B-series SKU available to the Azure for Students subscription in Southeast Asia) and a small managed disk. The exact monthly bill depends on SKU, region, disk, public IPv4 and egress; calculate it in the Azure portal before creating the VM.

The intended budget is below roughly $15–20/month for the VM, disk and public IP combined. That makes the $100 credit a several-month demo budget, not a guaranteed 12-month always-on deployment. Use the Azure Cost Management forecast, not this estimate, as the source of truth.

Do not choose a 1 GiB VM. It can boot a single Node process but is too likely to OOM when the API, all three workers and Redis run together. Do not choose a larger VM until the 2 GiB topology has failed its smoke test.

## Required implementation before first deploy

`compose.production.yml` remains the production/release definition. Add a separate `compose.azure-demo.yml` before following the VM steps. Its contract is:

- build from repository root with `Backend/Dockerfile`;
- run `api`, `auction-worker`, `outbox-relay`, `async-worker`, `redis`, `migrate` and `caddy`;
- keep the three workers as separate services; do not combine commands with shell backgrounding;
- include Redis AOF and one named local volume; do **not** include `redis-replica`;
- set Redis to `noeviction` with a small explicit memory limit suitable for the VM;
- set all application containers to the private Redis URL, with `BID_DURABILITY_REPLICAS=0`;
- keep PostgreSQL and Kafka URLs external through environment variables;
- set `EMAIL_DELIVERY_MODE=disabled` unless real SMTP credentials and consent are configured;
- publish only Caddy ports `80` and `443`; never publish Redis or worker ports;
- preserve the single `auction-worker` constraint.

The demo file is an application/configuration change: add tests for any code required to make settings configurable, run the build, and validate `docker compose -f compose.azure-demo.yml config` before deployment.

## Step-by-step deployment runbook

### 1. Obtain domain and DNS ownership

1. Register or use an existing domain.
2. Add it to a DNS provider.
3. Reserve `app.<domain>` for Vercel and `api.<domain>` for the VM.
4. Do not configure final A/CNAME records until the Azure public IP exists.

The domain is a small but necessary portfolio cost if cookie login and cross-subdomain Socket.IO are to work without changing the auth policy.

### 2. Create external services

#### Supabase

1. Create a project in a region close to the VM.
2. Copy the pooled connection string into `DATABASE_URL` and the direct connection string into `DIRECT_URL`.
3. Confirm the database uses the expected production schema only after the migration step below.
4. Record the project pause behaviour and keep a manual restore owner.

#### Confluent Cloud

1. Create a Basic Kafka cluster in the nearest supported region.
2. Create an API key and secret with the narrowest permissions that support this application.
3. Create or allow the application to create the configured topics:
   `bidding_events`, `domain_events`, `dashboard_updates`, `async_events_dlq`, and `dashboard_updates_dlq`.
4. Copy broker, TLS/SASL credentials and topic names into the VM environment. Do not put them in GitHub Actions logs or committed `.env` files.

Before launch, check the Confluent billing page and set any available alert/budget. A demo with active topics is not a promise of permanent $0 Kafka.

### 3. Create Azure for Students resources

1. Sign in with the university identity at Azure for Students and verify the available $100 credit.
2. In **Cost Management**, create alert thresholds at 50%, 75% and 90% of the $100 credit.
3. Create a resource group, for example `rg-online-auction-demo-sea`.
4. Create an Ubuntu 24.04 LTS VM in Southeast Asia with a 2 GiB B-series size that the subscription permits.
5. Use a 32 GB standard managed disk initially; do not attach premium disks for this demo.
6. Assign a public IP and note it. It consumes credit, so delete it during teardown.
7. Create an NSG with only:
   - TCP 22 from the maintainer's current public IP, never from `0.0.0.0/0`;
   - TCP 80 from the Internet for HTTP-to-HTTPS redirect and certificate issuance;
   - TCP 443 from the Internet for the API.
8. Do not expose TCP 6379, Kafka, PostgreSQL or any worker port.
9. Add an `A` record for `api.<domain>` to the public IP and wait for DNS propagation.

### 4. Prepare the VM

SSH to the VM as the provisioned administrator and install Docker, Compose and Git using the current official Ubuntu/Docker instructions. Then clone the repository using a deploy key or a read-only GitHub credential; do not paste a personal access token into shell history.

Required checks on the VM:

```bash
docker --version
docker compose version
git --version
free -h
```

Create a root-readable deployment environment file outside the Git checkout, for example `/opt/online-auction/demo.env`, with permissions `600`. Populate it from `Backend/.env.example`, changing at minimum:

```dotenv
NODE_ENV=production
PORT=5000
CLIENT_URL=https://app.<domain>
API_DOMAIN=api.<domain>

DATABASE_URL=<Supabase pooled URL>
DIRECT_URL=<Supabase direct URL>

REDIS_PASSWORD=<long random secret>
BID_DURABILITY_REPLICAS=0
EMAIL_DELIVERY_MODE=disabled

KAFKA_BROKERS=<Confluent broker host:port>
KAFKA_SSL=true
KAFKA_USERNAME=<Confluent API key>
KAFKA_PASSWORD=<Confluent API secret>

JWT_SECRET=<long random secret>
JWT_REFRESH_SECRET=<different long random secret>
CSRF_SECRET=<third long random secret>
```

Also set Cloudinary, reCAPTCHA and Google OAuth values when those features are enabled. Update the OAuth authorized JavaScript origin and redirect configuration to the production frontend/API domains before testing Google login.

### 5. Build, migrate and start in safe order

From the repository root on the VM, use the future demo Compose file and the environment file:

```bash
docker compose --env-file /opt/online-auction/demo.env -f compose.azure-demo.yml build
docker compose --env-file /opt/online-auction/demo.env -f compose.azure-demo.yml run --rm migrate
docker compose --env-file /opt/online-auction/demo.env -f compose.azure-demo.yml up -d redis auction-worker
docker compose --env-file /opt/online-auction/demo.env -f compose.azure-demo.yml up -d outbox-relay async-worker
docker compose --env-file /opt/online-auction/demo.env -f compose.azure-demo.yml up -d api caddy
docker compose --env-file /opt/online-auction/demo.env -f compose.azure-demo.yml ps
```

Never start a second `auction-worker`. Its close scheduler and Redis Stream projector are intentionally single-process.

### 6. Configure Vercel

1. Add `app.<domain>` to the existing Vercel project and configure its DNS record.
2. Set `VITE_API_URL=https://api.<domain>` in Vercel's production environment.
3. Redeploy the frontend.
4. Verify CORS allows exactly `https://app.<domain>` and does not use a wildcard with credentials.

### 7. Smoke test before sharing the URL

Run these checks in order:

1. `https://api.<domain>/health` returns HTTP 200.
2. `https://api.<domain>/ready` returns HTTP 200 and reports the demo mode's primary-only Redis expectation.
3. Open `https://app.<domain>` in a private browser window.
4. Register or sign in and verify Secure cookies are set and sent.
5. Load a product list and product detail page.
6. Create/open an active auction and place a valid bid.
7. Confirm the worker projects the bid to PostgreSQL and emits the Socket update.
8. Test buy-now or auction close; verify exactly one order is created.
9. Check `docker compose ... logs --tail=200` for API, auction worker, relay and async worker startup errors.
10. Confirm disabled email rows are marked according to the application's disabled-mode behaviour, with no SMTP traffic.

Do not run k6 or the distributed benchmark against this environment.

## Operations while the demo is live

- Review Azure credit and Confluent usage weekly.
- Review Supabase project state weekly; restore it before a planned presentation if it paused.
- Apply code releases by rebuilding on the VM, then start the worker/API services in the same order above.
- Before a schema migration, export a database backup and schedule a short maintenance window.
- Keep a short screen-recorded demo in the repository or release assets. It remains the fallback if any free provider pauses a component.

## Stop, move and rollback

When credit is low, stop public traffic first, then stop `api`, `auction-worker`, `outbox-relay` and `async-worker`. Do not leave a second worker alive while moving environments.

The exit path is deliberately simple: copy the Azure demo environment file securely, move the same `compose.azure-demo.yml` to a personal machine or a paid VPS, point `api.<domain>` to the new host, run the migration only after verifying the current schema, then start one auction worker. Do not move the demo Redis AOF as a source of truth without the production reconciliation procedure; PostgreSQL is the durable recovery point.

For full production resilience, return to [`deployment.md`](./deployment.md): Redis primary/replica, `BID_DURABILITY_REPLICAS=1`, backup/restore validation and production memory allocation are mandatory there.
