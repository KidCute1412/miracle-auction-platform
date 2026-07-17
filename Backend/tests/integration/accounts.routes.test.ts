import { describe, expect, it, vi } from "vitest";
import { callRoute, createRouteContractApp, type RouteContract } from "../support/route-contract.ts";

const controllers = vi.hoisted(() => {
  const ok = (handler: string) => (_req: unknown, res: any) => res.status(200).json({ handler });
  return {
    registerPost: ok("registerPost"), verifyAccount: ok("verifyAccount"),
    registerVerifyPost: ok("registerVerifyPost"), forgotPasswordVerify: ok("forgotPasswordVerify"),
    forgotPassword: ok("forgotPassword"), resetPassword: ok("resetPassword"),
    changePassword: ok("changePassword"), verifyChangePassword: ok("verifyChangePassword"),
    loginPost: ok("loginPost"), googleLoginPost: ok("googleLoginPost"),
    refreshSession: ok("refreshSession"), logoutPost: ok("logoutPost"),
  };
});

vi.mock("../../src/modules/accounts/api/accounts.controller.ts", () => controllers);
vi.mock("@/middlewares/auth.middleware.ts", () => ({
  verifyToken: (_req: unknown, _res: unknown, next: () => void) => next(),
}));

import accountsRouter from "../../src/modules/accounts/api/accounts.routes.ts";

const app = createRouteContractApp("/accounts", accountsRouter);
const contracts: RouteContract[] = [
  { method: "post", path: "/accounts", handler: "registerPost", body: { full_name: "Test User", email: "test@example.com", password: "Password1!", agree: true } },
  { method: "get", path: "/accounts/verification", handler: "verifyAccount" },
  { method: "post", path: "/accounts/registration/verification", handler: "registerVerifyPost", body: { otp: "123456" } },
  { method: "patch", path: "/accounts/password/recovery/verification", handler: "forgotPasswordVerify", body: { otp: "123456" } },
  { method: "post", path: "/accounts/password/recovery", handler: "forgotPassword", body: { email: "test@example.com" } },
  { method: "put", path: "/accounts/password", handler: "resetPassword", body: { email: "test@example.com", password: "Password1!" } },
  { method: "patch", path: "/accounts/password", handler: "changePassword", body: { currentPassword: "Password1!", newPassword: "Password2!" } },
  { method: "post", path: "/accounts/password/verification", handler: "verifyChangePassword", body: { otp: "123456" } },
  { method: "post", path: "/accounts/sessions", handler: "loginPost", body: { email: "test@example.com", password: "Password1!", captchaToken: "test-captcha" } },
  { method: "post", path: "/accounts/sessions/google", handler: "googleLoginPost", body: { credential: "test-google-token" } },
  { method: "post", path: "/accounts/sessions/refresh", handler: "refreshSession" },
  { method: "delete", path: "/accounts/sessions", handler: "logoutPost" },
];

describe("route contract: accounts", () => {
  it("GET /accounts/csrf issues a CSRF token", async () => {
    process.env.CSRF_SECRET = "test-csrf-secret";
    const response = await callRoute(app, { method: "get", path: "/accounts/csrf", handler: "csrf" });
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ code: "success" });
    expect(response.body.token).toEqual(expect.any(String));
  });

  it.each(contracts)("$method $path reaches $handler", async (contract) => {
    const response = await callRoute(app, contract);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ handler: contract.handler });
  });

  it.each([
    ["register", "post", "/accounts", {}],
    ["login", "post", "/accounts/sessions", { email: "bad", password: "short" }],
    ["Google login", "post", "/accounts/sessions/google", {}],
    ["password reset", "put", "/accounts/password", {}],
  ] as const)("rejects invalid %s input before the controller", async (_name, method, path, body) => {
    const response = await callRoute(app, { method, path, handler: "unused", body });
    expect(response.status).toBe(200); // Legacy validators return HTTP 200 with an error envelope.
    expect(response.body.code).toBe("error");
  });
});
