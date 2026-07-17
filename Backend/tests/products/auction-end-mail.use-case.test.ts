import { beforeEach, describe, expect, it, vi } from "vitest";

const prisma = vi.hoisted(() => ({
  users: { findUnique: vi.fn() }, products: { findMany: vi.fn(), update: vi.fn() }, $queryRaw: vi.fn(),
}));
const mail = vi.hoisted(() => ({
  sendMail: vi.fn(), getWinnerEmailTemplate: vi.fn(() => "winner"), getSellerWithWinnerEmailTemplate: vi.fn(() => "seller-winner"),
  getSellerNoWinnerEmailTemplate: vi.fn(() => "seller-no-winner"), getLoserEmailTemplate: vi.fn(() => "loser"),
}));
vi.mock("@/infrastructure/database/prisma.client.ts", () => ({ prisma }));
vi.mock("@/helpers/mail.helper.ts", () => mail);

import { getExpiredProductsNeedingEmail, markAuctionEmailSent, processAuctionEndNotification, sendSellerNoWinnerEmail, sendSellerWithWinnerEmail, sendWinnerEmail } from "../../src/modules/products/application/auction-end-mail.use-case.ts";

const product = { product_id: 1, product_name: "Vintage Watch", current_price: 120, price_owner_id: 2, seller_id: 1 };
const seller = { user_id: 1, username: "seller", email: "seller@example.com" };
const winner = { user_id: 2, username: "winner", email: "winner@example.com" };

describe("auction end mail use cases", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mail.sendMail.mockResolvedValue(true);
    vi.spyOn(console, "error").mockImplementation(() => undefined);
  });

  it("sends winner and seller notification variants", async () => {
    await expect(sendWinnerEmail(winner, product)).resolves.toBe(true);
    await expect(sendSellerWithWinnerEmail(seller, product, winner)).resolves.toBe(true);
    await expect(sendSellerNoWinnerEmail(seller, { ...product, price_owner_id: null })).resolves.toBe(true);
    expect(mail.sendMail).toHaveBeenCalledTimes(3);
  });

  it("maps a mail provider failure to false", async () => {
    mail.sendMail.mockRejectedValueOnce(new Error("provider offline"));
    await expect(sendWinnerEmail(winner, product)).resolves.toBe(false);
  });

  it("processes auctions both with and without a winner", async () => {
    prisma.users.findUnique.mockResolvedValueOnce(seller).mockResolvedValueOnce(winner);
    prisma.$queryRaw.mockResolvedValue([]);
    await expect(processAuctionEndNotification(product)).resolves.toBe(true);
    prisma.users.findUnique.mockResolvedValueOnce(seller);
    await expect(processAuctionEndNotification({ ...product, price_owner_id: null })).resolves.toBe(true);
  });

  it("returns false when the seller cannot be found", async () => {
    prisma.users.findUnique.mockResolvedValue(null);
    await expect(processAuctionEndNotification(product)).resolves.toBe(false);
  });

  it("maps expired Prisma rows and ignores products without names", async () => {
    prisma.products.findMany.mockResolvedValue([
      { product_id: 1n, product_name: "Watch", current_price: 120, price_owner_id: 2n, seller_id: 3n },
      { product_id: 2n, product_name: null, current_price: 10, price_owner_id: null, seller_id: 3n },
    ]);
    await expect(getExpiredProductsNeedingEmail(10)).resolves.toEqual([{ product_id: 1, product_name: "Watch", current_price: 120, price_owner_id: 2, seller_id: 3 }]);
  });

  it("marks a product as notified and reports database failure", async () => {
    prisma.products.update.mockResolvedValueOnce({}).mockRejectedValueOnce(new Error("database offline"));
    await expect(markAuctionEmailSent(1)).resolves.toBe(true);
    await expect(markAuctionEmailSent(1)).resolves.toBe(false);
  });
});
