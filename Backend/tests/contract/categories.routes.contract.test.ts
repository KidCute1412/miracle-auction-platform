import { describe, expect, it, vi } from "vitest";
import type { Response } from "express";
import { callRoute, createRouteContractApp, type RouteContract } from "../support/route-contract.ts";

const client = vi.hoisted(() => {
  const ok = (handler: string) => (_req: unknown, res: Response) => res.json({ handler });
  return { getAllCategoriesLv1: ok("getAllCategoriesLv1"), getAllCategoriesLv2: ok("getAllCategoriesLv2"), getCategoryLv2ById: ok("getCategoryLv2ById"), getAll: ok("getAll") };
});
const admin = vi.hoisted(() => {
  const ok = (handler: string) => (_req: unknown, res: Response) => res.json({ handler });
  return { buildTree: ok("buildTree"), calTotalCategories: ok("calTotalCategories"), getCreators: ok("getCreators"), list: ok("list"), edit: ok("edit"), createPost: ok("createPost"), editPatch: ok("editPatch"), deleteCategory: ok("deleteCategory"), restoreCategory: ok("restoreCategory"), destroyCategory: ok("destroyCategory") };
});
vi.mock("../../src/modules/categories/api/categories.client.controller.ts", () => client);
vi.mock("../../src/modules/categories/api/categories.admin.controller.ts", () => admin);

import { adminCategoryRouter, clientCategoryRouter } from "../../src/modules/categories/api/categories.routes.ts";

const app = createRouteContractApp("/categories", clientCategoryRouter);
app.use("/admin/categories", adminCategoryRouter);
const contracts: RouteContract[] = [
  { method: "get", path: "/categories/level/1", handler: "getAllCategoriesLv1" },
  { method: "get", path: "/categories/level/2", handler: "getAllCategoriesLv2" },
  { method: "get", path: "/categories/level/2/1", handler: "getCategoryLv2ById" },
  { method: "get", path: "/categories", handler: "getAll" },
  { method: "get", path: "/admin/categories/tree", handler: "buildTree" },
  { method: "get", path: "/admin/categories/count", handler: "calTotalCategories" },
  { method: "get", path: "/admin/categories/creators", handler: "getCreators" },
  { method: "get", path: "/admin/categories", handler: "list" },
  { method: "get", path: "/admin/categories/1", handler: "edit" },
  { method: "post", path: "/admin/categories", handler: "createPost", body: { name: "Category" } },
  { method: "patch", path: "/admin/categories/1", handler: "editPatch", body: { name: "Updated" } },
  { method: "patch", path: "/admin/categories/1/status", handler: "deleteCategory" },
  { method: "patch", path: "/admin/categories/1/restoration", handler: "restoreCategory" },
  { method: "delete", path: "/admin/categories/1", handler: "destroyCategory" },
];

describe("categories route contract", () => {
  it.each(contracts)("$method $path reaches $handler", async (contract) => {
    const response = await callRoute(app, contract);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ handler: contract.handler });
  });

  it("returns 404 for a mistyped category endpoint", async () => {
    expect((await callRoute(app, { method: "get", path: "/categories/levels/1", handler: "unused" })).status).toBe(404);
  });
});
