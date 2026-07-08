---
name: database-integrity-migrations
description: Use for schema changes, indexes, constraints, seed data, query optimization, and Knex model changes.
---

# Database Integrity & Migrations

## When to Apply
- Use for schema changes, indexes, constraints, seed data, query optimization, and Knex model changes.
- Use with `concurrency-safeguards` for auction state tables.
- Use with `systematic-load-testing` for performance-sensitive query paths.

## Repo Context
- Backend uses Knex and PostgreSQL.
- Docker Compose initializes PostgreSQL from SQL files under `data/`.
- The repo currently has SQL seed/init files but no obvious committed Knex migration folder.
- Supabase-compatible PostgreSQL conventions are acceptable if deployed there later.

## Implementation Checklist
- Prefer versioned Knex migrations for new schema changes.
- If maintaining SQL init files, document how they map to migrations and local reset behavior.
- Every migration must have reversible `up` and `down` operations unless explicitly impossible and documented.
- Add database constraints for invariants that must never be bypassed by app code.
- Add foreign keys for relationships such as users, products, bids, orders, categories, and ratings.
- Add check constraints for non-negative prices, positive bid steps, valid time ranges, and bounded status values.
- Add unique constraints for idempotency keys, email/account identifiers, and one-order-per-winning-bid where applicable.
- Add indexes for common filters, joins, and sorts: product status/end time, seller ID, category ID, bid product ID, order user ID.
- Use partial indexes for active auctions or soft-deleted rows when useful.
- Review raw SQL interpolation and replace unsafe dynamic values with Knex bindings.
- Capture `EXPLAIN` or `EXPLAIN ANALYZE` notes for changed performance-sensitive queries.
- Keep seed data deterministic and safe to re-run in local development.

## Acceptance Criteria
- Schema changes are reproducible from a clean local database.
- Rollback behavior is defined and tested for every migration.
- App-level auction rules are backed by database constraints where feasible.
- New indexes have a named query reason, not speculative coverage.
- Performance-sensitive changes include before/after query notes or a clear rationale.

## Verification Commands
```powershell
docker compose up -d postgres
cd Backend; npm run build
```

Target commands after adding migration scripts:
```powershell
cd Backend; npm run migrate:latest
cd Backend; npm run migrate:rollback
cd Backend; npm run seed:test
```

SQL examples:
```sql
EXPLAIN ANALYZE SELECT * FROM products WHERE status = 'active' ORDER BY end_time LIMIT 20;
\d products
\d bid_history
```

## Anti-Patterns
- Editing production schema manually with no migration.
- Relying only on TypeScript or Joi for durable data integrity.
- Adding indexes without checking query shape.
- Building SQL strings from user-controlled sort, filter, or search values.
- Making destructive migrations irreversible without a documented fallback.

## Portfolio Signal
- The database shows production judgment: constraints for correctness, migrations for repeatability, and indexes tied to measured query paths.
