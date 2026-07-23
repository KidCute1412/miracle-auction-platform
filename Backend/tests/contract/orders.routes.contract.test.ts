import { describe, expect, it, vi } from "vitest";
import type { Response } from "express";
import { callRoute, createRouteContractApp, type RouteContract } from "../support/route-contract.ts";

const controllers = vi.hoisted(() => {
  const ok = (handler: string) => (_req: unknown, res: Response) => res.json({ handler });
  return { createOrder: ok("createOrder"), getOrderDetail: ok("getOrderDetail"), getSellerOrderView: ok("getSellerOrderView"), rejectOrder: ok("rejectOrder"), approveOrder: ok("approveOrder") };
});
vi.mock("../../src/modules/orders/api/orders.controller.ts", () => controllers);
vi.mock("@/middlewares/auth.middleware.ts", () => ({ verifyToken: (_req: unknown, _res: unknown, next: () => void) => next() }));
vi.mock("@/helpers/uploadImage.helper.ts", () => ({ default: { single: () => (_req: unknown, _res: unknown, next: () => void) => next() } }));

import ordersRouter from "../../src/modules/orders/api/orders.routes.ts";

const app = createRouteContractApp("/orders", ordersRouter);
const contracts: RouteContract[] = [
  {
    method: "post",
    path: "/orders",
    handler: "createOrder",
    body: {
      public_order_id: "da74a956-ea91-4553-a04a-4fe915c87951",
      shipping_address: "1 Test Street",
      phone_number: "0900000000",
    },
  },
  { method: "get", path: "/orders?product_id=1", handler: "getOrderDetail" },
  { method: "get", path: "/orders/seller?product_id=1", handler: "getSellerOrderView" },
  { method: "patch", path: "/orders/1/rejection", handler: "rejectOrder", body: { reason: "Invalid proof" } },
  { method: "patch", path: "/orders/1/approval", handler: "approveOrder" },
];

describe("orders route contract", () => {
  it.each(contracts)("$method $path reaches $handler", async (contract) => {
    const response = await callRoute(app, contract);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ handler: contract.handler });
  });
});
