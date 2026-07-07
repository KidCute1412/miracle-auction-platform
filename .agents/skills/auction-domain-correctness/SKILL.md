# Auction Domain Correctness

## When to Apply
- Use for bids, products, auction timing, winner selection, orders, seller/bidder permissions, and auction close jobs.
- Always pair with `concurrency-safeguards` for bid acceptance.
- Use with `automated-testing-methodology` for domain regression tests.

## Repo Context
- Auction data lives across products, bids, users, orders, jobs, workers, and Socket.io updates.
- Product posting includes start price, step price, buy-now price, start/end time, seller, and status.
- `Backend/src/jobs/auction-end.job.ts` suggests scheduled close behavior exists or is planned.

## Implementation Checklist
- Define a single source of truth for auction status: draft, pending, active, ended, cancelled, sold, or equivalent repo values.
- Enforce bid amount greater than current price by at least step price.
- Reject bids before start time, after end time, on inactive/cancelled/deleted products, or after buy-now completion.
- Reject seller bidding on their own item.
- Reject unauthenticated users and roles that cannot bid.
- Decide and document whether the current highest bidder can bid again.
- Keep current price, price owner, and bid history consistent in one transaction.
- Ensure auction close selects exactly one winner: highest valid bid before close time.
- Create at most one order per closed auction winner.
- Make close job idempotent and safe to rerun.
- If anti-sniping exists, extend end time atomically and emit updated end time.
- Align Socket.io `new_bid` payload with committed database state.
- Add tests for all rejected bid reasons and auction close edge cases.

## Acceptance Criteria
- Bid rules are documented in code or tests and enforced by backend services.
- Seller, late, too-low, duplicate, and inactive-auction bids fail safely.
- Auction close creates zero orders when there is no valid winner and one order when there is.
- Re-running the close job does not duplicate orders or notifications.
- Frontend displays rejected bid reasons from standard API errors.

## Verification Commands
```powershell
cd Backend; npm run build
cd Frontend; npm run build
```

Target commands after adding tests:
```powershell
cd Backend; npm run test:integration -- bids
cd Backend; npm run test:integration -- auction-close
cd Backend; npm run test:concurrency
```

Manual scenario checklist:
```text
seller cannot bid own product
bid below current + step is rejected
late bid is rejected
highest bid wins after close
close job rerun does not duplicate order
```

## Anti-Patterns
- Letting frontend validation define auction rules.
- Updating bid history without updating product owner/current price.
- Creating orders from cached or pre-transaction bid state.
- Relying on cron timing alone to decide winners.
- Emitting bid events for failed or rolled-back bids.

## Portfolio Signal
- The project reads like a real auction system, with explicit business invariants and tests for money-impacting edge cases.
