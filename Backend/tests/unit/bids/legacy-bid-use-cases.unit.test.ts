import { beforeEach, describe, expect, it, vi } from "vitest";

const repository = vi.hoisted(() => ({
  lockAuction: vi.fn(),
  eligibility: vi.fn(),
  leader: vi.fn(),
  record: vi.fn(),
  updateAuction: vi.fn(),
  updateLeaderMax: vi.fn(),
  createOrder: vi.fn(),
  ban: vi.fn(),
}));
const outbox = vi.hoisted(() => ({
  add: vi.fn(),
  findReplay: vi.fn(),
  save: vi.fn(),
}));
const tx = vi.hoisted(() => ({
  bidding_ban_user: { findFirst: vi.fn() },
  admin_audit_logs: { create: vi.fn() },
}));

vi.mock("@/infrastructure/database/prisma.client.ts", () => ({
  prisma: { $transaction: vi.fn(async (callback: (client: typeof tx) => unknown) => callback(tx)) },
}));
vi.mock("@/modules/bids/application/bid-engine.ts", () => ({ getBidEngine: () => "postgres" }));
vi.mock("@/modules/bids/infrastructure/bid.repository.ts", () => ({
  BidRepository: class { constructor() { return repository; } },
  extendedEndTime: vi.fn().mockResolvedValue(undefined),
  lockIdempotencyKey: vi.fn().mockResolvedValue(undefined),
}));
vi.mock("@/modules/bids/infrastructure/bid-outbox.repository.ts", () => ({
  addBidOutboxEvent: outbox.add,
  findIdempotentResponse: outbox.findReplay,
  saveIdempotentResponse: outbox.save,
}));
vi.mock("@/modules/bids/infrastructure/redis/redis-auction.authority.ts", () => ({
  redisAuctionAuthority: { mutate: vi.fn() },
}));

import { BanBidderUseCase } from "@/modules/bids/application/ban-bidder.use-case.ts";
import { BuyNowUseCase } from "@/modules/bids/application/buy-now.use-case.ts";
import { PlaceBidUseCase } from "@/modules/bids/application/place-bid.use-case.ts";

const activeAuction = {
  productId: 10,
  sellerId: 1,
  currentPrice: 100n,
  startPrice: 100n,
  stepPrice: 10n,
  priceOwnerId: null,
  buyNowPrice: 500n,
  startTime: new Date(Date.now() - 60_000),
  endTime: new Date(Date.now() + 60_000),
  isRemoved: false,
  status: "ACTIVE" as const,
  version: 0n,
  sequence: 0n,
};

describe("legacy PostgreSQL bid use cases", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    repository.lockAuction.mockResolvedValue(activeAuction);
    repository.eligibility.mockResolvedValue({ rating: 5, ratingCount: 1, banned: false });
    repository.leader.mockResolvedValue(null);
    repository.createOrder.mockResolvedValue("order-10");
    outbox.findReplay.mockResolvedValue(undefined);
    tx.bidding_ban_user.findFirst.mockResolvedValue(null);
  });

  it("places and persists a proxy bid through the explicitly selected PostgreSQL engine", async () => {
    await expect(new PlaceBidUseCase().execute({
      userId: 2,
      productId: 10,
      maxPriceVnd: "150",
      idempotencyKey: "legacy-bid",
    })).resolves.toEqual({ status: "success" });

    expect(repository.record).toHaveBeenCalledWith(tx, expect.objectContaining({
      userId: 2,
      productId: 10,
      maxPrice: 150n,
    }));
    expect(repository.updateAuction).toHaveBeenCalled();
    expect(outbox.add).toHaveBeenCalledWith(tx, "bid.accepted", 10, expect.any(Object));
    expect(outbox.save).toHaveBeenCalled();
  });

  it("completes buy-now and stores the idempotent response", async () => {
    await expect(new BuyNowUseCase().execute({
      userId: 2,
      productId: 10,
      buyPriceVnd: "500",
      idempotencyKey: "legacy-buy-now",
    })).resolves.toMatchObject({ status: "success", order_id: "order-10" });

    expect(repository.updateAuction).toHaveBeenCalledWith(tx, activeAuction, 500n, 2, 1, expect.any(Date));
    expect(repository.createOrder).toHaveBeenCalledWith(tx, 2, 10);
    expect(outbox.add).toHaveBeenCalledWith(tx, "auction.buy_now_completed", 10, expect.any(Object));
    expect(outbox.save).toHaveBeenCalled();
  });

  it("records a seller ban and its audit event", async () => {
    await expect(new BanBidderUseCase().execute(
      { userId: 1, role: "seller" },
      10,
      2,
      "abusive bidding",
      "legacy-ban",
      "correlation-10",
    )).resolves.toEqual({ status: "success", data: { product_id: 10, banned_user_id: 2 } });

    expect(repository.ban).toHaveBeenCalledWith(tx, 10, 2, "abusive bidding");
    expect(outbox.add).toHaveBeenCalledWith(tx, "bidder.banned", 10, expect.any(Object));
    expect(tx.admin_audit_logs.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ correlation_id: "correlation-10", result: "success" }),
    });
  });
});
