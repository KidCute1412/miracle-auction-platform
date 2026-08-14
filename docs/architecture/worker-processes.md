# Four-process worker architecture

> Status: Current | Owner: Backend/Platform | Last verified: 2026-08-07

This is the canonical runtime architecture. Documents labelled historical or superseded are not deployment instructions.

## Topology and authority

```text
Vercel frontend
      |
    Caddy
      |
 API process ── Redis Pub/Sub subscriber ── Socket.IO
      |
      | Redis EVALSHA (the synchronous bid path ends here)
      v
 Oracle-local Redis 7 authority (AOF, noeviction)
      |
      | Redis Stream
      v
 auction-worker ── PostgreSQL projection + transactional outbox
                         |
                    outbox-relay
                         |
                    Aiven Kafka
                    /          \
          dashboard consumer   notification intake
                    \          /
                      async-worker
                           |
                   durable email_deliveries
                           |
                      SMTP loop
```

Supabase PostgreSQL is the durable projection and business store. Redis is authoritative for active-auction mutation decisions. Kafka, PostgreSQL projection, Socket.IO, dashboard refresh and SMTP never participate in bid HTTP latency.

## Process ownership

| Process | Owns | Must not own |
|---|---|---|
| `api` | HTTP, auth/security email, Socket.IO, Redis Lua mutations, bootstrap of a newly created auction | Projector, close scheduler, Kafka producer, outbox relay, auction email cron |
| `auction-worker` | Stream group initialization, missing-state bootstrap, single keyed-concurrent projector, PEL reclaim, close scheduler, reconciliation heartbeat | Kafka consumption, SMTP |
| `outbox-relay` | PostgreSQL outbox lease and Kafka batch publication | Socket.IO, SMTP, auction decisions |
| `async-worker` | Dashboard consumer/recovery, notification intake, durable email delivery/recovery | Auction close scheduling, bid decisions |

Only one `auction-worker` replica is supported. Inside it, product lanes are parallel but events for one product remain sequential. Horizontal workers still require explicit sharding/rebalance correctness.

## Lifecycle

`auction-worker` checks PostgreSQL and Redis, creates the consumer group once, reports PEL/lag, bootstraps only missing Redis hashes, then starts projection, close scheduling and heartbeat. Shutdown stops the scheduler and new reads, waits for the current projection batch, closes the blocking Redis connection, then disconnects Prisma/Redis.

`outbox-relay` claims pending non-terminal rows with `FOR UPDATE SKIP LOCKED`. `available_at` is the lease/retry timestamp. Rows are grouped by topic and published with `acks=-1`; `delivered_at` is set only after acknowledgement. A crash between Kafka acknowledgement and `delivered_at` can duplicate an event, so consumers use `eventId` receipts.

`async-worker` runs independent dashboard, notification and delivery modules. Notification intake resolves recipients and inserts deliveries before committing the Kafka offset. SMTP delivery is at-least-once, uses a stable RFC `Message-ID`, a durable lease and a unique `(source_event_id, recipient_key, template_key)` constraint.

## Event contracts and topics

| Topic | Producer | Consumers |
|---|---|---|
| `bidding_events` | auction projection outbox | dashboard, notification |
| `domain_events` | transactional domain writes | dashboard, notification |
| `dashboard_updates` | manual refresh/control, plus legacy seller backlog during rollout | dashboard; notification temporarily |
| `async_events_dlq` | terminal consumer/email records through outbox | operations tooling |
| `dashboard_updates_dlq` | compatibility only | legacy inspection; remove after drain |

Canonical auction events are `bid.accepted.v1`, `auction.buy_now_completed.v1`, `auction.closed.v1`, `auction.cancelled.v1` and `bidder.banned.v1`. Domain email events are `product.question_created.v1`, `product.question_answered.v1`, `product.description_changed.v1`, `seller.approved.v1` and `seller.rejected.v1`. Producers emit only canonical names; consumer normalization accepts legacy auction aliases for one compatibility window.

Every envelope contains `eventId`, `eventType`, `eventVersion`, `aggregateId`, `occurredAt`, `correlationId`, optional `causationId`, and `payload`. Kafka keys are aggregate/product IDs. Money is a decimal string.

## Failure matrix

