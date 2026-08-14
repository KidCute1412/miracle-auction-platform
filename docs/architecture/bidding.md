# Redis-authoritative bidding architecture

> Status: Current | Owner: Backend | Last verified: 2026-08-10

The canonical process ownership and failure matrix are in [worker-processes.md](worker-processes.md).

## Synchronous hot path

```text
k6/browser -> JWT + auth snapshot -> Redis EVALSHA/XADD -> WAIT replica ACK -> HTTP response
```

Redis Lua validates auction status/window, seller and ban rules, bid step, proxy maxima, idempotency, anti-sniping and buy-now/close transitions atomically. It updates the authoritative state and appends one ordered Stream event. In durable mode the API then executes `WAIT 1 100` on that same mutation connection. A missing acknowledgement returns `503 BID_DURABILITY_UNCONFIRMED`; retrying the same `Idempotency-Key` replays the same mutation and attempts acknowledgement again.

JWT authorization reads `auth:v1:user:{id}` (`role`, `status`, `authVersion`, TTL 30 seconds) from a dedicated Redis connection. Misses and Redis failures fall back to a minimal PostgreSQL query. Password, role, and status changes increment `auth_version` and write through with a Lua version fence. `/profiles/me` loads the full profile explicitly.

New auctions are bootstrapped synchronously after their PostgreSQL create so they can accept a bid immediately. The auction worker startup also scans active/pending rows and bootstraps only missing Redis keys under a per-auction lock; existing authority is never overwritten.

## Projection and ordering

A single `auction-worker` owns the global Stream consumer group. It reads up to 200 entries, groups them by product, preserves sequence within each product lane, and processes independent lanes with bounded concurrency (default 8). Each healthy lane prefetches its product/processed sequences once, validates a rolling fence, bulk-inserts transitions, history, receipts and outbox, then updates the product from the final event in one transaction. A failed lane falls back to isolated entry handling so retry/DLQ attribution remains precise. `XAUTOCLAIM` runs on a cadence. Shutdown waits for all active lanes.

The PostgreSQL transaction enforces unique `event_id` and `(product_id, sequence)`, version/sequence fences, one order per product, history/state updates and a canonical outbox insert. PostgreSQL commit happens before best-effort Redis Pub/Sub and before `XACK`. A database failure leaves the entry pending.

## Live updates

After a successful projection commit, the projector publishes typed `BidSocketEvent` on `auction:committed:v1`. The API owns a dedicated Redis subscriber and emits `new_bid` to the product room. Pub/Sub failure cannot roll back projection or block acknowledgement.

The frontend has one listener in `useSocketBidding`. It rejects older/equal sequence/version pairs, cleans listeners on navigation/unmount and refetches after reconnect because Pub/Sub is intentionally best-effort.

## Closure and recovery

The close scheduler reads Redis's deadline sorted set and invokes the same Lua `CLOSE` transition; Kafka is not a scheduler. Close/buy-now creates at most one order during projection. PEL reclaim, idempotent projection, outbox event IDs and reconciliation make restarts safe.

Do not run multiple auction-worker replicas until ordering is partitioned by aggregate and proven by concurrency tests.
