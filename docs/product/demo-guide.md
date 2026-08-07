# Five-minute portfolio demo

This walkthrough demonstrates the product, its most important correctness property, and its operational evidence using local synthetic data.

## Before the demo

1. Copy the backend and frontend `.env.example` files to `.env`.
2. Set `VITE_API_URL=http://localhost:5000` in `Frontend/.env`.
3. Run `start.bat` from the repository root.
4. Confirm:

   ```powershell
   Invoke-RestMethod http://localhost:5000/health
   Invoke-RestMethod http://localhost:5000/ready
   docker compose ps
   ```

5. Open `http://localhost:5173`.
6. Select an auction whose current time is inside its start/end window. Seed dates are fixed, so do not hard-code a product ID in a recording.

Role examples in the local seed:

| Role | Email | Purpose |
|---|---|---|
| Administrator | `ule@example.org` | Administration dashboard |
| Seller | `jane47@example.net` | Seller products and order view |
| Bidder | `john27@example.com` | Bidding and winner flow |

The seed stores hashes, not an explicitly documented plaintext password. Set known local-only passwords through the supported reset/test setup before recording. Never publish real credentials.

## 0:00–0:45 — Product experience

- Show the landing page, product discovery, search, and categories.
- Open one active product.
- Point out current price, minimum next bid, countdown, seller context, bid history, and live status.

Narrative: “This is a complete product workflow, but the engineering focus is safe concurrent bidding.”

## 0:45–2:15 — Live bid

- Use two browser profiles signed in as different bidders.
- Join the same active product.
- Submit a valid bid in the first profile.
- Show the second profile receiving the post-commit Socket.IO update.
- Attempt a stale or below-step bid and show the rejection.
- Refresh both clients to demonstrate convergence.

Narrative: “Redis atomically decides the auction and appends an ordered event. PostgreSQL commits before the socket event. Reconnecting clients refetch because Pub/Sub is best-effort.”

## 2:15–3:15 — Reliability path

Open [the architecture diagram](../architecture/system-overview.md) and follow:

1. API → Redis Lua mutation
2. Redis Stream → single `auction-worker`
3. PostgreSQL projection + outbox transaction
4. `outbox-relay` → Kafka
5. `async-worker` → dashboard and durable email delivery

State the guarantees precisely:

- Redis is authoritative for active-auction decisions.
- PostgreSQL is the durable, eventually convergent projection.
- Delivery is at least once with idempotent effects.
- One projector is intentional until partitioned ordering is proven.

## 3:15–4:00 — Winner and administration

- Show `/winner-order` for winner fulfillment when the dataset has a completed auction.
- Show `/seller-order` for the seller view.
- Open `/admin/dashboard` and show operational totals and management views.

If the seed has no completed auction, use a deterministic test fixture instead of manually editing production-like data.

## 4:00–5:00 — Evidence

- Show the GitHub Actions backend, frontend, AgentService, Compose, and image gates.
- Open [engineering evidence](../testing/engineering-evidence.md).
- Show the preserved three-run k6 comparison and invariant output.
- Explicitly state that its optimized revision was dirty and is not a clean-release benchmark.
- Close with the [roadmap](../planning/roadmap.md).

## Screenshot and GIF checklist

Current real application captures:

- [Storefront](assets/storefront.webp)
- [Active product](assets/product-bidding.webp)

Additional captures to refresh for a full recorded presentation:

| File | Required content |
|---|---|
| `storefront.webp` | Landing/product discovery at desktop width |
| `product-bidding.webp` | Active product, countdown, bid control, and history |
| `live-bid.gif` | Two-client accepted bid and Socket.IO update |
| `winner-order.webp` | Winner completion flow |
| `admin-dashboard.webp` | Operational admin dashboard |

Use synthetic data, hide secrets and personal information, capture the current application rather than mockups, and refresh assets after material UI changes.