| Failure | Expected behavior |
|---|---|
| PostgreSQL unavailable during bid | Redis may accept the authoritative mutation; Stream retains it and API response is unaffected |
| PostgreSQL unavailable during projection | Entry remains pending and is not acknowledged |
| Redis unavailable | Bid mutation returns service unavailable; PostgreSQL is never used as a hidden bid fallback |
| Redis Pub/Sub publish fails after projection | Transaction remains committed and Stream entry is acknowledged; clients refetch on reconnect |
| Kafka unavailable | API remains ready; outbox rows retry with bounded exponential backoff |
| Kafka duplicate | receipt/unique constraints prevent duplicate dashboard/email effects |
| SMTP unavailable | delivery rows retry after 30s, 2m, 10m, 30m and 2h; attempt five becomes terminal and writes an async DLQ event |
| Worker restart | leases expire, PEL is reclaimed, and scheduled recovery finds legacy ended auctions not yet enqueued |

## Health and operations

`/health` is API liveness. `/ready` requires PostgreSQL, Redis primary/replica durability readiness and a fresh `auction:worker:heartbeat`. Kafka is reported but does not determine readiness. Operations reports three worker heartbeats, projection lag, pending/retrying/terminal outbox counts and oldest age, email queue states, Kafka consumer lag and DLQ totals.

Redis keys:

- `auction:worker:heartbeat`
- `auction:worker:projection-lag`
- `outbox:relay:heartbeat`
- `async:worker:heartbeat`
- `auction:committed:v1` (Pub/Sub)

## Environment by process

All processes need `DATABASE_URL`/`DIRECT_URL`; API, auction worker and async worker use `REDIS_URL`. Outbox relay uses Redis only for best-effort heartbeat.

- Auction: `BID_ENGINE`, `BID_PROJECTOR_GROUP`, `BID_PROJECTOR_MAX_ATTEMPTS`, `BID_PROJECTOR_RECLAIM_INTERVAL_MS`, `AUCTION_CLOSE_INTERVAL_MS`, `AUCTION_WORKER_HEARTBEAT_TTL_SECONDS`.
- Relay: Kafka connection variables, `OUTBOX_BATCH_SIZE`, `OUTBOX_IDLE_POLL_MS`, `OUTBOX_MAX_BACKOFF_MS`, `OUTBOX_RELAY_HEARTBEAT_TTL_SECONDS`.
- Async: Kafka connection variables, `DASHBOARD_KAFKA_GROUP_ID`, `NOTIFICATION_KAFKA_GROUP_ID`, `DASHBOARD_BATCH_CONCURRENCY`, `NOTIFICATION_BATCH_CONCURRENCY`, `EMAIL_DELIVERY_MODE`, `EMAIL_DELIVERY_CONCURRENCY`, `EMAIL_DELIVERY_MAX_ATTEMPTS`, `EMAIL_DELIVERY_LEASE_MS`, `ASYNC_WORKER_HEARTBEAT_TTL_SECONDS`. Kafka offsets are committed once a whole batch has completed durable receipt/enqueue work; dashboard refreshes are coalesced per batch.
- Topics: `KAFKA_BIDDING_TOPIC`, `KAFKA_DOMAIN_TOPIC`, `KAFKA_DASHBOARD_TOPIC`, `KAFKA_ASYNC_DLQ_TOPIC`, and temporary `KAFKA_DASHBOARD_DLQ_TOPIC`.

## Rollout and rollback

Apply the additive migration first. Create all new topics while retaining the legacy DLQ. Stop the embedded/old projector and email cron before starting the new single auction worker. Wait for bootstrap heartbeat, then start relay and async worker, then API. Never run old and new projectors together.

Rollback stops `auction-worker`, `outbox-relay` and `async-worker` before starting the old API/worker. Do not drop the new tables/columns; they are additive and preserve legacy `auction_end_email_sent`.

Current external limits must be verified before each release. Aiven documents up to five topics with two partitions each on its free tier, and says the tier is limited-scale without an SLA: [Aiven Kafka free tier](https://aiven.io/docs/products/kafka/free-tier/kafka-free-tier). Oracle documents a conservative post-trial Always Free total of 2 OCPUs and 12 GB across Ampere A1 instances: [OCI Free Tier](https://docs.oracle.com/en-us/iaas/Content/FreeTier/freetier.htm).
