# Process split benchmark comparison

- Baseline: `36146d3`
- Target: `d98833a-dirty-614026966cba` (working-tree patch archived)
- Gate: **True**

| Scenario | Before req/s | After req/s | Change | Before p99 | After p99 | Change | Max infra error | Invariants | Gate |
|---|---:|---:|---:|---:|---:|---:|---:|---|---|
| hot | 1488.67 | 1463.6 | -1.68% | 82.89 ms | 81.11 ms | -2.14% | 0% | True | True |
| distributed | 1217.94 | 1468.67 | 20.59% | 147.01 ms | 116.77 ms | -20.57% | 0% | True | True |

Acceptance uses the median of three runs. A negative p99 change is an improvement.

The final extended suite invariant also passed: Redis/PostgreSQL sequence, version,
current price and leader matched; Stream PEL/lag and PostgreSQL outbox were zero;
dashboard and notification Kafka consumer lag were zero.
