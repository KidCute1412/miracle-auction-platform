#!/usr/bin/env bash
set -euo pipefail

repo_dir="/opt/online-auction/repo"
env_file="/opt/online-auction/demo.env"
compose_file="compose.hetzner-demo.yml"

cd "$repo_dir"

if [[ -n "${DEPLOY_COMMIT:-}" ]]; then
  git fetch --prune origin
  git checkout --detach "$DEPLOY_COMMIT"
else
  git fetch --prune origin
  git checkout main
  git pull --ff-only origin main
fi

compose=(docker compose --env-file "$env_file" -f "$compose_file")

"${compose[@]}" config -q
"${compose[@]}" build
"${compose[@]}" run --rm migrate

# These files are the same catalog data that start.bat imports locally.
# Import only into a newly initialized demo database: the SQL files TRUNCATE
# tables and must never overwrite a database that already has demo activity.
if "${compose[@]}" run --rm --no-deps api node --input-type=module -e '
  import { PrismaClient } from "@prisma/client";
  const prisma = new PrismaClient();
  const count = await prisma.categories.count();
  await prisma.$disconnect();
  console.log(`categories=${count}`);
  process.exit(count === 0 ? 0 : 1);
'; then
  echo "Empty database detected; importing local demo catalog."
  "${compose[@]}" stop api auction-worker outbox-relay async-worker || true
  "${compose[@]}" run --rm -v "$repo_dir/data:/seed:ro" migrate \
    npx prisma db execute --schema prisma/schema.prisma --file /seed/category/category.insert.sql
  "${compose[@]}" run --rm -v "$repo_dir/data:/seed:ro" migrate \
    npx prisma db execute --schema prisma/schema.prisma --file /seed/user/user.insert.sql
  "${compose[@]}" run --rm -v "$repo_dir/data:/seed:ro" migrate \
    npx prisma db execute --schema prisma/schema.prisma --file /seed/product/tikiAPI/product.insert.sql
else
  echo "Demo database already contains categories; seed import skipped."
fi

"${compose[@]}" up -d --remove-orphans

for attempt in {1..12}; do
  if "${compose[@]}" exec -T api wget -q -O - http://localhost:5000/health >/dev/null && \
     "${compose[@]}" exec -T api wget -q -O - http://localhost:5000/ready >/dev/null; then
    echo "Deployment completed successfully."
    exit 0
  fi
  sleep 5
done

echo "Services started but readiness did not become healthy in 60 seconds." >&2
"${compose[@]}" logs --tail=200 >&2
exit 1
