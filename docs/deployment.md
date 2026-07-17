# Oracle Always Free portfolio deployment

This repository deploys the frontend to Vercel and the API plus background worker to one Oracle Cloud Always Free VM. Supabase provides PostgreSQL and Upstash provides Redis and Kafka. The expected running cost is $0 for compute while all free-tier quotas are respected, plus roughly $12–24/year for a custom domain. Prices and free-tier limits are controlled by their providers and can change.

Oracle is appropriate for a portfolio and demo, not a business needing an SLA or managed support. If OCI cannot provision Always Free capacity, Koyeb is the fallback only.

## Topology

```text
app.example.com  -> Vercel (Frontend)
api.example.com  -> Oracle VM: Caddy -> api container + Socket.IO
                                      -> worker container
api + worker     -> Supabase PostgreSQL, Upstash Redis, Upstash Kafka
```

`compose.production.yml` is the production entry point. It exposes only Caddy on ports 80 and 443; API and worker ports remain private to the Compose network. Caddy obtains and retains TLS certificates in named Docker volumes.

## First-time Oracle setup

1. Create an Ubuntu `VM.Standard.A1.Flex` Always Free instance in your home region. Keep the total allocation within Oracle's current Always Free allowance (for example, 2 OCPUs and 6–8 GB RAM for this portfolio).
2. Permit inbound TCP 80/443. Restrict SSH 22 to the deployer's IP. Install Docker Engine and the Docker Compose plugin.
3. Create the restricted `deploy` user and `/opt/online-auction` owned by it. Clone the repository into `/opt/online-auction/repo` using a read-only GitHub deploy key installed for that user.
4. Point the DNS A record for `api.example.com` at the VM public IP before starting Caddy. Caddy then provisions and renews HTTPS automatically.
5. Create `/opt/online-auction/.env.production` with permissions readable only by `deploy`. This file stays on the VM and is never committed.

The production start command is:

```bash
cd /opt/online-auction/repo
docker compose --env-file /opt/online-auction/.env.production -f compose.production.yml up -d --build --remove-orphans
```

## Production environment file

Set every value below in `/opt/online-auction/.env.production`; use real secrets, not the placeholders from `Backend/.env.example`.

```text
NODE_ENV=production
PORT=5000
API_DOMAIN=api.example.com
CLIENT_URL=https://app.example.com

DB_CLIENT=pg
DB_HOST=...
DB_PORT=5432
DB_USER=...
DB_PASSWORD=...
DB_NAME=postgres
DB_SSL=true
REDIS_URL=rediss://...
KAFKA_BROKERS=...
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

These are backend-only values: database, Redis, Kafka, JWT, CAPTCHA secret, Gmail app password, Cloudinary secret, and Google client ID. Do not put them in Vercel or in a `VITE_*` variable. Backend `PORT` is honored and defaults to 5000. `/health` reports process health; `/ready` additionally checks PostgreSQL, Redis, and Kafka.

## Managed dependency bootstrap

Create the Supabase project, then import SQL in this exact initial-demo order:

1. `data/database.sql`
2. `data/category/category.insert.sql`
3. `data/user/user.insert.sql`
4. `data/product/tikiAPI/product.insert.sql`

There is no formal migration system in this release. Before any future schema change, take a database backup and commit a SQL migration file with explicit manual apply and rollback notes. Apply it manually to Supabase only after testing it.

Create Upstash Redis and Kafka instances and copy their TLS endpoints/credentials into the VM environment file. Ensure Kafka provides the `bidding_events` and `dashboard_updates` topics used by the application.

## Public integration setup

- In Google Cloud OAuth, add `https://app.example.com` to Authorized JavaScript origins. Set the same OAuth web client ID in Vercel as `VITE_GOOGLE_CLIENT_ID` and on the VM as `GOOGLE_CLIENT_ID`. The backend verifies every Google ID token against that client ID.
- In reCAPTCHA, add `app.example.com` to the allowed domains. Put only its site key in Vercel as `VITE_CAPTCHA_SITE_KEY`; keep the secret on the VM as `CAPTCHA_SECRET_KEY`.
- Create Cloudinary API credentials and place all Cloudinary values only in the VM environment file.
- Enable two-step verification for the Gmail sending account, generate a Gmail app password, and place it only in `GMAIL_APP_PASSWORD` on the VM.

## Vercel frontend

Import the repository in Vercel with `Frontend` as the root directory, build command `npm run build`, and output directory `dist`. Attach `app.example.com` and configure:

```text
VITE_API_URL=https://api.example.com
VITE_PATH_ADMIN=admin
VITE_TINY_MCE=public_tinymce_key_if_used
VITE_CAPTCHA_SITE_KEY=public_recaptcha_site_key
VITE_GOOGLE_CLIENT_ID=google_oauth_client_id
```

All `VITE_*` values are shipped to browsers. Never add `VITE_GOOGLE_SECRET` or any password, token, or provider secret.

## GitHub Actions deployment

The CI workflow type-checks the backend, lints/builds the frontend, validates both Compose files, and cleanly builds the production backend image. A deployment runs only for a successful push to `main`; deployments share a single concurrency group.

Set these repository secrets only:

```text
ORACLE_SSH_HOST
ORACLE_DEPLOY_USER
ORACLE_SSH_PRIVATE_KEY
ORACLE_SSH_KNOWN_HOST
```

`ORACLE_SSH_KNOWN_HOST` must be the complete trusted `known_hosts` entry for the VM (not an unchecked `ssh-keyscan` result). Application secrets remain solely in `/opt/online-auction/.env.production`. The VM clone's read-only deploy key is separate from the GitHub Actions SSH key and lets the deployment fetch private repository commits.

The action fetches and checks out the exact pushed commit, then runs the production Compose command above.

## Operations, checks, and rollback

```bash
curl -fsS https://api.example.com/health
curl -fsS https://api.example.com/ready
docker compose --env-file /opt/online-auction/.env.production -f compose.production.yml ps
docker compose --env-file /opt/online-auction/.env.production -f compose.production.yml logs -f api worker
```

Smoke-check HTTPS, CORS preflight, Socket.IO, secure login cookies (`Secure`, `HttpOnly`, `SameSite=Lax`), normal and Google login, reCAPTCHA, Cloudinary upload, Gmail delivery, product browsing, valid bidding, worker consumption, auction closing, and winner order creation.

To roll back application code, use a known previous commit without changing the VM environment file:

```bash
cd /opt/online-auction/repo
git fetch --prune origin
git checkout --detach <previous-commit-sha>
docker compose --env-file /opt/online-auction/.env.production -f compose.production.yml up -d --build --remove-orphans
```

Database rollback is manual: restore the backup or run the migration's documented rollback SQL. Do not roll back schema blindly after data-changing releases.
