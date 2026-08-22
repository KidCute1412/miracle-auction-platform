# How the Redis-authoritative auction system works

Active-auction decisions are made by Redis Lua. PostgreSQL is the durable projection and recovery checkpoint; Kafka distributes committed side effects.

The API calls `EVALSHA`, then in durable mode calls `WAIT` on the same dedicated connection before returning the Lua result. The script atomically validates state, mutates price/leader/deadline/idempotency structures and appends an event to one Redis Stream. `WAIT` confirms a replica received the write; it is not a substitute for AOF/fsync and cannot eliminate every correlated primary/replica failure.

One auction worker initializes the consumer group, reports PEL/lag and projects keyed product lanes concurrently while retaining per-product order. New auctions are initialized synchronously by their create flow. An unexpectedly missing or incomplete active-auction state fails closed for that auction on the hot path; the worker places a per-auction fence, drains the target's surviving Stream entries, and reconstructs only that auction from the verified PostgreSQL projection. Healthy auction lanes remain writable. Global fences are reserved for total Redis loss or authority integrity failures whose scope cannot be proven. Projection uses database event/sequence uniqueness and snapshot version fences. It commits history, product/order state and outbox together. Only after commit does it publish the typed Socket payload, acknowledge the Redis entry and delete that acknowledged entry.

Socket Pub/Sub is best-effort. The API uses a subscriber connection separate from command traffic. A reconnecting browser refetches and discards stale sequence/version events.

Kafka receives events only through the outbox relay. A Kafka outage grows the PostgreSQL backlog without making API readiness fail. Dashboard and notification consumers are idempotent. SMTP is further decoupled through `email_deliveries`.

Sentinel mode is optional. `compose.local-ha.yml` runs one primary, two replicas and three Sentinels; ioredis discovers the current primary and reconnects after promotion. The normal local profile stays one primary plus one replica. Production only gains failover when its deployment actually supplies replicas and three reachable Sentinels; setting the client variables cannot create HA by itself.

On total Redis loss, bidding is temporarily unavailable but recovery is automatic. A PostgreSQL lease and monotonically increasing recovery epoch ensure only one worker rebuilds authority. The persistent global Redis fence blocks Lua mutations, surviving Stream work is drained first, interrupted auctions are extended by the measured outage plus `AUCTION_RECOVERY_GRACE_SECONDS`, active snapshots and recent successful idempotency records are rebuilt, and every auction is reconciled before the fence is removed. Partial recovery uses auction-scoped fences and keeps `/ready` available for healthy auctions; global recovery keeps `/ready` at 503. Recovery runs and deadline extensions are idempotent and audited in PostgreSQL. PostgreSQL is therefore a catastrophic recovery checkpoint, never a synchronous fallback on the bid request path.

See [worker-processes.md](worker-processes.md) for process ownership and [deployment](../operations/deployment.md) for AOF backup/restore.
