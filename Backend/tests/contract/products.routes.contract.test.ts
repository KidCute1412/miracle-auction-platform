import { describe, expect, it, vi } from "vitest";
import type { Response } from "express";
import { callRoute, createRouteContractApp, type RouteContract } from "../support/route-contract.ts";

const client = vi.hoisted(() => {
  const ok = (handler: string) => (_req: unknown, res: Response) => res.json({ handler });
  return { getProductsPageList: ok("getProductsPageList"), getTopEndingSoonProducts: ok("getTopEndingSoonProducts"), getTopMostBidProducts: ok("getTopMostBidProducts"), getTopHighestPriceProducts: ok("getTopHighestPriceProducts"), getMyProductsList: ok("getMyProductsList"), searchProducts: ok("searchProducts"), getProductDetailBySlugId: ok("getProductDetailBySlugId"), postNewProduct: ok("postNewProduct"), updateProductDescription: ok("updateProductDescription"), getLoveStatus: ok("getLoveStatus"), updateLoveStatus: ok("updateLoveStatus"), getProductQuestions: ok("getProductQuestions"), postProductQuestion: ok("postProductQuestion"), getProductDetailForWinner: ok("getProductDetailForWinner"), getRelatedProducts: ok("getRelatedProducts") };
});
const admin = vi.hoisted(() => {
  const ok = (handler: string) => (_req: unknown, res: Response) => res.json({ handler });
  return { list: ok("list"), calTotalProducts: ok("calTotalProducts"), detail: ok("detail"), deleteProduct: ok("deleteProduct"), restoreProduct: ok("restoreProduct"), destroyProduct: ok("destroyProduct") };
});
vi.mock("../../src/modules/products/api/products.client.controller.ts", () => client);
vi.mock("../../src/modules/products/api/products.admin.controller.ts", () => admin);
vi.mock("@/middlewares/auth.middleware.ts", () => ({ verifyToken: (_req: unknown, _res: unknown, next: () => void) => next(), verifyRole: () => (_req: unknown, _res: unknown, next: () => void) => next(), justDecodeToken: (_req: unknown, _res: unknown, next: () => void) => next() }));
vi.mock("@/helpers/uploadImage.helper.ts", () => ({ default: { array: () => (_req: unknown, _res: unknown, next: () => void) => next() } }));

import { adminProductRouter, clientProductRouter } from "../../src/modules/products/api/products.routes.ts";

const app = createRouteContractApp("/products", clientProductRouter);
app.use("/admin/products", adminProductRouter);
const contracts: RouteContract[] = [
  { method: "get", path: "/products", handler: "getProductsPageList" },
  { method: "get", path: "/products/featured/ending-soon", handler: "getTopEndingSoonProducts" },
  { method: "get", path: "/products/featured/most-bids", handler: "getTopMostBidProducts" },
  { method: "get", path: "/products/featured/highest-price", handler: "getTopHighestPriceProducts" },
  { method: "get", path: "/products/me", handler: "getMyProductsList" },
  { method: "get", path: "/products/search?q=test", handler: "searchProducts" },
  { method: "get", path: "/products/1", handler: "getProductDetailBySlugId" },
  { method: "post", path: "/products", handler: "postNewProduct", body: { product_name: "Auction" } },
  { method: "patch", path: "/products/1/description", handler: "updateProductDescription", body: { description: "Updated" } },
  { method: "get", path: "/products/1/likes", handler: "getLoveStatus" },
  { method: "post", path: "/products/1/likes", handler: "updateLoveStatus" },
  { method: "get", path: "/products/1/questions", handler: "getProductQuestions" },
  { method: "post", path: "/products/1/questions", handler: "postProductQuestion", body: { question: "Still available?" } },
  { method: "get", path: "/products/1/winner", handler: "getProductDetailForWinner" },
  { method: "get", path: "/products/1/related", handler: "getRelatedProducts" },
  { method: "get", path: "/admin/products", handler: "list" },
  { method: "get", path: "/admin/products/count", handler: "calTotalProducts" },
  { method: "get", path: "/admin/products/1", handler: "detail" },
  { method: "patch", path: "/admin/products/1/status", handler: "deleteProduct" },
  { method: "patch", path: "/admin/products/1/restoration", handler: "restoreProduct" },
  { method: "delete", path: "/admin/products/1", handler: "destroyProduct" },
];

describe("products route contract", () => {
  it.each(contracts)("$method $path reaches $handler", async (contract) => {
    const response = await callRoute(app, contract);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ handler: contract.handler });
  });

  it("returns 404 for an unsupported product mutation", async () => {
    expect((await callRoute(app, { method: "delete", path: "/products/1", handler: "unused" })).status).toBe(404);
  });
});
