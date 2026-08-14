# Performance resource profile

The optional `compose.production.performance.yml` prioritizes the synchronous bid path on a six-CPU host while dashboard and notification consumers remain enabled. It does not relax Redis replica acknowledgement, AOF, projection, outbox, or Kafka convergence.

Run it explicitly with the base production topology:

```powershell
docker compose -f compose.production.yml -f compose.production.performance.yml up -d
```

Default limits total 4.65 CPU for the Node/Redis services. PostgreSQL and Kafka remain governed by the host and their existing memory limits. Set the `*_CPU_LIMIT` variables for the available host capacity; do not use this profile unchanged on a smaller host.

The benchmark Compose topology uses a matching six-CPU budget, including PostgreSQL and Kafka, so full distributed runs measure the same API/projector priority without disabling downstream workers.
