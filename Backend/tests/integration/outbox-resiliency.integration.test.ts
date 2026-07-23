import { randomUUID } from "node:crypto";
import { describe, expect, it, vi } from "vitest";
import { publishBidEventStrict } from "../../src/config/kafka.config.ts";
import { prisma } from "../../src/infrastructure/database/prisma.client.ts";
import { dispatchBidOutbox } from "../../src/modules/bids/infrastructure/bid-outbox.dispatcher.ts";
import { useIsolatedDatabase } from "../support/database.ts";

useIsolatedDatabase();

describe("committed outbox resiliency", () => {
  it("keeps a committed event retryable through a Kafka outage", async () => {
    const event = await prisma.auction_outbox.create({
      data: {
        event_id: randomUUID(),
        event_type: "bid.accepted",
        event_version: 1,
        aggregate_id: "1",
        payload: { currentPriceVnd: "120" },
        available_at: new Date(0),
      },
    });
    vi.mocked(publishBidEventStrict).mockRejectedValueOnce(new Error("Kafka unavailable"));

    await dispatchBidOutbox();
    await expect(prisma.auction_outbox.findUniqueOrThrow({ where: { id: event.id } }))
      .resolves.toMatchObject({ delivered_at: null, attempts: 1, last_error: "Kafka unavailable" });

    await prisma.auction_outbox.update({ where: { id: event.id }, data: { available_at: new Date(0) } });
    vi.mocked(publishBidEventStrict).mockResolvedValueOnce(undefined);
    await dispatchBidOutbox();
    const delivered = await prisma.auction_outbox.findUniqueOrThrow({ where: { id: event.id } });
    expect(delivered.delivered_at).not.toBeNull();
    expect(delivered.attempts).toBe(2);
  });
});
