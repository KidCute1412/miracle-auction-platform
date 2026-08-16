# Hetzner Demo Operations Cheat Sheet

> Server: `online-auction-demo` | Frontend: `auction.lok1412.site` | API: `miracle-auction-platform.lok1412.site`

Read [Deployment v2: Hetzner Portfolio Demo](./deployment-v2-hetzner-demo.md) for first setup. This file is the short operating guide afterwards.

## Deploy

Connect from Windows:

```powershell
ssh -i C:\Users\LENOVO\.ssh\hetzner_auction root@<SERVER_IP>
```

Deploy manually on the server:

```bash
sudo -u deploy bash /opt/online-auction/repo/scripts/deploy-hetzner-demo.sh
```

That one script pulls `main`, builds, migrates, seeds only an empty demo database, starts the stack, then checks health.

## Automatic deployment

GitHub displays one **CI/CD Pipeline** workflow. Its final **Deploy Hetzner demo** job runs only when a `push` to `main` passes every CI job. Pull requests, `dev`, and failed CI runs never deploy.

Required GitHub Action secrets:

| Secret | Value |
| --- | --- |
| `HETZNER_SSH_PRIVATE_KEY` | Full private `github_hetzner_deploy` key |
| `HETZNER_SSH_HOST` | Hetzner IPv4 only, without `https://` |
| `HETZNER_DEPLOY_USER` | `deploy` |
| `HETZNER_SSH_KNOWN_HOST` | All non-comment known-host entries for the server |

GitHub **Deploy key** `hetzner-readonly` is separate: it lets Hetzner pull this repository. Keep it.

## Status and logs

On the server, first run `cd /opt/online-auction/repo`, then:

```bash
sudo -u deploy docker compose --env-file /opt/online-auction/demo.env -f compose.hetzner-demo.yml ps
```

Expected running services: `redis`, `auction-worker`, `outbox-relay`, `async-worker`, `api`, `caddy`. `migrate` is one-shot and normally exits successfully.

```bash
sudo -u deploy docker compose --env-file /opt/online-auction/demo.env -f compose.hetzner-demo.yml logs --tail=200
```

```text
https://miracle-auction-platform.lok1412.site/health
https://miracle-auction-platform.lok1412.site/ready
https://auction.lok1412.site
```

Never run more than one `auction-worker`.

## Production environment values

Edit `Backend/.env.production` only on Windows; local `Backend/.env` remains for local development. Copy the production file to `/tmp/demo.env` using `scp root@<SERVER_IP>`, then install it as `/opt/online-auction/demo.env`, owner `deploy`, mode `600`; finally run the deploy script.

Important values:

```env
NODE_ENV=production
CLIENT_URL=https://auction.lok1412.site
API_DOMAIN=miracle-auction-platform.lok1412.site
BID_DURABILITY_REPLICAS=0
```

The demo has one Redis node, so replica acknowledgement stays `0`. With Supabase Free Session pooler, append `connection_limit=2` to `DATABASE_URL` and `DIRECT_URL`; four Node processes otherwise exceed its small session limit.

Never commit `Backend/.env.production` or `/opt/online-auction/demo.env`.

## Demo data

The first deploy imports the same data as local `start.bat`:

```text
data/category/category.insert.sql
data/user/user.insert.sql
data/product/tikiAPI/product.insert.sql
```

Those files contain `TRUNCATE`. The script imports them only when `categories` is empty; do not run them manually after public data exists.

## DNS, email and OAuth

- Vercel project domain: `auction.lok1412.site`.
- Vercel DNS A record `api`: Hetzner IPv4.
- Hetzner firewall must keep TCP 80 and 443 open; Caddy obtains HTTPS automatically.
- OTP requires `GMAIL_ADDRESS` and `GMAIL_APP_PASSWORD`.
- `EMAIL_DELIVERY_MODE=smtp` enables async auction notification emails.
- Google OAuth needs the same client ID in backend `GOOGLE_CLIENT_ID` and Vercel `VITE_GOOGLE_CLIENT_ID`; Google Cloud must authorize `https://auction.lok1412.site`.

## Cost and deletion

Hetzner bills server and Primary IPv4 hourly, up to the monthly cap. Powering off does not stop charges.

When the demo is no longer required, delete `online-auction-demo` in Hetzner **Servers**, then delete the unused Primary IPv4 in **Primary IPs**. Keep source in GitHub and production env values in secure local/password-manager storage.

## Rollback

If a release is unhealthy, find a known-good commit SHA in GitHub Actions, then on the server:

```bash
cd /opt/online-auction/repo
sudo -u deploy env DEPLOY_COMMIT=<KNOWN_GOOD_COMMIT_SHA> bash scripts/deploy-hetzner-demo.sh
```

Do not delete Prisma migrations or database tables to roll back.
