# How the Redis-authoritative auction system works

Active-auction decisions are made by Redis Lua. PostgreSQL is the durable projection and recovery checkpoint; Kafka distributes committed side effects.

The API calls `EVALSHA`, then in durable mode calls `WAIT` on the same dedicated connection before returning the Lua result. The script atomically validates state, mutates price/leader/deadline/idempotency structures and appends an event to one Redis Stream. `WAIT` confirms a replica received the write; it is not a substitute for AOF/fsync and cannot eliminate every correlated primary/replica failure.

One auction worker initializes the consumer group, reports PEL/lag, bootstraps only missing auctions and projects keyed product lanes concurrently while retaining per-product order. Projection uses database event/sequence uniqueness and snapshot version fences. It commits history, product/order state and outbox together. Only after commit does it publish the typed Socket payload and acknowledge Redis.

Socket Pub/Sub is best-effort. The API uses a subscriber connection separate from command traffic. A reconnecting browser refetches and discards stale sequence/version events.

Kafka receives events only through the outbox relay. A Kafka outage grows the PostgreSQL backlog without making API readiness fail. Dashboard and notification consumers are idempotent. SMTP is further decoupled through `email_deliveries`.

On Redis loss, bidding is unavailable; there is no PostgreSQL fallback that could split authority. Recovery keeps bidding in maintenance, starts from a verified PostgreSQL projection checkpoint, bootstraps Redis, drains/reconciles the Stream, verifies winner/price/sequence/version, and only then reopens traffic.

See [worker-processes.md](worker-processes.md) for process ownership and [deployment](../operations/deployment.md) for AOF backup/restore.
