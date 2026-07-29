# Current Kafka integration

Kafka is downstream of PostgreSQL outbox projection and never participates in bid decisions or HTTP response latency.

## Routing

| Topic | Partitions | Content |
|---|---:|---|
| `bidding_events` | 2 | projected canonical auction events |
| `domain_events` | 2 | product, user, seller and order domain events |
| `dashboard_updates` | 1 | manual dashboard refresh/control and rollout backlog |
| `async_events_dlq` | 1 | terminal events with consumer/source metadata |
| `dashboard_updates_dlq` | 1 | temporary rollout compatibility topic |

This uses the current Aiven free-tier maximum of five topics and no more than two partitions per topic. Aiven describes that tier as limited-scale and without an SLA, so production suitability and limits must be reviewed at release time: [Aiven Kafka free tier](https://aiven.io/docs/products/kafka/free-tier/kafka-free-tier).

The relay claims PostgreSQL rows with `FOR UPDATE SKIP LOCKED`, leases through `available_at`, groups messages per topic and uses `acks=-1`. The Kafka key is always the aggregate ID. It sets `delivered_at` only after acknowledgement and retries network errors indefinitely with bounded exponential backoff. Invalid topic/envelope rows become terminal so later rows continue.

Dashboard consumes bidding, domain and dashboard topics. Notification consumes bidding/domain and temporarily dashboard for legacy seller events. Consumers commit offsets only after durable database work and deduplicate by `eventId`. Terminal records include source topic, partition, offset, consumer group, attempt, sanitized error and the versioned envelope.
