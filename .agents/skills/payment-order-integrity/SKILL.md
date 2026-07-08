---
name: payment-order-integrity
description: Use for auction winner checkout, order creation, payment state, one-order-per-auction rules, cancellation, refunds, fulfillment, and buyer/seller/admin order permissions.
---

# Payment and Order Integrity

## When to Apply
- Use for order creation, checkout, payment status, refunds, cancellation, fulfillment, winner-only purchase flows, and order permissions.
- Use with `auction-domain-correctness` when orders depend on auction close or buy-now behavior.
- Use with `concurrency-safeguards` when duplicate close jobs, retries, or payment callbacks can create duplicate side effects.
- Use with `enterprise-api-standards` when changing order or payment API contracts.

## Repo Context
- Backend has an orders module under `Backend/src/modules/orders`.
- Client routes mount orders behind `verifyToken`.
- Auction close email behavior exists under products/jobs; order creation must not rely only on email notification success.
- No external payment provider should be assumed unless the code or task explicitly adds one.

## Implementation Checklist
- Define explicit order states, for example pending_payment, paid, cancelled, expired, fulfilled, refunded, or repo-equivalent values.
- Define explicit payment states separately from order states when payment exists.
- Create at most one order for each winning auction or buy-now completion.
- Use a unique constraint or idempotency key for winner order creation.
- Allow checkout only for the winning bidder or valid buy-now buyer.
- Reject checkout for seller, non-winner, unauthenticated user, cancelled product, expired auction without winner, or already-owned order.
- Keep auction winner, order row, payment row, and product status consistent in one transaction where possible.
- Make payment callbacks idempotent and verify provider signatures before changing state.
- Never trust frontend total price, winner ID, seller ID, or product ownership fields.
- Guard cancellation, refund, fulfillment, and delivery transitions by role and current state.
- Emit emails, Socket.io events, Kafka events, and dashboard updates only after committed order/payment state.
- Add tests for duplicate checkout, duplicate callbacks, non-winner checkout, cancelled auction, expired payment, and seller/admin actions.

## Acceptance Criteria
- Winner selection and order creation cannot diverge.
- Re-running an auction close job or retrying checkout does not duplicate orders.
- Payment callbacks cannot mark the wrong order as paid.
- Buyers, sellers, and admins can only perform allowed state transitions.
- Failed side effects do not roll back already committed durable order state unless explicitly designed.

## Verification Commands
```powershell
docker compose up -d postgres redis kafka
cd Backend; npm run build
cd Frontend; npm run build
```

Target commands after adding tests:
```powershell
cd Backend; npm run test:integration -- orders
cd Backend; npm run test:integration -- payments
cd Backend; npm run test:concurrency -- orders
```

Manual scenario checklist:
```text
winner can open or create order
non-winner cannot checkout
seller cannot checkout own auction
auction close rerun does not duplicate order
payment callback retry is idempotent
cancelled or expired order cannot be paid
```

## Anti-Patterns
- Creating orders from frontend-submitted winner or price fields.
- Treating email success as proof that an order was created.
- Updating payment state without checking current order state.
- Allowing payment callbacks without signature verification.
- Mixing auction status, order status, and payment status into one ambiguous field.

## Portfolio Signal
- The project shows end-to-end marketplace correctness: bidding, winner selection, checkout, payment state, and fulfillment stay consistent under retries and failures.
