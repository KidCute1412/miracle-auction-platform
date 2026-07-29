import { randomUUID } from "node:crypto";
import { describe, expect, it, vi } from "vitest";
import { publishEventBatchesStrict } from "../../src/config/kafka.config.ts";
import { prisma } from "../../src/infrastructure/database/prisma.client.ts";
import { relayOutboxBatch } from "../../src/infrastructure/events/outbox-relay.worker.ts";
import { createEventEnvelope } from "../../src/infrastructure/events/event-envelope.ts";
import { recordDashboardTerminal } from "../../src/workers/dashboard.worker.ts";
import { useIsolatedDatabase } from "../support/database.ts";

useIsolatedDatabase();

describe("committed outbox resiliency", () => {
  it("keeps a committed event retryable through a Kafka outage", async () => {
    const event = await prisma.auction_outbox.create({
      data: {
        event_id: randomUUID(),
        event_type: "bid.accepted.v1",
        event_version: 1,
        aggregate_id: "1",
        payload: { currentPriceVnd: "120" },
        available_at: new Date(0),
      },
    });
    vi.mocked(publishEventBatchesStrict).mockRejectedValueOnce(new Error("Kafka unavailable"));

    await relayOutboxBatch({ maxBackoffMs: 1_000 });
    await expect(prisma.auction_outbox.findUniqueOrThrow({ where: { id: event.id } }))
      .resolves.toMatchObject({ delivered_at: null, attempts: 1, last_error: "Kafka unavailable" });

    await prisma.auction_outbox.update({ where: { id: event.id }, data: { available_at: new Date(0) } });
    vi.mocked(publishEventBatchesStrict).mockResolvedValueOnce(undefined);
    await relayOutboxBatch();
    const delivered = await prisma.auction_outbox.findUniqueOrThrow({ where: { id: event.id } });
    expect(delivered.delivered_at).not.toBeNull();
    expect(delivered.attempts).toBe(2);
  });

  it("marks an invalid topic terminal without blocking later rows", async () => {
    const invalid = await prisma.auction_outbox.create({
      data: {
        event_id: randomUUID(),
        event_type: "bid.accepted.v1",
        event_version: 1,
        aggregate_id: "1",
        payload: {},
        topic: "misspelled_topic",
        available_at: new Date(0),
      },
    });
    await relayOutboxBatch();
    const row = await prisma.auction_outbox.findUniqueOrThrow({ where: { id: invalid.id } });
    expect(row.terminal_at).not.toBeNull();
    expect(row.delivered_at).toBeNull();
  });

  it("atomically records dashboard terminal failures in the shared DLQ outbox", async () => {
    const event = createEventEnvelope({
      eventType: "bid.accepted.v1",
      aggregateId: "77",
      correlationId: randomUUID(),
      payload: { currentPriceVnd: "120" },
    });

    await recordDashboardTerminal(event, "bidding_events", 1, "42", 5, new Error("projection failed"));
    await recordDashboardTerminal(event, "bidding_events", 1, "42", 5, new Error("projection failed"));

    const [receipt, dlqRows] = await Promise.all([
      prisma.dashboard_event_receipts.findUniqueOrThrow({ where: { event_id: event.eventId } }),
      prisma.auction_outbox.findMany({
        where: {
          topic: "async_events_dlq",
          causation_id: event.eventId,
          event_type: "async.consumer_terminal.v1",
        },
      }),
    ]);
    expect(receipt.status).toBe("terminal");
    expect(receipt.last_error).toBe("projection failed");
    expect(dlqRows).toHaveLength(1);
    expect(dlqRows[0]?.payload).toMatchObject({
      consumer: "dashboard-analytics-v1",
      source: { topic: "bidding_events", partition: 1, offset: "42" },
      attempt: 5,
      error: { message: "projection failed" },
    });
  });
});
