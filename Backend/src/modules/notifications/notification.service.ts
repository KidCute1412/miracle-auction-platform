import { createHash } from "node:crypto";
import { Prisma } from "@prisma/client";
import type { EventEnvelope } from "@/infrastructure/events/event-envelope.ts";
import { prisma } from "@/infrastructure/database/prisma.client.ts";
import { normalizeAuctionEventType } from "@/infrastructure/events/auction-event-contract.ts";
import {
  getLoserEmailTemplate,
  getProductDescriptionChangedTemplate,
  getSellerNoWinnerEmailTemplate,
  getSellerWithWinnerEmailTemplate,
  getWinnerEmailTemplate,
  sendBidderQuestionTemplate,
  sendSellerAnswerTemplate,
} from "@/helpers/mail.helper.ts";
import { slugify } from "@/helpers/slug.helper.ts";

export interface EmailDraft {
  recipientKey: string;
  recipientEmail: string;
  templateKey: string;
  subject: string;
  html: string;
}

const productUrl = (name: string, id: bigint): string =>
  `${process.env.CLIENT_URL || "http://localhost:5173"}/product/${slugify(name)}-${id}`;

export function stableMessageId(sourceEventId: string, recipientKey: string, templateKey: string): string {
  const digest = createHash("sha256")
    .update(`${sourceEventId}:${recipientKey}:${templateKey}`)
    .digest("hex");
  return `<${digest}@events.online-auction>`;
}

const textFromHtml = (html: string): string =>
  html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

function payloadId(event: EventEnvelope, field: string): bigint {
  const value = event.payload[field] ?? event.aggregateId;
  if (typeof value !== "string" && typeof value !== "number") throw new Error(`Missing ${field}`);
  return BigInt(value);
}

async function auctionDrafts(event: EventEnvelope): Promise<EmailDraft[]> {
  const productId = BigInt(event.aggregateId);
  const product = await prisma.products.findUnique({
    where: { product_id: productId },
    select: {
      product_id: true,
      product_name: true,
      current_price: true,
      seller_id: true,
      price_owner_id: true,
    },
  });
  if (!product?.product_name) throw new Error(`Auction ${event.aggregateId} is unavailable`);
  const productName = product.product_name;
  const seller = await prisma.users.findUnique({ where: { user_id: Number(product.seller_id) } });
  if (!seller) throw new Error(`Seller for auction ${event.aggregateId} is unavailable`);
  const link = productUrl(productName, product.product_id);
  const finalPrice = product.current_price ?? 0n;
  if (product.price_owner_id === null) {
    return [{
      recipientKey: `user:${seller.user_id}`,
      recipientEmail: seller.email,
      templateKey: "auction-seller-no-winner",
      subject: `Auction ended: ${productName}`,
      html: getSellerNoWinnerEmailTemplate({ productName, productLink: link, finalPrice }),
    }];
  }
  const winner = await prisma.users.findUnique({ where: { user_id: Number(product.price_owner_id) } });
  if (!winner) throw new Error(`Winner for auction ${event.aggregateId} is unavailable`);
  const bidderRows = await prisma.bidding_history.findMany({
    where: { product_id: productId, status: null, user_id: { not: winner.user_id } },
    distinct: ["user_id"],
    select: { user_id: true },
  });
  const losers = bidderRows.length === 0
    ? []
    : await prisma.users.findMany({ where: { user_id: { in: bidderRows.map((row) => row.user_id) } } });
  return [
    {
      recipientKey: `user:${winner.user_id}`,
      recipientEmail: winner.email,
      templateKey: "auction-winner",
      subject: `Congratulations! You won: ${productName}`,
      html: getWinnerEmailTemplate({ productName, productLink: link, finalPrice }),
    },
    {
      recipientKey: `user:${seller.user_id}`,
      recipientEmail: seller.email,
      templateKey: "auction-seller-with-winner",
      subject: `Sold! Auction ended: ${productName}`,
      html: getSellerWithWinnerEmailTemplate({
        productName,
        productLink: link,
        finalPrice,
        winnerName: winner.username,
      }),
    },
    ...losers.map((loser): EmailDraft => ({
      recipientKey: `user:${loser.user_id}`,
      recipientEmail: loser.email,
      templateKey: "auction-loser",
      subject: `Auction ended: ${productName}`,
      html: getLoserEmailTemplate({ productName, productLink: link, finalPrice }),
    })),
  ];
}

async function questionDrafts(event: EventEnvelope, answered: boolean): Promise<EmailDraft[]> {
  const questionId = payloadId(event, "questionId");
  const question = await prisma.product_questions.findUnique({
    where: { question_id: questionId },
    include: { products: true, users: true, product_questions: { include: { users: true } } },
  });
  const productName = question?.products.product_name;
  if (!question || !productName) throw new Error(`Question ${questionId} is unavailable`);
  const product = question.products;
  const seller = await prisma.users.findUnique({ where: { user_id: Number(product.seller_id) } });
  if (!seller) throw new Error(`Seller for question ${questionId} is unavailable`);
  const link = productUrl(productName, product.product_id);
  if (!answered) {
    if (seller.user_id === question.user_id) return [];
    return [{
      recipientKey: `user:${seller.user_id}`,
      recipientEmail: seller.email,
      templateKey: "product-question-created",
      subject: "New question regarding your product",
      html: sendBidderQuestionTemplate({
        seller_username: seller.username,
        product_name: productName,
        productUrl: link,
        content: question.content ?? "",
      }),
    }];
  }
  const asker = question.product_questions?.users;
  if (!asker || asker.user_id === seller.user_id) return [];
  return [{
    recipientKey: `user:${asker.user_id}`,
    recipientEmail: asker.email,
    templateKey: "product-question-answered",
    subject: "Seller replied to your question",
    html: sendSellerAnswerTemplate({
      bidder_username: asker.username,
      seller_username: seller.username,
      product_name: productName,
      productUrl: link,
      bidder_question: question.product_questions?.content ?? "",
      content: question.content ?? "",
    }),
  }];
}

