import { randomUUID } from "node:crypto";
import { describe, expect, it, vi } from "vitest";
import { publishEventBatchesStrict } from "../../src/config/kafka.config.ts";
import { prisma } from "../../src/infrastructure/database/prisma.client.ts";
import { relayOutboxBatch } from "../../src/infrastructure/events/outbox-relay.worker.ts";
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
});
