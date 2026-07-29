# Current system architecture

This is a modular monolith deployed as four Node.js processes from one backend image. Module boundaries remain shared; process entrypoints isolate latency-sensitive, projection, relay and asynchronous work.

```text
Vercel -> Caddy -> API -> Oracle-local Redis authority
                              |
                         Redis Stream
                              |
                        auction-worker
                              |
                    Supabase PostgreSQL/outbox
                              |
                         outbox-relay
                              |
                          Aiven Kafka
                              |
                         async-worker
```

The API also subscribes to post-commit Redis Pub/Sub and serves Socket.IO. See [worker-process-architecture.md](worker-process-architecture.md) for lifecycle/failures, [bidding_architecture.md](bidding_architecture.md) for the hot path, and [deployment.md](deployment.md) for production operations.

No throughput number is an architectural guarantee. Performance claims require three comparable k6 artifacts plus invariant output under `PerformanceTests/artifacts/process-split/`.
