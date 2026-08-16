# Deployment v2: Hetzner Portfolio Demo

> Small public demo. Do not run benchmarks on this server.

```text
auction.lok1412.site                      -> Vercel frontend
miracle-auction-platform.lok1412.site     -> Hetzner EU VPS: Caddy, API, 3 workers, Redis
Supabase                                  -> PostgreSQL
Aiven Free                                -> Kafka
```

Use a Hetzner EU `CX23` (2 vCPU, 4 GiB). It is paid, normally about EUR 4-5/month including a public IPv4 before any card/VAT difference. Do not choose Hetzner Singapore for this low-cost plan. This demo uses one local Redis primary and `BID_DURABILITY_REPLICAS=0`; do not alter `compose.production.yml`.

After the first deployment, use the [Hetzner Demo Operations Cheat Sheet](./hetzner-demo-operations.md) for daily operation, automatic deployment, logs, secret updates, rollback, and shutdown.

## Before creating the server

Complete these first:

- Vercel owns `lok1412.site`. In the Vercel **frontend project** go to **Settings** -> **Domains** -> add `auction.lok1412.site`; Vercel creates or tells you the required DNS record. Wait for it to show **Valid Configuration**.
- In `Backend/.env.production`, set exactly `NODE_ENV=production`, `CLIENT_URL=https://auction.lok1412.site`, and `API_DOMAIN=miracle-auction-platform.lok1412.site`.
- Supabase values are in `Backend/.env.production`: `DATABASE_URL` and `DIRECT_URL`.
- For the Supabase Free Session pooler, append `connection_limit=2` to both URLs (use `?connection_limit=2`, or `&connection_limit=2` if the URL already has `?`). This caps the four Node processes below Supabase's small session limit.
- Aiven values are in that file: Kafka broker, CA, service username/password, and the four topics.
- Fill `REDIS_PASSWORD`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, and `CSRF_SECRET` with different long random values.
- Never commit `Backend/.env.production`; Git ignores it.

## 1. Create an SSH key on Windows

Run PowerShell, replacing `<windows-user>`:

```powershell
ssh-keygen -t ed25519 -f C:\Users\<windows-user>\.ssh\hetzner_auction -C "online-auction-hetzner"
```

Open `C:\Users\<windows-user>\.ssh\hetzner_auction.pub` and copy its complete `ssh-ed25519 ...` line. Never upload or share the private key without `.pub`.

## 2. Create the Hetzner server

