import { beforeEach, describe, expect, it, vi } from "vitest";

const repo = vi.hoisted(() => ({
  getProductsCatalogList: vi.fn(), getProductsPageList: vi.fn(), getProductNameById: vi.fn(), getProductById: vi.fn(), postNewProduct: vi.fn(),
  getMyFavoriteProducts: vi.fn(), getMySellingProducts: vi.fn(), getMySoldProducts: vi.fn(), getMyWonProducts: vi.fn(),
  getMyBiddingProducts: vi.fn(), getMyInventoryProducts: vi.fn(), getLoveStatus: vi.fn(),
  checkProductIsLoved: vi.fn(), loveProduct: vi.fn(), unloveProduct: vi.fn(), getProductQuestions: vi.fn(),
  postProductQuestion: vi.fn(), getSellerOfProduct: vi.fn(), getUserInParentQuestion: vi.fn(), getRelatedProducts: vi.fn(),
  verifyProductSeller: vi.fn(), updateProductDescription: vi.fn(), getProductDetailForWinner: vi.fn(),
  fetchTopEndingSoonProducts: vi.fn(), fetchTopHighestPriceProducts: vi.fn(), fetchTopMostBidProducts: vi.fn(),
  calTotalProducts: vi.fn(), getProductWithOffsetLimit: vi.fn(), deleteProductById: vi.fn(), restoreProductById: vi.fn(),
  destroyProductById: vi.fn(), getProductForExtension: vi.fn(), getExtendTimeSetting: vi.fn(), updateProductEndTime: vi.fn(),
  isProductInBiddingTime: vi.fn(),
}));
const users = vi.hoisted(() => ({ getUserById: vi.fn() }));
const accounts = vi.hoisted(() => ({ findDetailedById: vi.fn() }));
const upload = vi.hoisted(() => vi.fn().mockResolvedValue({ secure_url: "https://image.test/product.png" }));
const unlinkSync = vi.hoisted(() => vi.fn());
const tx = vi.hoisted(() => ({
  products: { findUnique: vi.fn(), findFirst: vi.fn(), update: vi.fn(), delete: vi.fn() },
  product_questions: { findUnique: vi.fn(), create: vi.fn() },
  users: { findUnique: vi.fn() },
  admin_audit_logs: { create: vi.fn() },
}));
const addOutboxEvent = vi.hoisted(() => vi.fn());
vi.mock("../../../src/modules/products/infrastructure/product.repository.ts", () => repo);
vi.mock("@/modules/users/infrastructure/user.repository.ts", () => users);
vi.mock("@/modules/accounts/infrastructure/account.repository.ts", () => ({ accountRepository: accounts }));
vi.mock("@/config/cloud.config.ts", () => ({ uploadToCloudinary: upload }));
vi.mock("fs", () => ({ default: { unlinkSync } }));
vi.mock("@/infrastructure/database/prisma.client.ts", () => ({
  prisma: { $transaction: (operation: (client: typeof tx) => unknown) => operation(tx) },
}));
vi.mock("@/infrastructure/events/outbox.repository.ts", () => ({ addOutboxEvent }));

import * as useCase from "../../../src/modules/products/application/product.use-case.ts";

