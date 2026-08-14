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
  constructor(message = "Bid mutation was accepted by Redis primary but replica acknowledgement was not confirmed") {
    super(message, 503, "BID_DURABILITY_UNCONFIRMED");
    this.name = "BidDurabilityUnconfirmedError";
  }
}
