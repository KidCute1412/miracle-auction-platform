import { describe, expect, it, vi } from "vitest";
import { callRoute, createRouteContractApp } from "../support/route-contract.ts";

const repoMock = vi.hoisted(() => ({
  getProductsCatalogList: vi.fn().mockResolvedValue([{ product_id: 1, product_name: "Rolex Submariner", total_count: "1" }]),
}));

vi.mock("@/modules/products/infrastructure/product.repository.ts", () => repoMock);
vi.mock("../../src/modules/products/infrastructure/product.repository.ts", () => repoMock);
vi.mock("@/middlewares/auth.middleware.ts", () => ({
  verifyToken: (_req: unknown, _res: unknown, next: () => void) => next(),
  verifyRole: () => (_req: unknown, _res: unknown, next: () => void) => next(),
  justDecodeToken: (_req: unknown, _res: unknown, next: () => void) => next(),
}));

import { clientProductRouter } from "../../src/modules/products/api/products.routes.ts";

const app = createRouteContractApp("/products", clientProductRouter);

describe("GET /products query validation", () => {
  it("accepts valid catalog filter parameters and returns standard response envelope", async () => {
    const res = await callRoute(app, {
      method: "get",
      path: "/products?search=watch&cat1_id=2&min_price=100000&max_price=5000000&status=active&sort_by=price_asc&page=1&limit=10",
      handler: "getProductsPageList",
    });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
    expect(res.body.meta).toEqual({
      page: 1,
      limit: 10,
      total: 1,
      totalPages: 1,
    });
    expect(repoMock.getProductsCatalogList).toHaveBeenCalledWith(
      expect.objectContaining({
        search: "watch",
        cat1_id: 2,
        min_price: 100000,
        max_price: 5000000,
        status: "active",
        sort_by: "price_asc",
        page: 1,
        limit: 10,
      }),
      10,
      0,
    );
  });

  it("rejects invalid status filter parameter with 400 error", async () => {
    const res = await callRoute(app, {
      method: "get",
      path: "/products?status=invalid_status",
      handler: "getProductsPageList",
    });

    expect(res.status).toBe(400);
    expect(res.body.status).toBe("error");
    expect(res.body.message).toBe("Invalid query parameters");
  });

  it("rejects negative min_price parameter with 400 error", async () => {
    const res = await callRoute(app, {
      method: "get",
      path: "/products?min_price=-500",
      handler: "getProductsPageList",
    });

    expect(res.status).toBe(400);
    expect(res.body.status).toBe("error");
  });
});
