import type { AuctionMutationData } from "../infrastructure/redis/redis-auction.types.ts";

export class BidDomainError extends Error {
  constructor(
    message: string,
    readonly statusCode = 400,
    readonly code = "BID_REJECTED",
  ) {
    super(message);
    this.name = "BidDomainError";
  }
}

export class BidInfrastructureError extends BidDomainError {
  constructor(message = "Bidding authority is unavailable") {
    super(message, 503, "BID_AUTHORITY_UNAVAILABLE");
    this.name = "BidInfrastructureError";
  }
}

export class BidDurabilityUnconfirmedError extends BidDomainError {
  readonly details: {
    acceptedOnPrimary: true;
    eventId: string;
    productId: string;
    sequence: string;
    version: string;
  };

  constructor(data: AuctionMutationData, message = "Bid mutation was accepted by Redis primary but replica acknowledgement was not confirmed") {
    super(message, 503, "BID_DURABILITY_UNCONFIRMED");
    this.name = "BidDurabilityUnconfirmedError";
    this.details = {
      acceptedOnPrimary: true,
      eventId: data.event_id,
      productId: data.product_id,
      sequence: data.sequence,
      version: data.version,
    };
  }
}
