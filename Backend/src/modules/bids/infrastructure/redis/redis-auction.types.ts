import type { AuctionStatus } from "../../domain/bid.types.ts";

export type AuctionMutationOperation = "BID" | "BUY_NOW" | "BAN" | "CLOSE" | "CANCEL";

export interface AuctionMutationCommand {
  operation: AuctionMutationOperation;
  productId: number;
  actorId: number;
  actorRole: string;
  idempotencyKey: string;
  correlationId: string;
  amountVnd?: string;
  targetUserId?: number;
  reason?: string;
  orderId?: string;
  now?: Date;
}

export interface AuctionMutationData {
  event_id: string;
  product_id: string;
  current_price: string;
  leader_id: string | null;
  end_time_ms: string;
  sequence: string;
  version: string;
  order_id: string | null;
}

export type AuctionMutationResult =
  | { status: "success"; data: AuctionMutationData }
  | { status: "error"; code: string; message: string; statusCode: number };

export interface AuctionStreamEvent {
  eventId: string;
  correlationId: string;
  idempotencyKey: string;
  schemaVersion: 1;
  type: "BID_ACCEPTED" | "BUY_NOW_COMPLETED" | "BIDDER_BANNED" | "AUCTION_CLOSED" | "AUCTION_CANCELLED";
  productId: string;
  actorId: string;
  requestedMaxPriceVnd?: string;
  targetUserId?: string;
  currentPriceVnd: string;
  leaderId?: string;
  leaderMaxPriceVnd?: string;
  endAtMs: string;
  status: AuctionStatus;
  sequence: string;
  version: string;
  occurredAtMs: string;
  orderId?: string;
  reason?: string;
}