async function descriptionDrafts(event: EventEnvelope): Promise<EmailDraft[]> {
  const productId = BigInt(event.aggregateId);
  const product = await prisma.products.findUnique({ where: { product_id: productId } });
  if (!product?.product_name || product.price_owner_id === null || product.current_price === null) return [];
  const bidder = await prisma.users.findUnique({ where: { user_id: Number(product.price_owner_id) } });
  if (!bidder) return [];
  return [{
    recipientKey: `user:${bidder.user_id}`,
    recipientEmail: bidder.email,
    templateKey: "product-description-changed",
    subject: "Product description update alert",
    html: getProductDescriptionChangedTemplate({
      bidderUsername: bidder.username,
      productName: product.product_name,
      currentPrice: product.current_price,
      productUrl: productUrl(product.product_name, product.product_id),
      changeDate: new Date(event.occurredAt).toLocaleString(),
    }),
  }];
}

async function sellerDecisionDrafts(event: EventEnvelope): Promise<EmailDraft[]> {
  const application = await prisma.upgrade_to_sellers.findUnique({
    where: { id: BigInt(event.aggregateId) },
    include: { users: true },
  });
  if (!application) throw new Error(`Seller application ${event.aggregateId} is unavailable`);
  const approved = event.eventType === "seller.approved.v1";
  const decision = approved ? "approved" : "rejected";
  return [{
    recipientKey: `user:${application.users.user_id}`,
    recipientEmail: application.users.email,
    templateKey: `seller-application-${decision}`,
    subject: `Seller application ${decision}`,
    html: `<p>Hello ${application.users.username},</p><p>Your seller application was ${decision}.</p>`,
  }];
}

export async function resolveNotificationDrafts(event: EventEnvelope): Promise<EmailDraft[]> {
  const auctionType = normalizeAuctionEventType(event.eventType);
  if (auctionType === "auction.closed.v1" || auctionType === "auction.buy_now_completed.v1") {
    return auctionDrafts(event);
  }
  if (event.eventType === "product.question_created.v1") return questionDrafts(event, false);
  if (event.eventType === "product.question_answered.v1") return questionDrafts(event, true);
  if (event.eventType === "product.description_changed.v1") return descriptionDrafts(event);
  if (event.eventType === "seller.approved.v1" || event.eventType === "seller.rejected.v1") {
    return sellerDecisionDrafts(event);
  }
  return [];
}

export async function enqueueNotificationEvent(
  event: EventEnvelope,
  metadata: { topic: string; partition?: number; offset?: string },
): Promise<"processed" | "duplicate"> {
  const existing = await prisma.notification_event_receipts.findUnique({ where: { event_id: event.eventId } });
  if (existing?.status === "processed" || existing?.status === "terminal") return "duplicate";
  const drafts = await resolveNotificationDrafts(event);
  await prisma.$transaction(async (tx) => {
    const receipt = await tx.notification_event_receipts.findUnique({ where: { event_id: event.eventId } });
    if (receipt?.status === "processed" || receipt?.status === "terminal") return;
    await tx.notification_event_receipts.upsert({
      where: { event_id: event.eventId },
      create: {
        event_id: event.eventId,
        topic: metadata.topic,
        event_type: event.eventType,
        event_version: event.eventVersion,
        aggregate_id: event.aggregateId,
        correlation_id: event.correlationId,
        payload: event.payload as Prisma.InputJsonObject,
        status: "processed",
        attempts: 1,
        partition: metadata.partition,
        offset: metadata.offset,
        processed_at: new Date(),
      },
      update: {
        status: "processed",
        attempts: { increment: 1 },
        partition: metadata.partition,
        offset: metadata.offset,
        processed_at: new Date(),
        updated_at: new Date(),
        last_error: null,
      },
    });
    if (drafts.length > 0) {
      await tx.email_deliveries.createMany({
        data: drafts.map((draft) => ({
          source_event_id: event.eventId,
          recipient_key: draft.recipientKey,
          recipient_email: draft.recipientEmail,
          template_key: draft.templateKey,
          subject: draft.subject,
          html_body: draft.html,
          text_body: textFromHtml(draft.html),
          message_id: stableMessageId(event.eventId, draft.recipientKey, draft.templateKey),
        })),
        skipDuplicates: true,
      });
    }
    if (normalizeAuctionEventType(event.eventType) === "auction.closed.v1"
      || normalizeAuctionEventType(event.eventType) === "auction.buy_now_completed.v1") {
      await tx.products.updateMany({
        where: { product_id: BigInt(event.aggregateId), auction_notification_enqueued_at: null },
        data: { auction_notification_enqueued_at: new Date() },
      });
    }
  });
  return "processed";
}
