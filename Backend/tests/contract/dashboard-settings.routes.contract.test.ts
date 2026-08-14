import { describe, expect, it, vi } from "vitest";
import type { Response } from "express";
import { callRoute, createRouteContractApp, type RouteContract } from "../support/route-contract.ts";

const dashboard = vi.hoisted(() => {
  const ok = (handler: string) => (_req: unknown, res: Response) => res.json({ handler });
  return {
    getSummary: ok("getSummary"), syncCache: ok("syncCache"),
    getOperations: ok("getOperations"), getAuctionReconciliation: ok("getAuctionReconciliation"), getDlq: ok("getDlq"),
    retryDlq: ok("retryDlq"), exportCsv: ok("exportCsv"), getAuditLogs: ok("getAuditLogs"),
  };
});
const settings = vi.hoisted(() => ({ getAutoExtendTimeSetting: (_req: unknown, res: Response) => res.json({ handler: "getAutoExtendTimeSetting" }) }));
vi.mock("../../src/modules/dashboard/api/dashboard.controller.ts", () => dashboard);
vi.mock("../../src/modules/settings/api/settings.controller.ts", () => settings);

import { adminDashboardRouter } from "../../src/modules/dashboard/api/dashboard.routes.ts";
import settingsRouter from "../../src/modules/settings/api/settings.routes.ts";

const app = createRouteContractApp("/settings", settingsRouter);
app.use("/admin/dashboard", adminDashboardRouter);
const contracts: RouteContract[] = [
  { method: "get", path: "/settings/auto-extend-time", handler: "getAutoExtendTimeSetting" },
  { method: "get", path: "/admin/dashboard", handler: "getSummary" },
  { method: "post", path: "/admin/dashboard/sync", handler: "syncCache" },
  { method: "get", path: "/admin/dashboard/operations", handler: "getOperations" },
  { method: "get", path: "/admin/dashboard/operations/reconciliation?productId=42", handler: "getAuctionReconciliation" },
  { method: "get", path: "/admin/dashboard/dlq", handler: "getDlq" },
  { method: "post", path: `/admin/dashboard/dlq/123e4567-e89b-42d3-a456-426614174000/retry`, handler: "retryDlq" },
  { method: "get", path: "/admin/dashboard/export.csv?dataset=analytics&range=30d", handler: "exportCsv" },
];

describe("dashboard and settings route contract", () => {
  it.each(contracts)("$method $path reaches $handler", async (contract) => {
    const response = await callRoute(app, contract);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ handler: contract.handler });
  });
});

it("rejects an invalid reconciliation product ID before invoking the controller", async () => {
  const response = await callRoute(app, {
    method: "get",
    path: "/admin/dashboard/operations/reconciliation?productId=not-a-number",
    handler: "getAuctionReconciliation",
  });
  expect(response.status).toBe(400);
  expect(response.body.status).toBe("error");
});
