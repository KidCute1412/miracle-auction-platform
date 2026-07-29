import { createHash } from "node:crypto";
import { Prisma, type email_deliveries } from "@prisma/client";
import { kafkaTopics } from "@/config/kafka-topics.config.ts";
import { deliverMail } from "@/helpers/mail.helper.ts";
import { addOutboxEvent } from "@/infrastructure/events/outbox.repository.ts";
import { prisma } from "@/infrastructure/database/prisma.client.ts";
import { enqueueNotificationEvent } from "./notification.service.ts";

const RETRY_DELAYS_MS = [30_000, 120_000, 600_000, 1_800_000, 7_200_000] as const;
type ClaimedDelivery = Pick<
  email_deliveries,
  | "id"
  | "source_event_id"
  | "recipient_key"
  | "recipient_email"
  | "template_key"
  | "subject"
  | "html_body"
  | "text_body"
  | "message_id"
  | "attempts"
>;

export function emailRetryDelayMs(attempt: number): number {
  return RETRY_DELAYS_MS[Math.min(Math.max(attempt - 1, 0), RETRY_DELAYS_MS.length - 1)];
}

async function claimDeliveries(limit: number, leaseMs: number): Promise<ClaimedDelivery[]> {
  return prisma.$transaction(async (tx) => {
    const rows = await tx.$queryRaw<ClaimedDelivery[]>(Prisma.sql`
      SELECT id, source_event_id, recipient_key, recipient_email, template_key,
             subject, html_body, text_body, message_id, attempts
      FROM email_deliveries
      WHERE terminal_at IS NULL
        AND sent_at IS NULL
        AND available_at <= NOW()
        AND (status = 'pending' OR (status = 'leased' AND lease_until <= NOW()))
      ORDER BY id
      LIMIT ${limit}
      FOR UPDATE SKIP LOCKED
    `);
    if (rows.length > 0) {
      await tx.email_deliveries.updateMany({
        where: { id: { in: rows.map((row) => row.id) } },
        data: {
          status: "leased",
          attempts: { increment: 1 },
          lease_until: new Date(Date.now() + leaseMs),
          updated_at: new Date(),
        },
      });
    }
    return rows;
  });
}

async function markDeliveryFailure(row: ClaimedDelivery, error: unknown, maxAttempts: number): Promise<void> {
  const attempt = row.attempts + 1;
  const message = error instanceof Error ? error.message : "Unknown SMTP error";
  await prisma.$transaction(async (tx) => {
    if (attempt >= maxAttempts) {
      await tx.email_deliveries.update({
        where: { id: row.id },
        data: {
          status: "terminal",
          terminal_at: new Date(),
          lease_until: null,
          last_error: message.slice(0, 2_000),
          updated_at: new Date(),
        },
      });
      await addOutboxEvent(tx, {
        topic: kafkaTopics.asyncDlq,
        eventType: "email.delivery_failed.v1",
        aggregateId: row.id.toString(),
        causationId: row.source_event_id,
        payload: {
          consumer: "email-delivery",
          sourceEventId: row.source_event_id,
          deliveryId: row.id.toString(),
          templateKey: row.template_key,
          attempt,
          error: message.slice(0, 500),
        },
      });
      return;
    }
    await tx.email_deliveries.update({
      where: { id: row.id },
      data: {
        status: "pending",
        lease_until: null,
        available_at: new Date(Date.now() + emailRetryDelayMs(attempt)),
        last_error: message.slice(0, 2_000),
        updated_at: new Date(),
      },
    });
  });
}

let lastSmtpSendAt = 0;
async function deliverOne(row: ClaimedDelivery, maxAttempts: number): Promise<void> {
  try {
    if ((process.env.EMAIL_DELIVERY_MODE ?? "disabled") === "smtp") {
      const remaining = 1_000 - (Date.now() - lastSmtpSendAt);
      if (remaining > 0) await new Promise((resolve) => setTimeout(resolve, remaining));
      await deliverMail({
        email: row.recipient_email,
        title: row.subject,
        html: row.html_body,
        text: row.text_body,
        messageId: row.message_id,
      });
      lastSmtpSendAt = Date.now();
    }
    await prisma.email_deliveries.update({
      where: { id: row.id },
      data: {
        status: "sent",
        sent_at: new Date(),
        lease_until: null,
        last_error: null,
        updated_at: new Date(),
      },
    });
  } catch (error) {
    await markDeliveryFailure(row, error, maxAttempts);
  }
}

export async function runEmailDeliveryBatch(): Promise<number> {
  const concurrency = Number(process.env.EMAIL_DELIVERY_CONCURRENCY ?? 2);
  const maxAttempts = Number(process.env.EMAIL_DELIVERY_MAX_ATTEMPTS ?? 5);
  const leaseMs = Number(process.env.EMAIL_DELIVERY_LEASE_MS ?? 300_000);
  const rows = await claimDeliveries(concurrency, leaseMs);
  await Promise.all(rows.map((row) => deliverOne(row, maxAttempts)));
  return rows.length;
}

function recoveryEventId(productId: bigint): string {
  const hash = createHash("sha256").update(`auction-recovery:${productId}`).digest("hex");
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-4${hash.slice(13, 16)}-a${hash.slice(17, 20)}-${hash.slice(20, 32)}`;
}

export async function recoverLegacyAuctionNotifications(limit = 50): Promise<number> {
  const products = await prisma.products.findMany({
    where: {
      auction_status: { in: ["ENDED", "SOLD"] },
      auction_notification_enqueued_at: null,
    },
    orderBy: { end_time: "asc" },
    take: limit,
    select: { product_id: true, end_time: true },
  });
  for (const product of products) {
    const eventId = recoveryEventId(product.product_id);
    await enqueueNotificationEvent({
      eventId,
      eventType: "auction.closed.v1",
      eventVersion: 1,
      aggregateId: product.product_id.toString(),
      occurredAt: (product.end_time ?? new Date()).toISOString(),
      correlationId: eventId,
      payload: { productId: product.product_id.toString(), recovery: true },
    }, { topic: "scheduled_recovery" });
  }
  return products.length;
}

let active = false;
let loop: Promise<void> | undefined;
let recoveryTimer: NodeJS.Timeout | undefined;

export function startEmailDeliveryLoop(): void {
  if (active) return;
  active = true;
  recoveryTimer = setInterval(() => void recoverLegacyAuctionNotifications().catch((error) =>
    console.error("[EMAIL_DELIVERY] Recovery failed", {
      message: error instanceof Error ? error.message : "unknown",
    })), 60_000);
  recoveryTimer.unref();
  void recoverLegacyAuctionNotifications();
  loop = (async () => {
    while (active) {
      const count = await runEmailDeliveryBatch().catch((error) => {
        console.error("[EMAIL_DELIVERY] Poll failed", {
          message: error instanceof Error ? error.message : "unknown",
        });
        return 0;
      });
      if (count === 0) await new Promise((resolve) => setTimeout(resolve, 1_000));
    }
  })();
}

export async function stopEmailDeliveryLoop(): Promise<void> {
  active = false;
  if (recoveryTimer) clearInterval(recoveryTimer);
  recoveryTimer = undefined;
  await loop;
  loop = undefined;
}
