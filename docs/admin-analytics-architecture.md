# Admin analytics architecture

The dashboard pipeline is one module inside `async-worker`; it is not a standalone runtime process.

```text
business transaction / auction projection
             |
      PostgreSQL outbox
             |
        outbox-relay
             |
  bidding_events + domain_events + dashboard_updates
             |
 async-worker dashboard consumer
             |
 versioned PostgreSQL dashboard_stats
             |
 Redis dashboard:updated:v1 (best effort)
             |
 authenticated /admin Socket.IO + polling fallback
```

The dashboard consumer deduplicates by `eventId`, processes partitions sequentially, debounces refresh work and commits Kafka offsets after receipt/snapshot persistence. Scheduled PostgreSQL refresh is the recovery path when Kafka is unavailable.

Operations exposes PostgreSQL/Redis/Kafka health, `auctionWorker`, `outboxRelay` and `asyncWorker` heartbeat ages, projection lag, outbox backlog/oldest age/terminal rows, email pending/retrying/terminal, Kafka consumer lag, DLQ totals and connected admin sockets. The legacy `workerHeartbeat` field aliases `asyncWorker` for one frontend compatibility release.

Dashboard terminal events use `async_events_dlq` with `consumer=dashboard-analytics-v1` and source topic/partition/offset metadata. `dashboard_updates_dlq` is retained only during the compatibility window.

See [worker-process-architecture.md](worker-process-architecture.md) for runtime ownership and [kafka_integration_plan.md](kafka_integration_plan.md) for topic routing.
