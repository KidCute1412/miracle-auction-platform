# Admin analytics benchmark evidence

No performance number is claimed until a dated k6 JSON summary is committed here.

Run:

```powershell
k6 run --summary-export PerformanceTests/artifacts/dashboard-snapshot-summary.json PerformanceTests/dashboard_snapshot.js
```

Record alongside the JSON:

- date and git commit;
- CPU, memory and operating system;
- PostgreSQL row counts for orders, products and bids;
- Redis/Kafka/worker state;
- `DASHBOARD_DEBOUNCE_MS` and recovery interval;
- snapshot endpoint p50/p95, aggregation duration, and observed event-to-version freshness.

This prevents CV or portfolio claims from being stronger than the reproducible evidence.
