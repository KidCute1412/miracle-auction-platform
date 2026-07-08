---
name: event-driven-resiliency
description: Use for event-driven producers, consumers, worker jobs, notifications, and resilient side effects.
---

# Event-Driven Resiliency

## When to Apply
- Use for Kafka/RabbitMQ producer or consumer changes, worker jobs, dashboard updates, emails, notifications, and bid side effects.
- Use with `concurrency-safeguards` when bid events depend on committed transaction state.
- Use with `ci-cd-observability` for worker logs and shutdown.

## Repo Context
- Backend has `kafkajs`, `amqplib`, Kafka config, and a dashboard worker.
- Docker Compose runs Apache Kafka and a Node worker with `npm run worker`.
- RabbitMQ is not configured in Compose; Kafka is the current local broker.
- Workers must tolerate duplicate messages and process restarts.

## Implementation Checklist
- Prefer Kafka for current repo work unless a task explicitly adds RabbitMQ infrastructure.
- Produce events only after the source database transaction commits.
- Include event type, version, eventId, idempotencyKey, aggregate ID, timestamp, and safe payload.
- Store idempotency keys in PostgreSQL or Redis with a TTL/unique constraint based on event criticality.
- Make every consumer idempotent before adding retries.
- Define retry policy with max attempts, backoff, and terminal failure handling.
- Add a DLQ topic or table for messages that exceed retry limits.
- Log topic, partition, offset, consumer group, eventId, attempt, latency, and failure reason.
- Use schema versioning so consumers can handle old events during deploys.
- Keep worker shutdown graceful: stop consuming, wait for in-flight handlers, commit offsets only after success.
- Do not send email or Socket.io notifications twice for duplicate events.
- Add integration tests for duplicate message, retryable failure, terminal failure, and shutdown behavior when possible.

## Acceptance Criteria
- Duplicate delivery does not duplicate orders, emails, dashboard changes, or bid side effects.
- Failed messages retry predictably and end in DLQ after max attempts.
- Consumer offset commits happen only after successful processing.
- Worker logs let a reviewer trace one event lifecycle.
- Kafka local setup works through Docker Compose.

## Verification Commands
```powershell
docker compose up -d kafka postgres redis
cd Backend; npm run build
cd Backend; npm run worker
```

Target commands after adding worker tests:
```powershell
cd Backend; npm run test:integration -- worker
```

Kafka inspection examples:
```powershell
docker exec local-kafka-testing /opt/kafka/bin/kafka-topics.sh --bootstrap-server localhost:9092 --list
docker logs local-node-worker
```

## Anti-Patterns
- Publishing events before database commit.
- Assuming Kafka delivers each message exactly once.
- Retrying non-idempotent handlers without guards.
- Swallowing consumer errors and committing offsets anyway.
- Adding RabbitMQ docs or code without Compose/config support.

## Portfolio Signal
- The event layer shows mature distributed-systems habits: idempotency, retries, DLQ, versioned events, and observable workers.
