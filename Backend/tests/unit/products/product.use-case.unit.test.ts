import { beforeEach, describe, expect, it, vi } from "vitest";

const repo = vi.hoisted(() => ({
  getProductsPageList: vi.fn(), getProductNameById: vi.fn(), getProductById: vi.fn(), postNewProduct: vi.fn(),
  getMyFavoriteProducts: vi.fn(), getMySellingProducts: vi.fn(), getMySoldProducts: vi.fn(), getMyWonProducts: vi.fn(),
  getMyBiddingProducts: vi.fn(), getMyInventoryProducts: vi.fn(), searchProducts: vi.fn(), getLoveStatus: vi.fn(),
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
const sendMail = vi.hoisted(() => vi.fn());
const emitBidUpdate = vi.hoisted(() => vi.fn());
vi.mock("../../../src/modules/products/infrastructure/product.repository.ts", () => repo);
vi.mock("@/modules/users/infrastructure/user.repository.ts", () => users);
vi.mock("@/modules/accounts/infrastructure/account.repository.ts", () => ({ accountRepository: accounts }));
vi.mock("@/config/cloud.config.ts", () => ({ uploadToCloudinary: upload }));
vi.mock("fs", () => ({ default: { unlinkSync } }));
vi.mock("@/socket.ts", () => ({ emitBidUpdate }));
vi.mock("@/helpers/mail.helper.ts", () => ({
  sendMail, sendBidderQuestionTemplate: vi.fn(() => "question-mail"), sendSellerAnswerTemplate: vi.fn(() => "answer-mail"),
  getProductDescriptionChangedTemplate: vi.fn(() => "description-mail"),
}));

import * as useCase from "../../../src/modules/products/application/product.use-case.ts";

describe("product use cases", () => {
  beforeEach(() => vi.clearAllMocks());

  it("builds product pagination and sort parameters", async () => {
    repo.getProductsPageList.mockResolvedValue([{ total_count: "7" }]);
    await expect(useCase.getProductsPageList(2, 2, "asc", "desc", "watch")).resolves.toMatchObject({ numberOfPages: 2, quantity: 7 });
    expect(repo.getProductsPageList).toHaveBeenCalledWith(2, 6, 6, ["p.current_price ASC", "p.end_time DESC"], "watch");
    repo.getProductsPageList.mockResolvedValue([]);
    await expect(useCase.getProductsPageList(0, 1, "", "", "")).resolves.toEqual({ data: [], numberOfPages: 0, quantity: 0 });
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

  it("searches, reports likes, and toggles a favorite only when state changes", async () => {
    repo.searchProducts.mockResolvedValue([{ total_count: "8" }]); repo.getLoveStatus.mockResolvedValue({ is_loved: true, total_loves: "3" });
    await expect(useCase.searchProducts(" watch ", 2)).resolves.toMatchObject({ numberOfPages: 2, quantity: 8 });
    await expect(useCase.getLoveStatus(1, 2)).resolves.toEqual({ is_loved: true, total_loves: 3 });
    repo.checkProductIsLoved.mockResolvedValueOnce(false).mockResolvedValueOnce(true).mockResolvedValueOnce(true);
    await useCase.updateLoveStatus(1, 2, true);
    await useCase.updateLoveStatus(1, 2, false);
    await useCase.updateLoveStatus(1, 2, true);
    expect(repo.loveProduct).toHaveBeenCalledOnce(); expect(repo.unloveProduct).toHaveBeenCalledOnce();
  });

  it("returns paginated questions and notifies seller for a bidder question", async () => {
    repo.getProductQuestions.mockResolvedValue([{ total_count: "2" }]);
    await expect(useCase.getProductQuestions(1, 2, 5)).resolves.toMatchObject({ total_questions: 2 });
    repo.postProductQuestion.mockResolvedValue({ id: 9 });
    repo.getSellerOfProduct.mockResolvedValue({ user_id: 7, username: "seller", product_name: "Watch", email: "seller@example.com" });
    await expect(useCase.postProductQuestion(1, 3, "Question", null)).resolves.toEqual({ id: 9 });
    expect(sendMail).toHaveBeenCalledWith("seller@example.com", expect.any(String), "question-mail");
  });

  it("notifies the bidder when the seller replies", async () => {
    repo.postProductQuestion.mockResolvedValue({ id: 10 });
    repo.getSellerOfProduct.mockResolvedValue({ user_id: 7, username: "seller", product_name: "Watch", email: "seller@example.com" });
    repo.getUserInParentQuestion.mockResolvedValue({ user_id: 3, username: "bidder", email: "bidder@example.com", content: "Question" });
    await useCase.postProductQuestion(1, 7, "Answer", 9);
    expect(sendMail).toHaveBeenCalledWith("bidder@example.com", expect.any(String), "answer-mail");
  });

  it("checks ownership before changing a description", async () => {
    repo.verifyProductSeller.mockResolvedValueOnce(false).mockResolvedValueOnce(true);
    await expect(useCase.updateProductDescription(1, "2", "new")).resolves.toMatchObject({ status: "403" });
    repo.getProductById.mockResolvedValue({ bid_turns: 1, price_owner_id: 3, price_owner_username: "bidder", product_name: "Watch", current_price: 120, product_id: 1 });
    users.getUserById.mockResolvedValue({ email: "bidder@example.com" });
    await expect(useCase.updateProductDescription(1, "2", "new")).resolves.toMatchObject({ status: "200" });
    expect(sendMail).toHaveBeenCalledWith("bidder@example.com", expect.any(String), "description-mail");
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
    expect(repo.deleteProductById).toHaveBeenCalledWith(1); expect(repo.restoreProductById).toHaveBeenCalledWith(1); expect(repo.destroyProductById).toHaveBeenCalledWith(1);
  });

  it("extends an auction only inside the configured threshold", async () => {
    repo.getProductForExtension.mockResolvedValueOnce(null);
    await useCase.extendBiddingTimeIfNeeded(1); expect(repo.getExtendTimeSetting).not.toHaveBeenCalled();
    repo.getProductForExtension.mockResolvedValue({ end_time: new Date(Date.now() + 30_000) }); repo.getExtendTimeSetting.mockResolvedValue({ extend_time: 5, threshold_time: 2 }); repo.getProductById.mockResolvedValue({ product_id: 1 });
    await useCase.extendBiddingTimeIfNeeded(1);
    expect(repo.updateProductEndTime).toHaveBeenCalledWith(1, expect.any(Date)); expect(emitBidUpdate).toHaveBeenCalledOnce();
  });
});
