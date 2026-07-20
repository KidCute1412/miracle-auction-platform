import { describe, expect, it, vi } from "vitest";
import type { Response } from "express";
import { callRoute, createRouteContractApp, type RouteContract } from "../support/route-contract.ts";

const client = vi.hoisted(() => {
  const ok = (handler: string) => (_req: unknown, res: Response) => res.json({ handler });
  return { registerSellerRequest: ok("registerSellerRequest"), rateUser: ok("rateUser"), getUserRatingCount: ok("getUserRatingCount"), getUserRatingHistory: ok("getUserRatingHistory") };
});
const admin = vi.hoisted(() => {
  const ok = (handler: string) => (_req: unknown, res: Response) => res.json({ handler });
  return { list: ok("list"), calNumberOfUsers: ok("calNumberOfUsers"), detail: ok("detail"), editRole: ok("editRole"), resetPassword: ok("resetPassword"), applications: ok("applications"), calTotalApplications: ok("calTotalApplications"), applicationDetail: ok("applicationDetail"), setStatus: ok("setStatus") };
});
vi.mock("../../src/modules/users/api/users.client.controller.ts", () => client);
vi.mock("../../src/modules/users/api/users.admin.controller.ts", () => admin);
vi.mock("@/middlewares/auth.middleware.ts", () => ({ verifyToken: (_req: unknown, _res: unknown, next: () => void) => next() }));

import { adminApplicationRouter, adminUserRouter, clientUserRouter } from "../../src/modules/users/api/users.routes.ts";

const app = createRouteContractApp("/users", clientUserRouter);
app.use("/admin/users", adminUserRouter);
app.use("/admin/seller-registrations", adminApplicationRouter);
const contracts: RouteContract[] = [
  { method: "post", path: "/users/seller-registrations", handler: "registerSellerRequest", body: { reason: "I sell collectibles" } },
  { method: "post", path: "/users/ratings", handler: "rateUser", body: { user_id: 2, rating: 1 } },
  { method: "get", path: "/users/ratings/count?user_id=1", handler: "getUserRatingCount" },
  { method: "get", path: "/users/ratings?user_id=1", handler: "getUserRatingHistory" },
  { method: "get", path: "/admin/users", handler: "list" },
  { method: "get", path: "/admin/users/count", handler: "calNumberOfUsers" },
  { method: "get", path: "/admin/users/1", handler: "detail" },
  { method: "patch", path: "/admin/users/1/role", handler: "editRole", body: { role: "seller" } },
  { method: "patch", path: "/admin/users/1/password", handler: "resetPassword", body: { password: "Password1!" } },
  { method: "get", path: "/admin/seller-registrations", handler: "applications" },
  { method: "get", path: "/admin/seller-registrations/count", handler: "calTotalApplications" },
  { method: "get", path: "/admin/seller-registrations/1", handler: "applicationDetail" },
  { method: "patch", path: "/admin/seller-registrations/1/status", handler: "setStatus", body: { status: "approved" } },
];

describe("users route contract", () => {
  it.each(contracts)("$method $path reaches $handler", async (contract) => {
    const response = await callRoute(app, contract);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ handler: contract.handler });
  });

  it("returns 404 for an unsupported ratings endpoint", async () => {
    expect((await callRoute(app, { method: "delete", path: "/users/ratings", handler: "unused" })).status).toBe(404);
  });
});
