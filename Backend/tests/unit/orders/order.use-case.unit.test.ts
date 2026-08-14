import { beforeEach, describe, expect, it, vi } from "vitest";

const repo = vi.hoisted(() => ({ updateWinnerOrder: vi.fn(), getPendingWinnerOrder: vi.fn(), getOrderDetail: vi.fn(), getSellerOrderView: vi.fn() }));
const cloud = vi.hoisted(() => vi.fn().mockResolvedValue({ secure_url: "https://image.test/file.png" }));
const unlinkSync = vi.hoisted(() => vi.fn());
const tx = vi.hoisted(() => ({
  orders: { findUnique: vi.fn(), updateMany: vi.fn() },
}));
const addOutboxEvent = vi.hoisted(() => vi.fn());
vi.mock("../../../src/modules/orders/infrastructure/order.repository.ts", () => repo);
vi.mock("@/config/cloud.config.ts", () => ({ uploadToCloudinary: cloud }));
vi.mock("fs", () => ({ default: { unlinkSync } }));
vi.mock("@/infrastructure/database/prisma.client.ts", () => ({
  prisma: { $transaction: (operation: (client: typeof tx) => unknown) => operation(tx) },
}));
vi.mock("@/infrastructure/events/outbox.repository.ts", () => ({ addOutboxEvent }));

import * as useCase from "../../../src/modules/orders/application/order.use-case.ts";

describe("order use cases", () => {
  beforeEach(() => vi.clearAllMocks());

  it("updates the projector-created winner order and stores an uploaded payment proof", async () => {
    repo.getPendingWinnerOrder.mockResolvedValue({ public_order_id: "da74a956-ea91-4553-a04a-4fe915c87951" });
    const data = { user_id: 1, public_order_id: "da74a956-ea91-4553-a04a-4fe915c87951" };
    await useCase.createOrder(data, { path: "proof.png" } as Express.Multer.File);
    expect(data).toMatchObject({ payment_proof_image_url: "https://image.test/file.png" });
    expect(unlinkSync).toHaveBeenCalledWith("proof.png");
    expect(repo.updateWinnerOrder).toHaveBeenCalledWith(data);
  });

  it("rejects checkout when the projector-created winner order is absent", async () => {
    repo.getPendingWinnerOrder.mockResolvedValue(null);
    await expect(useCase.createOrder({
      user_id: 1,
      public_order_id: "da74a956-ea91-4553-a04a-4fe915c87951",
    })).rejects.toThrow("Winner order was not found");
    expect(repo.updateWinnerOrder).not.toHaveBeenCalled();
  });

  it("delegates buyer and seller-scoped order reads", async () => {
    repo.getOrderDetail.mockResolvedValue({ id: 1 }); repo.getSellerOrderView.mockResolvedValue({ id: 2 });
    expect(await useCase.getOrderDetail(1, 2)).toEqual({ id: 1 });
    expect(await useCase.getSellerOrderView(2, 9)).toEqual({ id: 2 });
    expect(repo.getSellerOrderView).toHaveBeenCalledWith(2, 9);
  });

  it("allows only the owning seller to reject a pending order", async () => {
    tx.orders.findUnique.mockResolvedValue({ order_id: 2n, product_id: 7n, order_status: "pending", products: { seller_id: 9n, current_price: 100n } });
    tx.orders.updateMany.mockResolvedValue({ count: 1 });
    await expect(useCase.rejectOrder(2, 9)).resolves.toBeUndefined();
    expect(tx.orders.updateMany).toHaveBeenCalledWith(expect.objectContaining({ where: { order_id: 2n, order_status: "pending" } }));
    expect(addOutboxEvent).toHaveBeenCalledOnce();
  });

  it("rejects non-owner and terminal transitions, and approves a pending order once", async () => {
    tx.orders.findUnique.mockResolvedValueOnce({ order_id: 2n, product_id: 7n, order_status: "pending", products: { seller_id: 9n, current_price: 100n } });
    await expect(useCase.rejectOrder(2, 8)).rejects.toMatchObject({ code: "SELLER_ORDER_NOT_FOUND" });
    tx.orders.findUnique.mockResolvedValueOnce({ order_id: 2n, product_id: 7n, order_status: "finished", products: { seller_id: 9n, current_price: 100n } });
    await expect(useCase.approveOrder(2, 9, { path: "terminal-label.png" } as Express.Multer.File))
      .rejects.toMatchObject({ code: "ORDER_TRANSITION_INVALID" });
    tx.orders.findUnique.mockResolvedValueOnce({ order_id: 2n, product_id: 7n, order_status: "pending", products: { seller_id: 9n, current_price: 100n } });
    tx.orders.updateMany.mockResolvedValue({ count: 1 });
    await expect(useCase.approveOrder(2, 9, { path: "label.png" } as Express.Multer.File)).resolves.toBeUndefined();
    expect(tx.orders.updateMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { order_id: 2n, order_status: "pending" },
      data: expect.objectContaining({ order_status: "payment_verified", shipping_label_image_url: "https://image.test/file.png" }),
    }));
  });
});
