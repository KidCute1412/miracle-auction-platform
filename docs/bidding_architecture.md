# Bidding Architecture

## Authority and data flow

Redis Lua is the single writer for every active-auction mutation. PostgreSQL is the durable projection and query store. Kafka carries side effects only after the PostgreSQL projection transaction commits; it never decides a bid.

```text
API
  -> Redis Lua: validate + mutate + XADD atomically
  -> Redis Stream projector
  -> PostgreSQL projection + transactional outbox
  -> Kafka
  -> notifications, email, analytics, and Socket.IO
```

If Redis is unavailable, a bidding mutation returns `503 SERVICE_UNAVAILABLE`. It must never fall back to a PostgreSQL write because that would create a second authority and an ordering split.

`BID_ENGINE` controls rollout:

- `postgres`: existing PostgreSQL implementation and local benchmark baseline.
- `redis`: Redis Lua authority and asynchronous PostgreSQL projection.
- `shadow`: PostgreSQL remains authoritative while the Redis reference decision is recorded and compared without mutating Redis auction state.

## Contracts and authoritative Redis state

All VND amounts are non-negative `BIGINT` values. JSON APIs and event payloads represent them as base-10 decimal strings, never JavaScript numbers or floating point values.

An auction has one explicit status: `PENDING`, `ACTIVE`, `SOLD`, `ENDED`, or `CANCELLED`. Each successful mutation increments a monotonic auction `version` and `sequence`. History transitions and processed events retain both values.

Redis stores only the state needed by the bounded state machine:

- auction status, seller, start/end deadlines, pricing, leader, version, and sequence;
- bidder maxima and deterministic ranking;
- the auction ban set;
- idempotency fingerprints and original results;
- bounded per-bidder rate-limit state;
- deadline indexes used by the close scheduler;
- immutable mutation result Streams.

Bid, buy-now, bidder ban, anti-sniping extension, close, and cancel must all pass through Redis Lua. No application code, cron job, or PostgreSQL function may independently perform these transitions.

Each request supplies a client idempotency key. The stored fingerprint covers the operation, auction, actor, and request values:

- the same key and fingerprint returns the original result;
- the same key with a different fingerprint is rejected;
- a new key can produce at most one state transition and one Stream event.

Lua validates all input and stored state before its first write. Its mutation phase is bounded and atomically updates state, ranking, deadlines, the idempotent result, and `XADD`s exactly one result event. Business rejections are returned directly and do not use a separate result Stream.

Buy-now and close reserve or return a public order UUID. The projector creates exactly one order for that UUID and auction. Winner checkout only updates that projector-created order; it never creates another order or accepts a client-supplied winner or price.

## PostgreSQL projection and side effects

The Stream projector uses a consumer group and applies one event in one PostgreSQL transaction:

1. Insert the event ID into `auction_processed_events`; its unique key makes redelivery a no-op.
2. Fence the event using `(auction_id, sequence)` and the stored projection version.
3. Insert the immutable auction transition and any bid-history row.
4. Update the auction snapshot only when the incoming version is newer.
5. Create the unique public order for buy-now or a closed auction with a winner.
6. Insert transactional outbox records.
7. Commit PostgreSQL.
8. Emit committed Socket.IO data and `XACK` the Stream entry.

Kafka dispatch reads only committed outbox rows. Kafka or Socket.IO failure never rolls back an accepted auction transition; the outbox remains retryable.

The projector reclaims abandoned pending entries with `XAUTOCLAIM`. Retry counts are bounded. Terminal schema or invariant failures are copied to a dead-letter Stream with the original entry and error before acknowledgement. It does not acknowledge normal work before commit.

A reconciliation job compares Redis version/sequence with the PostgreSQL checkpoint. It replays retained Stream entries for a lagging projection, reports gaps or divergence, and never invents a transition. Stream trimming is permitted only behind the durable projection checkpoint and reconciliation window.

## Deployment contract

Local development and benchmark runs use one Redis container with AOF enabled and one PostgreSQL container. Production uses one managed regional Redis database endpoint. Application code receives a single `REDIS_URL`; topology and recovery are provider concerns rather than application deployment instructions.

The close scheduler reads due auction IDs from the Redis deadline index and invokes the close mutation. A retry is idempotent. An auction with no leader ends without an order; an auction with a leader produces exactly one public order UUID.

## Correctness and local benchmark

Correctness gates cover:

- unit and property tests for proxy bidding and the Lua reference model;
- real Redis/PostgreSQL integration tests for every mutation;
- concurrent bids, retries, duplicates, projector crash/redelivery, PostgreSQL outage, Kafka outage, and a local Redis AOF restart;
- zero duplicate orders, event IDs, or auction sequences;
- monotonic versions, consistent winner/current price, and eventual projection convergence.

The k6 suite contains smoke, one hot auction, distributed auctions, spike, and soak scenarios. It runs `BID_ENGINE=postgres` and `BID_ENGINE=redis` against the same deterministic seed, service configuration, dataset, and local machine. Each run exports raw JSON plus a Markdown report with machine and container configuration.

The Redis engine passes only when:

- invariant violations are zero;
- system errors are below 1%;
- PostgreSQL projection converges after load; and
- throughput is at least 2x the PostgreSQL baseline **or** p99 latency is at least 50% lower.

One hot auction remains sequential inside Redis. Performance claims are valid only for the measured workload when both the correctness gates and benchmark threshold pass.
