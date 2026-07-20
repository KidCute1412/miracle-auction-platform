import { describe, expect, it, vi } from "vitest";
import type { Response } from "express";
import { callRoute, createRouteContractApp, type RouteContract } from "../support/route-contract.ts";

const dashboard = vi.hoisted(() => {
  const ok = (handler: string) => (_req: unknown, res: Response) => res.json({ handler });
  return { getSummary: ok("getSummary"), syncCache: ok("syncCache") };
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
];

describe("dashboard and settings route contract", () => {
  it.each(contracts)("$method $path reaches $handler", async (contract) => {
    const response = await callRoute(app, contract);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ handler: contract.handler });
  });
});
