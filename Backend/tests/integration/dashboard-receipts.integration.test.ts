import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";
import { completeDashboardReceipt } from "../../src/modules/dashboard/application/dashboard-summary.use-case.ts";
import { prisma } from "../../src/infrastructure/database/prisma.client.ts";
import { useIsolatedDatabase } from "../support/database.ts";

useIsolatedDatabase();

describe("dashboard receipt completion", () => {
  it("keeps the latest durable receipt state across a retry", async () => {
    const eventId = randomUUID();
    const receipt = {
      eventId,
      topic: "bidding_events",
      eventType: "bid.accepted.v1",
      eventVersion: 1,
      aggregateId: "900001",
      correlationId: randomUUID(),
      payload: { currentPriceVnd: "500000" },
      partition: 0,
      offset: "42",
      attempts: 1,
    };

    await completeDashboardReceipt(receipt);
    await completeDashboardReceipt({ ...receipt, offset: "43", attempts: 2 });

    await expect(prisma.dashboard_event_receipts.findUniqueOrThrow({ where: { event_id: eventId } }))
      .resolves.toMatchObject({ status: "processed", attempts: 2, offset: "43", last_error: null });
  });
});
