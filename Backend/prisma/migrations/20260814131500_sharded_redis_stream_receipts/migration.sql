-- A Redis Stream ID is unique only within one Redis instance. Benchmark
-- sharding persists `shard:<index>:<stream-id>` to avoid cross-shard receipt
-- collisions while retaining the global idempotency constraint.
ALTER TABLE auction_processed_events
  ALTER COLUMN redis_entry_id TYPE varchar(80);
