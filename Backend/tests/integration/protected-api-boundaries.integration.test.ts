import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../../src/app.ts";

const app = createApp();

const authenticatedReads = [
  "/bids?product_id=1",
  "/products/me",
  "/products/1/winner",
  "/profiles/me",
  "/orders",
  "/orders/seller",
  "/admin/dashboard",
  "/admin/categories",
  "/admin/seller-registrations",
  "/admin/users",
  "/admin/products",
] as const;

const csrfProtectedWrites = [
  { method: "post", path: "/bids", body: { product_id: 1, max_price: "100" } },
  { method: "post", path: "/products/1/likes", body: {} },
  { method: "post", path: "/users/ratings", body: { user_id: 1, rating: 1 } },
  { method: "post", path: "/users/seller-registrations", body: {} },
  { method: "post", path: "/orders", body: {} },
  { method: "patch", path: "/profiles/me", body: {} },
  { method: "post", path: "/admin/categories", body: {} },
] as const;

describe("protected API boundaries integration", () => {
  it.each(authenticatedReads)("GET %s rejects a request without an access token", async (path) => {
    const response = await request(app).get(path);
    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({ message: "Access token is missing" });
  });

  it.each(csrfProtectedWrites)("$method $path rejects a state-changing request without CSRF", async ({ method, path, body }) => {
    const response = await request(app)[method](path).send(body);
    expect(response.status).toBe(403);
    expect(response.body).toEqual({ code: "error", message: "Invalid CSRF token" });
  });
});
