import request from "supertest";
import { beforeAll, describe, expect, it } from "vitest";
import { createApp } from "../../src/app.ts";
import { prisma } from "../../src/infrastructure/database/prisma.client.ts";
import { accessCookie, createAuction, createUser } from "../support/fixtures.ts";
import { useIsolatedDatabase } from "../support/database.ts";

useIsolatedDatabase();

const app = createApp();
async function csrfCookie() {
  const response = await request(app).get("/accounts/csrf");
  const cookie = response.headers["set-cookie"]?.[0];
  if (!cookie) throw new Error("CSRF endpoint did not set a cookie");
  return { token: response.body.token as string, cookie: cookie.split(";")[0] };
}
async function authenticatedRequest(user: { user_id: number; auth_version: number }) {
  const csrf = await csrfCookie();
  return { csrf, cookie: `${csrf.cookie}; ${accessCookie(user)}` };
}

beforeAll(() => {
  process.env.JWT_SECRET = "integration-access-secret";
  process.env.JWT_REFRESH_SECRET = "integration-refresh-secret";
  process.env.CSRF_SECRET = "integration-csrf-secret";
  process.env.CLIENT_URL = "http://localhost:5173";
});

describe("bids API integration", () => {
  it("places an authenticated valid bid and preserves its legacy response envelope", async () => {
    const seller = await createUser({ role: "seller" });
    const bidder = await createUser();
    const auction = await createAuction(seller.user_id);
    const auth = await authenticatedRequest(bidder);

    const response = await request(app).post("/bids")
      .set("Origin", process.env.CLIENT_URL!).set("x-csrf-token", auth.csrf.token).set("Cookie", auth.cookie)
      .set("Idempotency-Key", "place-bid-success").send({ product_id: Number(auction.product_id), max_price: "120" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "success" });
    await expect(prisma.bidding_history.count({ where: { product_id: auction.product_id } })).resolves.toBe(1);
  });

  it("rejects malformed and unauthorized bid requests before durable effects", async () => {
    const missingAuth = await request(app).post("/bids").send({ product_id: 1, max_price: 120 });
    expect(missingAuth.status).toBe(403); // CSRF is deliberately checked before authentication.

    const seller = await createUser({ role: "seller" });
    const bidder = await createUser();
    const auction = await createAuction(seller.user_id);
    const auth = await authenticatedRequest(bidder);
    const invalid = await request(app).post("/bids")
      .set("Origin", process.env.CLIENT_URL!).set("x-csrf-token", auth.csrf.token).set("Cookie", auth.cookie)
      .set("Idempotency-Key", "place-bid-invalid").send({ product_id: Number(auction.product_id), max_price: "105" });
    expect(invalid.status).toBe(400);
    expect(invalid.body).toMatchObject({ status: "error", message: "Invalid bid price" });
    await expect(prisma.bidding_history.count({ where: { product_id: auction.product_id } })).resolves.toBe(0);
    await expect(prisma.auction_outbox.count()).resolves.toBe(0);
  });

  it("returns bid history for a bidder and rejects an invalid history query", async () => {
    const seller = await createUser({ role: "seller" });
    const bidder = await createUser();
    const auction = await createAuction(seller.user_id);
    const auth = await authenticatedRequest(bidder);
    await request(app).post("/bids").set("Origin", process.env.CLIENT_URL!).set("x-csrf-token", auth.csrf.token).set("Cookie", auth.cookie)
      .set("Idempotency-Key", "place-bid-history").send({ product_id: Number(auction.product_id), max_price: "120" }).expect(200);

    const history = await request(app).get(`/bids?product_id=${auction.product_id}`).set("Cookie", auth.cookie);
    expect(history.status).toBe(200);
    expect(history.body).toMatchObject({ status: "success", isSeller: false });
    expect(history.body.data).toHaveLength(1);
    const invalid = await request(app).get("/bids?product_id=0").set("Cookie", auth.cookie);
    expect(invalid.status).toBe(400);
  });

  it("completes buy-now once and rejects the seller", async () => {
    const seller = await createUser({ role: "seller" });
    const buyer = await createUser();
    const auction = await createAuction(seller.user_id, { buy_now_price: 300 });
    const buyerAuth = await authenticatedRequest(buyer);
    const success = await request(app).post("/bids/purchase").set("Origin", process.env.CLIENT_URL!).set("x-csrf-token", buyerAuth.csrf.token).set("Cookie", buyerAuth.cookie)
      .set("Idempotency-Key", "buy-now-success").send({ product_id: Number(auction.product_id), buy_price: "300" });
    expect(success.status).toBe(200);
    expect(success.body).toMatchObject({ status: "success" });
    await expect(prisma.orders.count({ where: { product_id: auction.product_id } })).resolves.toBe(1);

    const second = await request(app).post("/bids/purchase").set("Origin", process.env.CLIENT_URL!).set("x-csrf-token", buyerAuth.csrf.token).set("Cookie", buyerAuth.cookie)
      .set("Idempotency-Key", "buy-now-second").send({ product_id: Number(auction.product_id), buy_price: "300" });
    expect(second.status).toBe(400);
  });

  it("allows the seller to ban a bidder and rejects a non-owner", async () => {
    const seller = await createUser({ role: "seller" });
    const bidder = await createUser();
    const stranger = await createUser();
    const auction = await createAuction(seller.user_id);
    const strangerAuth = await authenticatedRequest(stranger);
    const forbidden = await request(app).post("/bids/bans").set("Origin", process.env.CLIENT_URL!).set("x-csrf-token", strangerAuth.csrf.token).set("Cookie", strangerAuth.cookie)
      .set("Idempotency-Key", "ban-forbidden")
      .send({ product_id: Number(auction.product_id), banned_user_id: bidder.user_id, reason: "Not allowed" });
    expect(forbidden.status).toBe(403);

    const sellerAuth = await authenticatedRequest(seller);
    const success = await request(app).post("/bids/bans").set("Origin", process.env.CLIENT_URL!).set("x-csrf-token", sellerAuth.csrf.token).set("Cookie", sellerAuth.cookie)
      .set("Idempotency-Key", "ban-success")
      .send({ product_id: Number(auction.product_id), banned_user_id: bidder.user_id, reason: "Policy breach" });
    expect(success.status).toBe(200);
    expect(success.body).toMatchObject({ status: "success", data: { banned_user_id: bidder.user_id } });
  });

  it("lets only the winner update the projector-created public order", async () => {
    const seller = await createUser({ role: "seller" });
    const buyer = await createUser();
    const stranger = await createUser();
    const auction = await createAuction(seller.user_id, { buy_now_price: 300 });
    const buyerAuth = await authenticatedRequest(buyer);
    const purchase = await request(app).post("/bids/purchase")
      .set("Origin", process.env.CLIENT_URL!).set("x-csrf-token", buyerAuth.csrf.token).set("Cookie", buyerAuth.cookie)
      .set("Idempotency-Key", "checkout-buy-now")
      .send({ product_id: Number(auction.product_id), buy_price: "300" });
    const publicOrderId = purchase.body.order_id as string;
    expect(publicOrderId).toMatch(/^[0-9a-f-]{36}$/i);

    const strangerAuth = await authenticatedRequest(stranger);
    const forbidden = await request(app).post("/orders")
      .set("Origin", process.env.CLIENT_URL!).set("x-csrf-token", strangerAuth.csrf.token).set("Cookie", strangerAuth.cookie)
      .field("public_order_id", publicOrderId).field("shipping_address", "Wrong address").field("phone_number", "0900000000");
    expect(forbidden.status).toBe(404);

    const success = await request(app).post("/orders")
      .set("Origin", process.env.CLIENT_URL!).set("x-csrf-token", buyerAuth.csrf.token).set("Cookie", buyerAuth.cookie)
      .field("public_order_id", publicOrderId).field("shipping_address", "1 Test Street").field("phone_number", "0900000000");
    expect(success.status).toBe(200);
    await expect(prisma.orders.findUniqueOrThrow({ where: { public_order_id: publicOrderId } }))
      .resolves.toMatchObject({ user_id: buyer.user_id, shipping_address: "1 Test Street" });
  });
});
