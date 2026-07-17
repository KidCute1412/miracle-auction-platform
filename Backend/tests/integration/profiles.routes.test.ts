import { describe, expect, it, vi } from "vitest";
import { callRoute, createRouteContractApp, type RouteContract } from "../support/route-contract.ts";

const controllers = vi.hoisted(() => {
  const ok = (handler: string) => (_req: unknown, res: any) => res.json({ handler });
  return { getMeInfo: ok("getMeInfo"), editUserProfile: ok("editUserProfile"), getUserProfileDetail: ok("getUserProfileDetail") };
});
vi.mock("../../src/modules/profiles/api/profiles.controller.ts", () => controllers);
vi.mock("@/middlewares/auth.middleware.ts", () => ({ verifyToken: (_req: unknown, _res: unknown, next: () => void) => next(), justDecodeToken: (_req: unknown, _res: unknown, next: () => void) => next() }));
vi.mock("@/helpers/uploadImage.helper.ts", () => ({ default: { single: () => (_req: unknown, _res: unknown, next: () => void) => next() } }));

import { profileRouter } from "../../src/modules/profiles/api/profiles.routes.ts";

const app = createRouteContractApp("/profiles", profileRouter);
const contracts: RouteContract[] = [
  { method: "get", path: "/profiles/me", handler: "getMeInfo" },
  { method: "patch", path: "/profiles/me", handler: "editUserProfile", body: { full_name: "Updated User" } },
  { method: "get", path: "/profiles/1", handler: "getUserProfileDetail" },
];

describe("route contract: profiles", () => {
  it.each(contracts)("$method $path reaches $handler", async (contract) => {
    const response = await callRoute(app, contract);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ handler: contract.handler });
  });
});
