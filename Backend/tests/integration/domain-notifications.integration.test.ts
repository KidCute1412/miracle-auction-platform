import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";
import { prisma } from "../../src/infrastructure/database/prisma.client.ts";
import {
  postProductQuestion,
  updateProductDescription,
} from "../../src/modules/products/application/product.use-case.ts";
import {
  enqueueNotificationEvent,
} from "../../src/modules/notifications/notification.service.ts";
import { runEmailDeliveryBatch } from "../../src/modules/notifications/email-delivery.worker.ts";
import { createAuction, createUser } from "../support/fixtures.ts";
import { useIsolatedDatabase } from "../support/database.ts";

useIsolatedDatabase();

describe("domain outbox and durable notification integration", () => {
  it("commits question and description writes with canonical domain events", async () => {
    const seller = await createUser({ role: "seller" });
    const bidder = await createUser();
    const auction = await createAuction(seller.user_id);

    const question = await postProductQuestion(
      Number(auction.product_id),
      bidder.user_id,
      "Is the item complete?",
      null,
    );
    const questionEvent = await prisma.auction_outbox.findFirstOrThrow({
      where: { aggregate_id: auction.product_id.toString(), event_type: "product.question_created.v1" },
    });
    expect(question.question_id).toBeDefined();
    expect(questionEvent.topic).toBe("domain_events");

    await expect(updateProductDescription(
      Number(auction.product_id),
      seller.user_id,
      "Updated after inspection",
    )).resolves.toMatchObject({ status: "200" });
    await expect(prisma.auction_outbox.findFirstOrThrow({
      where: { aggregate_id: auction.product_id.toString(), event_type: "product.description_changed.v1" },
    })).resolves.toMatchObject({ topic: "domain_events" });
  });

  it("deduplicates Kafka replay into one delivery and survives the disabled delivery loop", async () => {
    const seller = await createUser({ role: "seller" });
    const winner = await createUser();
    const auction = await createAuction(seller.user_id);
    await prisma.products.update({
      where: { product_id: auction.product_id },
      data: { price_owner_id: BigInt(winner.user_id), auction_status: "ENDED" },
    });
    await prisma.bidding_history.create({
      data: {
        product_id: auction.product_id,
        user_id: winner.user_id,
        max_price: 150n,
        product_price: 150n,
        price_owner_id: BigInt(winner.user_id),
      },
    });
    const eventId = randomUUID();
    const event = {
      eventId,
      eventType: "auction.closed.v1",
      eventVersion: 1,
      aggregateId: auction.product_id.toString(),
      occurredAt: new Date().toISOString(),
      correlationId: randomUUID(),
      payload: { productId: auction.product_id.toString() },
    };

    await enqueueNotificationEvent(event, { topic: "bidding_events", partition: 0, offset: "1" });
    await enqueueNotificationEvent(event, { topic: "bidding_events", partition: 0, offset: "1" });
    expect(await prisma.notification_event_receipts.count({ where: { event_id: eventId } })).toBe(1);
    expect(await prisma.email_deliveries.count({ where: { source_event_id: eventId } })).toBe(2);

    process.env.EMAIL_DELIVERY_MODE = "disabled";
    await runEmailDeliveryBatch();
    expect(await prisma.email_deliveries.count({
      where: { source_event_id: eventId, status: "sent" },
    })).toBe(2);
  });
});