1. Open [Hetzner Cloud Console](https://console.hetzner.cloud/) → **New project**: `online-auction-demo`.
2. Click **Add Server** and select:

   | Field | Value |
   | --- | --- |
   | Location | `Nuremberg (NBG1)` or `Falkenstein (FSN1)` |
   | Image | Ubuntu 24.04 |
   | Type | Shared vCPU → Cost Optimized → `CX23` |
   | Networking | Public IPv4 and IPv6 enabled |
   | SSH keys | Add/select the public key from Step 1 |
   | Name | `online-auction-demo` |

3. Leave backups, volumes, load balancers and private networks off. Click **Create & Buy now**.
4. On the server Overview page, copy its **IPv4** address.

## 3. Create the firewall

1. Hetzner Console → **Firewalls** → **Create Firewall** → attach `online-auction-demo`.
2. Add inbound TCP rules:

   | Port | Source |
   | --- | --- |
   | 22 | Your current public IP |
   | 80 | Any IPv4 and IPv6 |
   | 443 | Any IPv4 and IPv6 |

Do not open Redis, PostgreSQL, Kafka, port 5000, or worker ports.

## 4. Point the API domain to Hetzner

1. Vercel → **Domains** → `lok1412.site` → **DNS Records** → **Add**.
2. Enter:

   | Field | Value |
   | --- | --- |
   | Type | `A` |
   | Name | `api` |
   | Value | Hetzner IPv4 from Step 2 |

3. Wait until this returns the Hetzner IP:

   ```powershell
   nslookup miracle-auction-platform.lok1412.site
   ```

## 5. Prepare the server

Connect from PowerShell:

```powershell
ssh -i C:\Users\<windows-user>\.ssh\hetzner_auction root@<hetzner-ip>
```

Run on the server:

```bash
apt update
apt install -y docker.io docker-compose-v2 git
systemctl enable --now docker
adduser --disabled-password --gecos "" deploy
usermod -aG docker deploy
install -d -m 700 -o deploy -g deploy /opt/online-auction /home/deploy/.ssh
```

## 6. Let the server clone GitHub

Run on the server:

```bash
sudo -u deploy ssh-keygen -t ed25519 -f /home/deploy/.ssh/id_ed25519 -C "hetzner-readonly" -N ""
sudo -u deploy cat /home/deploy/.ssh/id_ed25519.pub
```

1. GitHub repository → **Settings** → **Deploy keys** → **Add deploy key**.
2. Paste that key, name it `hetzner-readonly`, and leave **Allow write access** off.
3. Back on the server:

   ```bash
   sudo -u deploy ssh-keyscan github.com >> /home/deploy/.ssh/known_hosts
   sudo -u deploy git clone <repository-SSH-URL> /opt/online-auction/repo
   ```

## 7. Copy the secret environment file

On Windows:

```powershell
scp -i C:\Users\<windows-user>\.ssh\hetzner_auction Backend\.env.production deploy@<hetzner-ip>:/tmp/demo.env
```

On the server:

```bash
install -m 600 -o deploy -g deploy /tmp/demo.env /opt/online-auction/demo.env
rm /tmp/demo.env
```

The Compose commands use `/opt/online-auction/demo.env`; do not put its content in GitHub secrets or Vercel.

## 8. Add the demo Compose file, then start

`compose.hetzner-demo.yml` is committed at the repository root. It builds from the repository root with `Backend/Dockerfile` (the image copies `packages/api-contracts`) and runs one Redis, `api`, exactly one `auction-worker`, `outbox-relay`, `async-worker`, `migrate`, and `caddy`. It intentionally does not run `redis-replica`.

Run the complete first deployment on the server with one command:

```bash
sudo -u deploy bash /opt/online-auction/repo/scripts/deploy-hetzner-demo.sh
```

The script pulls `main`, builds, migrates, imports the same local `start.bat` demo catalog only when the `categories` table is empty, starts all services, and checks `/health` and `/ready`. It never re-imports the destructive seed after data exists.

## 9. Finish Vercel and test

1. Vercel frontend project → **Settings** → **Environment Variables** → add Production value:

   ```text
   VITE_API_URL=https://miracle-auction-platform.lok1412.site
   ```

2. Redeploy the frontend.
3. Confirm in a private browser:

   ```text
   https://miracle-auction-platform.lok1412.site/health  -> 200
   https://miracle-auction-platform.lok1412.site/ready   -> 200
   https://auction.lok1412.site     -> login, product, bid, live update
   ```

4. On failure:

   ```bash
   sudo -u deploy docker compose --env-file /opt/online-auction/demo.env -f compose.hetzner-demo.yml logs --tail=200
   ```

## 10. Turn on GitHub auto-deploy

The `Deploy Hetzner demo` job at the end of `.github/workflows/ci.yml` deploys only a successful `push` to `main`. It checks out that exact tested commit, rebuilds the services, migrates, then checks `/health` and `/ready`.

Create a separate SSH key on Windows for GitHub Actions. At both passphrase prompts, press Enter (this restricted key is stored as a GitHub secret):

```powershell
ssh-keygen -t ed25519 -f C:\Users\<windows-user>\.ssh\github_hetzner_deploy -C "github-actions-hetzner"
```

On Windows, install only its public half for the `deploy` account:

```powershell
Get-Content C:\Users\<windows-user>\.ssh\github_hetzner_deploy.pub | ssh -i C:\Users\<windows-user>\.ssh\hetzner_auction root@<hetzner-ip> "install -d -m 700 -o deploy -g deploy /home/deploy/.ssh; cat >> /home/deploy/.ssh/authorized_keys; chown deploy:deploy /home/deploy/.ssh/authorized_keys; chmod 600 /home/deploy/.ssh/authorized_keys"
```

Create the host-key value locally:

```powershell
ssh-keyscan -H <hetzner-ip>
```

GitHub repository -> **Settings** -> **Secrets and variables** -> **Actions** -> **New repository secret**. Add:

| Secret | Value |
| --- | --- |
| `HETZNER_SSH_PRIVATE_KEY` | Full content of `github_hetzner_deploy` (private file, not `.pub`) |
| `HETZNER_SSH_HOST` | Hetzner IPv4 |
| `HETZNER_DEPLOY_USER` | `deploy` |
| `HETZNER_SSH_KNOWN_HOST` | Full output of `ssh-keyscan -H <hetzner-ip>` |

Do not add `demo.env`, database URLs, Kafka credentials, JWT keys, or Redis password to GitHub. Push this deployment configuration to `main`; the next successful CI run deploys it automatically.