describe("product use cases", () => {
  beforeEach(() => vi.clearAllMocks());

  it("builds product pagination and sort parameters with catalog filter options", async () => {
    repo.getProductsCatalogList.mockResolvedValue([{ total_count: "7" }]);
    const filterOpts = { cat2_id: 2, page: 2, limit: 6, search: "watch", legacy_price: "asc", legacy_time: "desc" };
    await expect(useCase.getProductsPageList(filterOpts)).resolves.toMatchObject({ numberOfPages: 2, quantity: 7 });
    expect(repo.getProductsCatalogList).toHaveBeenCalledWith(filterOpts, 6, 6);
    repo.getProductsCatalogList.mockResolvedValue([]);
    await expect(useCase.getProductsPageList({ page: 1, limit: 6 })).resolves.toEqual({ data: [], numberOfPages: 0, quantity: 0 });
  });

  it("rejects missing products and mismatched slugs", async () => {
    repo.getProductNameById.mockResolvedValueOnce(null).mockResolvedValue("Vintage Watch");
    await expect(useCase.getProductDetailBySlugId("1", "vintage-watch")).resolves.toBeNull();
    await expect(useCase.getProductDetailBySlugId("1", "wrong-slug")).resolves.toBeNull();
    repo.getProductById.mockResolvedValue({ product_id: 1 });
    await expect(useCase.getProductDetailBySlugId("1", "vintage-watch")).resolves.toEqual({ product_id: 1 });
  });

  it("uploads product images and normalizes numeric form fields", async () => {
    await useCase.postNewProduct({ product_name: "Watch", step_price: "10", start_price: "100", buy_now_price: "200", cat2_id: "3", start_time: "start", end_time: "end", description: "desc", auto_extended: "true" }, [{ path: "one.png" }] as Express.Multer.File[], 7);
    expect(unlinkSync).toHaveBeenCalledWith("one.png");
    expect(repo.postNewProduct).toHaveBeenCalledWith(expect.objectContaining({
      seller_id: 7n,
      step_price: 10n,
      current_price: 100n,
      cat2_id: 3n,
      bid_turns: 0n,
      auto_extended: true,
      auction_status: "PENDING",
      product_images: ["https://image.test/product.png"],
    }));
  });

  it("selects each dashboard product list and rejects an unknown type", async () => {
    const methods = [repo.getMyFavoriteProducts, repo.getMySellingProducts, repo.getMySoldProducts, repo.getMyWonProducts, repo.getMyBiddingProducts, repo.getMyInventoryProducts];
    methods.forEach((method) => method.mockResolvedValue([{ total_count: "5" }]));
    for (const type of ["my-favorites", "my-selling", "my-sold", "my-won", "my-bidding", "my-inventory"]) {
      await expect(useCase.getMyProductsList("1", type, 1)).resolves.toMatchObject({ numberOfPages: 2, quantity: 5 });
    }
    await expect(useCase.getMyProductsList("1", "unknown", 1)).resolves.toBeNull();
  });

  it("reports likes and toggles a favorite only when state changes", async () => {
    repo.getLoveStatus.mockResolvedValue({ is_loved: true, total_loves: "3" });
    await expect(useCase.getLoveStatus(1, 2)).resolves.toEqual({ is_loved: true, total_loves: 3 });
    repo.checkProductIsLoved.mockResolvedValueOnce(false).mockResolvedValueOnce(true).mockResolvedValueOnce(true);
    await useCase.updateLoveStatus(1, 2, true);
    await useCase.updateLoveStatus(1, 2, false);
    await useCase.updateLoveStatus(1, 2, true);
    expect(repo.loveProduct).toHaveBeenCalledOnce(); expect(repo.unloveProduct).toHaveBeenCalledOnce();
  });

  it("writes a bidder question and its domain outbox event atomically", async () => {
    repo.getProductQuestions.mockResolvedValue([{ total_count: "2" }]);
    await expect(useCase.getProductQuestions(1, 2, 5)).resolves.toMatchObject({ total_questions: 2 });
    tx.products.findUnique.mockResolvedValue({ seller_id: 7n });
    tx.product_questions.create.mockResolvedValue({ question_id: 9n, product_id: 1n, user_id: 3, content: "Question" });
    tx.users.findUnique.mockResolvedValue({ username: "bidder" });
    await expect(useCase.postProductQuestion(1, 3, "Question", null)).resolves.toMatchObject({
      question_id: 9n,
      username: "bidder",
    });
    expect(addOutboxEvent).toHaveBeenCalledWith(tx, expect.objectContaining({
      topic: "domain_events",
      eventType: "product.question_created.v1",
    }));
  });

  it("writes a seller answer using the canonical domain event", async () => {
    tx.products.findUnique.mockResolvedValue({ seller_id: 7n });
    tx.product_questions.findUnique.mockResolvedValue({ user_id: 3 });
    tx.product_questions.create.mockResolvedValue({ question_id: 10n, product_id: 1n, user_id: 7, content: "Answer" });
    tx.users.findUnique.mockResolvedValue({ username: "seller" });
    await useCase.postProductQuestion(1, 7, "Answer", 9);
    expect(addOutboxEvent).toHaveBeenCalledWith(tx, expect.objectContaining({
      topic: "domain_events",
      eventType: "product.question_answered.v1",
    }));
  });

  it("checks ownership and writes description plus outbox in one transaction", async () => {
    tx.products.findFirst.mockResolvedValueOnce(null).mockResolvedValueOnce({ product_id: 1n, price_owner_id: 3n });
    await expect(useCase.updateProductDescription(1, 2, "new")).resolves.toMatchObject({ status: "403" });
    await expect(useCase.updateProductDescription(1, 2, "new")).resolves.toMatchObject({ status: "200" });
    expect(tx.products.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { product_id: 1n },
      data: expect.objectContaining({ description: "new" }),
    }));
    expect(addOutboxEvent).toHaveBeenCalledWith(tx, expect.objectContaining({
      topic: "domain_events",
      eventType: "product.description_changed.v1",
    }));
  });

  it("delegates related, featured, count and bidding-time reads", async () => {
    repo.getRelatedProducts.mockResolvedValue([1]); repo.fetchTopEndingSoonProducts.mockResolvedValue([2]); repo.fetchTopHighestPriceProducts.mockResolvedValue([3]); repo.fetchTopMostBidProducts.mockResolvedValue([4]); repo.calTotalProducts.mockResolvedValue(5); repo.isProductInBiddingTime.mockResolvedValue(true);
    expect(await useCase.getRelatedProducts(1, 2, 3)).toEqual([1]);
    expect(await useCase.getTopEndingSoonProducts(3)).toEqual([2]); expect(await useCase.getTopHighestPriceProducts(3)).toEqual([3]); expect(await useCase.getTopMostBidProducts(3)).toEqual([4]);
    expect(await useCase.calTotalProducts({}, false)).toBe(5); expect(await useCase.isProductInBiddingTime(1)).toBe(true);
  });

  it("enriches admin products and winner details", async () => {
    const list = [{ seller_id: 1 }]; repo.getProductWithOffsetLimit.mockResolvedValue(list); accounts.findDetailedById.mockResolvedValueOnce({ full_name: "Seller" });
    await expect(useCase.getAdminProductList(2, 5, {}, false)).resolves.toEqual([{ seller_id: 1, creator_name: "Seller" }]);
    repo.getProductById.mockResolvedValue({ seller_id: 1 }); accounts.findDetailedById.mockResolvedValue({ full_name: "Seller" });
    await expect(useCase.getProductById(1)).resolves.toMatchObject({ seller_name: "Seller" });
    repo.getProductDetailForWinner.mockResolvedValue({ seller_id: 1 }); users.getUserById.mockResolvedValue({ user_id: 1 });
    await expect(useCase.getProductDetailForWinner(1, "2")).resolves.toMatchObject({ infoSeller: { user_id: 1 } });
  });

  it("delegates product lifecycle mutations", async () => {
    await useCase.deleteProductById(1); await useCase.restoreProductById(1); await useCase.destroyProductById(1);
    expect(tx.products.update).toHaveBeenCalledTimes(2);
    expect(tx.products.delete).toHaveBeenCalledWith({ where: { product_id: 1n } });
    expect(addOutboxEvent).toHaveBeenCalledTimes(3);
  });

  it("extends an auction only inside the configured threshold", async () => {
    repo.getProductForExtension.mockResolvedValueOnce(null);
    await useCase.extendBiddingTimeIfNeeded(1); expect(repo.getExtendTimeSetting).not.toHaveBeenCalled();
    repo.getProductForExtension.mockResolvedValue({ end_time: new Date(Date.now() + 30_000) }); repo.getExtendTimeSetting.mockResolvedValue({ extend_time: 5, threshold_time: 2 }); repo.getProductById.mockResolvedValue({ product_id: 1 });
    await useCase.extendBiddingTimeIfNeeded(1);
    expect(repo.updateProductEndTime).toHaveBeenCalledWith(1, expect.any(Date));
  });
});
