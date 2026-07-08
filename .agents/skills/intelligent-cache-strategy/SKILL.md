---
name: intelligent-cache-strategy
description: Use for Redis caching, rate limiting, hot reads, bid throttling, and cache invalidation.
---

# Intelligent Cache Strategy

## When to Apply
- Use for Redis caching, rate limiting, hot auction reads, product detail reads, bid throttling, and cache invalidation.
- Use with `concurrency-safeguards` for bidding so cache never replaces database truth.
- Use with `systematic-load-testing` to verify performance changes.

## Repo Context
- Backend uses `ioredis` and Redis-backed rate-limit packages.
- Docker Compose runs Redis 7.
- Products, bids, categories, dashboard, and account flows are candidates for caching or rate limiting.
- Socket.io pushes bid updates; cache invalidation must match those updates.

## Implementation Checklist
- Use cache-aside for product details, product lists, categories, and dashboard summaries.
- Define key names with version, entity, ID, filters, and pagination to avoid collisions.
- Set explicit TTLs by data volatility: shorter for active auctions, longer for categories/static settings.
- Invalidate product detail, active list, category list, seller list, dashboard, and search keys after successful product or bid writes.
- Never accept or reject bids from cached highest price alone.
- Use Redis for bid submission rate limiting, login/OTP throttling, and abuse controls.
- Prefer atomic Redis operations or Lua only for rate limits and optional pre-checks.
- Add cache metrics or structured logs for hit, miss, set, invalidate, and Redis failure.
- Make cache failures degrade to PostgreSQL reads when possible.
- Avoid caching user-private data unless keys include user scope and TTL is short.
- Document cache invalidation in the service that performs the write.

## Acceptance Criteria
- Cached endpoints return the same envelope and data as uncached database reads.
- Writes invalidate every affected key before clients can observe stale product or bid state.
- Redis outage does not break critical product reads or bid acceptance.
- Rate limiting blocks abuse without blocking normal bid and login flows.
- Load tests or metrics show measurable read-path improvement when cache is enabled.

## Verification Commands
```powershell
docker compose up -d redis postgres
cd Backend; npm run build
docker exec local-redis-testing redis-cli ping
```

Target commands after adding tests:
```powershell
cd Backend; npm run test:integration -- cache
cd Backend; npm run test:integration -- rate-limit
```

Redis inspection examples:
```powershell
docker exec local-redis-testing redis-cli keys "auction:*"
docker exec local-redis-testing redis-cli ttl "auction:product:<id>"
```

## Anti-Patterns
- Using Redis cache as the authoritative bid state.
- Missing invalidation after product status, bid, order, or admin moderation changes.
- Infinite TTL for volatile auction data.
- Caching authenticated user data under shared keys.
- Letting Redis errors fail all reads when the database is healthy.

## Portfolio Signal
- Caching is presented as controlled infrastructure: clear TTLs, invalidation, graceful degradation, and measured impact.
