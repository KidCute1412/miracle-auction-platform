import { beforeEach, describe, expect, it, vi } from "vitest";

const repo = vi.hoisted(() => ({ createOrder: vi.fn(), getOrderDetail: vi.fn(), getSellerOrderView: vi.fn(), getOrderByProductId: vi.fn(), updateOrderStatus: vi.fn() }));
const cloud = vi.hoisted(() => vi.fn().mockResolvedValue({ secure_url: "https://image.test/file.png" }));
const unlinkSync = vi.hoisted(() => vi.fn());
vi.mock("../../../src/modules/orders/infrastructure/order.repository.ts", () => repo);
vi.mock("@/config/cloud.config.ts", () => ({ uploadToCloudinary: cloud }));
vi.mock("fs", () => ({ default: { unlinkSync } }));

import * as useCase from "../../../src/modules/orders/application/order.use-case.ts";

describe("order use cases", () => {
  beforeEach(() => vi.clearAllMocks());

  it("creates an order and stores an uploaded payment proof", async () => {
    const data = { user_id: 1, product_id: 2 };
    await useCase.createOrder(data, { path: "proof.png" } as Express.Multer.File);
    expect(data).toMatchObject({ payment_proof_image_url: "https://image.test/file.png" });
    expect(unlinkSync).toHaveBeenCalledWith("proof.png");
    expect(repo.createOrder).toHaveBeenCalledWith(data);
  });

  it("delegates order detail reads", async () => {
    repo.getOrderDetail.mockResolvedValue({ id: 1 }); repo.getSellerOrderView.mockResolvedValue({ id: 2 }); repo.getOrderByProductId.mockResolvedValue({ id: 3 });
    expect(await useCase.getOrderDetail(1, 2)).toEqual({ id: 1 });
    expect(await useCase.getSellerOrderView(2)).toEqual({ id: 2 });
    expect(await useCase.getOrderByProductId(2)).toEqual({ id: 3 });
  });

  it("rejects only an existing pending order", async () => {
    repo.getOrderByProductId.mockResolvedValueOnce(null).mockResolvedValueOnce({ order_id: 1, order_status: "finished" }).mockResolvedValueOnce({ order_id: 2, order_status: "pending" });
    await expect(useCase.rejectOrder(1)).resolves.toMatchObject({ success: false, message: "Order does not exist" });
    await expect(useCase.rejectOrder(1)).resolves.toMatchObject({ success: false, message: "Can only reject pending orders" });
    await expect(useCase.rejectOrder(1)).resolves.toMatchObject({ success: true });
    expect(repo.updateOrderStatus).toHaveBeenCalledWith(2, "rejected");
  });

  it("approves only a pending order and stores a shipping label", async () => {
    repo.getOrderByProductId.mockResolvedValueOnce(null).mockResolvedValueOnce({ order_id: 1, order_status: "rejected" }).mockResolvedValueOnce({ order_id: 2, order_status: "pending" });
    await expect(useCase.approveOrder(1)).resolves.toMatchObject({ success: false, message: "Order does not exist" });
    await expect(useCase.approveOrder(1)).resolves.toMatchObject({ success: false, message: "Can only approve pending orders" });
    await expect(useCase.approveOrder(1, { path: "label.png" } as Express.Multer.File)).resolves.toMatchObject({ success: true });
    expect(repo.updateOrderStatus).toHaveBeenCalledWith(2, "finished", "https://image.test/file.png");
  });
});
