# Backend Logging and Diagnostics

The API and named worker processes emit compact, newline-delimited JSON through Pino. Logs go to standard output or standard error so Docker or a future collector can handle storage without changing application code.

## Configuration

Set `LOG_LEVEL` to `debug`, `info`, `warn`, `error`, or `silent`. The default is `info`; tests default to `silent`.

Every record includes a timestamp, numeric level, service name, component, and message. Records add identifiers when available:

| Field                                           | Meaning                                                                        |
| ----------------------------------------------- | ------------------------------------------------------------------------------ |
| `requestId`                                     | UUID accepted or generated at the HTTP boundary and returned in `X-Request-ID` |
| `correlationId`                                 | Identifier shared by the originating request and downstream event chain        |
| `eventId` / `causationId`                       | Current event and the event that caused it                                     |
| `jobId`                                         | Scheduled execution, Redis Stream entry, outbox row, or email delivery         |
| `productId`                                     | Auction aggregate                                                              |
| `topic`, `partition`, `offset`, `consumerGroup` | Kafka message location and consumer                                            |
| `attempt`                                       | Retry or delivery attempt                                                      |

Request paths never include query strings. Request bodies and authentication headers are not logged.

## Redaction

The central logger redacts authorization headers, cookies, passwords, tokens, secrets, API keys, refresh/access tokens, and email addresses. Log errors under `err` or pass them to the component logger so the standard serializer records the error type, message, and stack.

Do not interpolate credentials, tokens, email addresses, request bodies, or payment data into a message. Add safe structured fields instead.

## Tracing a Failure

1. Copy `X-Request-ID` from the failed API response or error envelope.
2. Search logs for that value as `requestId` or `correlationId`.
3. Follow `eventId` through the Redis projector and PostgreSQL outbox.
4. Continue with the same `correlationId` into Kafka consumer logs, using topic, partition, and offset to locate the delivery.
5. For retries, inspect `attempt`, `jobId`, and terminal or DLQ records.

Successful `/health` and `/ready` requests are omitted. Failed probes are logged with status and duration.

## Adding Logs

```ts
const log = createComponentLogger("notification-consumer");

log.info("Notification event processed", { eventType });
log.error("Notification event failed", { error, attempt });
```

Use `runWithLogContext` at each new request, event, or job boundary. Context is isolated between concurrent operations and automatically appears in nested logs.

Metrics, alert delivery, and distributed tracing are intentionally outside this maintainability pass.
