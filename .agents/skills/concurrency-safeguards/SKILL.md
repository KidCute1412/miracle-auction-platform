---
name: concurrency-safeguards
description: Use for bid placement, auction closing, winner selection, order creation, and guarded worker side effects.
---

# Concurrency Safeguards

## When to Apply
- Use for bid placement, auction closing, winner selection, order creation, stock-like counters, and worker consumers.
- Always pair with `auction-domain-correctness` and `automated-testing-methodology`.
- Use before adding Redis optimizations to bidding.

## Repo Context
- PostgreSQL plus Knex is the source of truth for auction state.
- Redis exists for cache, rate limiting, and optional fast-path checks.
- Kafka workers and Socket.io events can duplicate or reorder side effects if not guarded.
- Bidding code lives under `Backend/src/modules/bids`; product state is under `Backend/src/modules/products`.

## Implementation Checklist
- Put all bid acceptance decisions inside a PostgreSQL transaction.
- Lock the product or auction row with `FOR UPDATE` before reading current price, owner, status, end time, and step price.
- Re-read current auction state inside the transaction, not from cached data.
- Enforce bid amount, bid step, active auction window, bidder eligibility, and seller exclusion before insert/update.
- Update product current price and price owner in the same transaction as bid history insertion.
- Use unique constraints or idempotency keys for client retries and worker retries.
- Commit before publishing Kafka events, sending email, or emitting Socket.io notifications.
- Emit side effects from an outbox or after-commit path so failed transactions do not notify clients.
- Keep locks short; do not call Redis, Kafka, email, Cloudinary, or external APIs while holding database locks.
- Use Redis Lua only as a pre-check or rate limiter, never as the durable winner authority.
- Add deadlock retry only around safe, idempotent transaction boundaries.
- Add high-concurrency tests that use real PostgreSQL behavior.

## Acceptance Criteria
- Concurrent bids for one product produce exactly one accepted top bid per price step.
- A lower, equal, stale, seller, late, or duplicate bid is rejected without partial writes.
- Product price owner and bid history agree after concurrent submissions.
- Socket.io and Kafka notifications are emitted only for committed successful bids.
- Race-condition tests fail on the old unsafe implementation and pass after the fix.

## Verification Commands
```powershell
docker compose up -d postgres redis kafka
cd Backend; npm run build
```

Target commands after adding test scripts:
```powershell
cd Backend; npm run test:concurrency
cd Backend; npm run test:integration -- bids
```

Database inspection examples:
```sql
SELECT product_id, current_price, price_owner_id FROM products WHERE product_id = <id>;
SELECT product_id, price, price_owner_id FROM bid_history WHERE product_id = <id> ORDER BY created_at DESC;
```

## Anti-Patterns
- Treating Redis highest-bid cache as the source of truth.
- Reading product state before a transaction and trusting it inside the transaction.
- Publishing Kafka or Socket.io events before commit.
- Holding row locks while waiting on external services.
- Testing concurrency with mocks instead of PostgreSQL transactions.

## Portfolio Signal
- The project can explain and prove one of the hardest auction problems: correct bidding under concurrent load.
