import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../../src/app.ts";
import { prisma } from "../../src/infrastructure/database/prisma.client.ts";
import { useIsolatedDatabase } from "../support/database.ts";
import { createUser } from "../support/fixtures.ts";

useIsolatedDatabase();
const app = createApp();

type SearchProductOverrides = {
  productName: string;
  description?: string;
  isRemoved?: boolean;
};

async function createSearchProduct(
  sellerId: number,
  { productName, description, isRemoved = false }: SearchProductOverrides,
) {
  return prisma.products.create({
    data: {
      product_name: productName,
      description,
      seller_id: BigInt(sellerId),
      start_price: 100n,
      current_price: 100n,
      step_price: 10n,
      start_time: new Date(Date.now() - 60_000),
      end_time: new Date(Date.now() + 60 * 60_000),
      product_images: [],
      is_removed: isRemoved,
      auction_status: "ACTIVE",
    },
  });
}

describe("product search API integration", () => {
  it("ranks exact names first and finds typo, description-only, and accent-insensitive matches", async () => {
    const seller = await createUser();
    const exact = await createSearchProduct(seller.user_id, {
      productName: "Vintage Camera",
      description: "Professional photography body",
    });
    const fuzzy = await createSearchProduct(seller.user_id, {
      productName: "Vintage Camra Bag",
      description: "Protective carrying case",
    });
    const descriptionOnly = await createSearchProduct(seller.user_id, {
      productName: "Collector bundle",
      description: "Includes a vintage camera manual and original receipt",
    });
    const removed = await createSearchProduct(seller.user_id, {
      productName: "Vintage Camera",
      isRemoved: true,
    });

    const ranked = await request(app)
      .get("/products")
      .query({ search: "Vintage Camera", status: "all", limit: 10 })
      .expect(200);

    const rankedIds = ranked.body.data.map((product: { product_id: string }) => product.product_id);
    expect(rankedIds[0]).toBe(exact.product_id.toString());
    expect(rankedIds).toContain(fuzzy.product_id.toString());
    expect(rankedIds).toContain(descriptionOnly.product_id.toString());
    expect(rankedIds).not.toContain(removed.product_id.toString());

    const typo = await request(app)
      .get("/products")
      .query({ search: "Vintage Camra", status: "all" })
      .expect(200);
    expect(typo.body.data.map((product: { product_id: string }) => product.product_id))
      .toContain(exact.product_id.toString());

    const accented = await createSearchProduct(seller.user_id, {
      productName: "Đồng hồ cổ điển",
    });
    const withoutAccents = await request(app)
      .get("/products")
      .query({ search: "dong ho", status: "all" })
      .expect(200);
    expect(withoutAccents.body.data.map((product: { product_id: string }) => product.product_id))
      .toContain(accented.product_id.toString());
  });

  it("returns stable pagination metadata for ranked results", async () => {
    const seller = await createUser();
    await Promise.all(
      Array.from({ length: 7 }, (_, index) =>
        createSearchProduct(seller.user_id, {
          productName: `Pagination Token item ${index + 1}`,
        }),
      ),
    );

    const response = await request(app)
      .get("/products")
      .query({ search: "Pagination Token", status: "all", page: 2, limit: 3 })
      .expect(200);

    expect(response.body.data).toHaveLength(3);
    expect(response.body.meta).toEqual({
      page: 2,
      limit: 3,
      total: 7,
      totalPages: 3,
    });
  });

  it("removes the obsolete search endpoint and provisions both search indexes", async () => {
    await request(app)
      .get("/products/search")
      .expect(404, {
        status: "error",
        message: "Product does not exist",
      });

    const indexes = await prisma.$queryRaw<Array<{ indexname: string }>>`
      SELECT indexname
      FROM pg_indexes
      WHERE schemaname = 'public'
        AND tablename = 'products'
        AND indexname IN ('products_fts', 'products_name_trgm')
      ORDER BY indexname
    `;
    expect(indexes.map(({ indexname }) => indexname)).toEqual([
      "products_fts",
      "products_name_trgm",
    ]);
  });
});
