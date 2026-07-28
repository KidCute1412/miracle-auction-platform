import { Prisma, type product_questions, type products } from "@prisma/client";
import { prisma } from "@/infrastructure/database/prisma.client.ts";

export type ProductFilter = { status?: string; creator?: string; dateFrom?: string; dateTo?: string; search?: string };
export type ProductRow = products & {
  fts: string | null;
  total_count?: bigint;
  price_owner_username?: string | null;
  price_owner_avatar?: string | null;
  price_owner_rating?: number | null;
  seller_username?: string | null;
  seller_avatar?: string | null;
  seller_rating?: number | null;
  creator_name?: string;
  seller_name?: string;
  user_id?: number;
  username?: string;
  full_name?: string;
  email?: string;
  content?: string | null;
};
type ProductQuestionRow = product_questions & { username: string | null; total_count?: bigint };

const PRODUCT_COLS = "product_id, created_at, product_name, seller_id, step_price, start_price, current_price, buy_now_price, price_owner_id, bid_turns, start_time, end_time, cat2_id, is_removed, description, product_images, auto_extended, edited_at, auction_end_email_sent, fts::text as fts";
const P_COLS = "p.product_id, p.created_at, p.product_name, p.seller_id, p.step_price, p.start_price, p.current_price, p.buy_now_price, p.price_owner_id, p.bid_turns, p.start_time, p.end_time, p.cat2_id, p.is_removed, p.description, p.product_images, p.auto_extended, p.edited_at, p.auction_end_email_sent, p.fts::text as fts";
const U_COLS = "u.user_id, u.username, u.full_name, u.email, u.password, u.address, u.role, u.date_of_birth, u.rating, u.rating_count, u.created_at, u.avatar, u.status, u.auth_version, u.fts::text as fts";

async function raw<T = ProductRow>(sql: string, params: unknown[] = []): Promise<{ rows: T[] }> {
  let processedSql = sql;
  processedSql = processedSql.replace(/\bu\.\*/gi, U_COLS);
  processedSql = processedSql.replace(/\bp\.\*/gi, P_COLS);
  processedSql = processedSql.replace(/\bselect\s+\*\s+from\s+products\b/gi, `select ${PRODUCT_COLS} from products`);

  let placeholderIndex = 0;
  const parameterizedSql = processedSql.replace(/\?/g, () => `$${++placeholderIndex}`);
  return { rows: await prisma.$queryRawUnsafe<T[]>(parameterizedSql, ...params) };
}

// Check if the product is in bidding duration
export async function isProductInBiddingTime(product_id: number): Promise<boolean> {
  const resultQuery = await raw(
    `select * from products where product_id = ? and start_time <= now() and end_time >= now()`,
    [product_id],
  );
  return resultQuery.rows[0] ? true : false;
}

// Check if product is extended time
export async function getProductForExtension(product_id: number) {
  const productQuery = await raw(`select * from products where auto_extended = true and product_id = ?`, [
    product_id,
  ]);
  return productQuery.rows[0] || null;
}

// Get extend bidding time setting parameters
export async function getExtendTimeSetting() {
  const settingQuery = await raw<{ extend_time: bigint | null; threshold_time: bigint | null }>(`select extend_time, threshold_time from extend_bidding_time limit 1`);
  return settingQuery.rows[0] || null;
}

// Update the end time of a product
export async function updateProductEndTime(product_id: number, newEndTime: Date): Promise<void> {
  await prisma.products.update({ where: { product_id: BigInt(product_id) }, data: { end_time: newEndTime } });
}

// Get seller details linked to product
export async function getSellerOfProduct(product_id: number) {
  const query = await raw(
    `select u.*, p.*
     from products p 
     join users u on p.seller_id = u.user_id
     where p.product_id = ?`,
    [product_id],
  );
  return query.rows[0] || null;
}

// Fetch detailed product by its ID
export async function getProductById(product_id: number) {
  const query = await raw(
    `SELECT 
       p.*, u1.username AS price_owner_username, u1.user_id AS price_owner_id, u1.avatar AS price_owner_avatar,
       u1.rating AS price_owner_rating,
       u2.username AS seller_username, u2.user_id AS seller_id, u2.avatar AS seller_avatar,
       u2.rating AS seller_rating
     FROM products p
     LEFT JOIN users u1 ON p.price_owner_id = u1.user_id
     LEFT JOIN users u2 on p.seller_id = u2.user_id
     WHERE p.product_id = ?`,
    [product_id],
  );
  return query.rows[0] || null;
}

import type { ProductCatalogFilterOptions } from "../application/product.use-case.ts";

// Query products catalog list with dynamic filtering, search, and sorting
export async function getProductsCatalogList(
  options: ProductCatalogFilterOptions,
  limit: number,
  offset: number,
) {
  const bindings: unknown[] = [];
  const whereClauses: string[] = ["p.is_removed = false"];

  if (options.cat2_id) {
    whereClauses.push("p.cat2_id = ?");
    bindings.push(options.cat2_id);
  } else if (options.cat1_id) {
    whereClauses.push("p.cat2_id IN (SELECT id FROM categories WHERE parent_id = ?)");
    bindings.push(options.cat1_id);
  }

  if (options.min_price !== undefined) {
    whereClauses.push("p.current_price >= ?");
    bindings.push(options.min_price);
  }
  if (options.max_price !== undefined) {
    whereClauses.push("p.current_price <= ?");
    bindings.push(options.max_price);
  }

  if (options.status === "active") {
    whereClauses.push("p.end_time > NOW()");
  } else if (options.status === "buy_now") {
    whereClauses.push("p.buy_now_price IS NOT NULL AND p.buy_now_price > 0 AND p.end_time > NOW()");
  } else if (options.status === "ended") {
    whereClauses.push("p.end_time <= NOW()");
  }

  if (options.search && options.search.trim() !== "") {
    const term = options.search.trim();
    // Pure PostgreSQL Trigram Fuzzy Search (pg_trgm + ILIKE with GIN index acceleration)
    whereClauses.push("(remove_accents(p.product_name) % remove_accents(?) OR remove_accents(p.product_name) ILIKE ? OR p.fts @@ websearch_to_tsquery('english', remove_accents(?)))");
    bindings.push(term, `%${term}%`, term);
  }

  let orderByClause = "p.end_time ASC";
  if (options.sort_by === "price_asc" || options.legacy_price === "asc") {
    orderByClause = "p.current_price ASC";
  } else if (options.sort_by === "price_desc" || options.legacy_price === "desc") {
    orderByClause = "p.current_price DESC";
  } else if (options.sort_by === "time_asc" || options.legacy_time === "asc") {
    orderByClause = "p.end_time ASC";
  } else if (options.sort_by === "time_desc" || options.legacy_time === "desc") {
    orderByClause = "p.end_time DESC";
  } else if (options.sort_by === "created_desc") {
    orderByClause = "p.created_at DESC";
  } else if (options.sort_by === "bids_desc") {
    orderByClause = "COALESCE(p.bid_turns, 0) DESC";
  }

  bindings.push(limit, offset);

  const query = await raw(
    `SELECT p.*, u.username AS price_owner_username, count(*) OVER() AS total_count
     FROM products p
     LEFT JOIN users u ON p.price_owner_id = u.user_id
     WHERE ${whereClauses.join(" AND ")}
     ORDER BY ${orderByClause}
     LIMIT ? OFFSET ?`,
    bindings,
  );
  return query.rows;
}

// Query client products page view list (legacy positional wrapper)
export async function getProductsPageList(
  cat2_id: number,
  limit: number,
  offset: number,
  orderBy: string[],
  searchKeyword: string,
) {
  let legacy_price: string | undefined;
  let legacy_time: string | undefined;
  if (orderBy.includes("p.current_price ASC")) legacy_price = "asc";
  else if (orderBy.includes("p.current_price DESC")) legacy_price = "desc";
  if (orderBy.includes("p.end_time ASC")) legacy_time = "asc";
  else if (orderBy.includes("p.end_time DESC")) legacy_time = "desc";

  return getProductsCatalogList(
    {
      cat2_id: cat2_id || undefined,
      search: searchKeyword,
      page: offset / limit + 1,
      limit,
      legacy_price,
      legacy_time,
    },
    limit,
    offset,
  );
}

// Fetch favorite user love products list
export async function getMyFavoriteProducts(user_id: number, limit: number, offset: number) {
  const query = await raw(
    `select p.*, u.username as price_owner_username, count(*) over() as total_count
     from products p
     left join love_products lp on p.product_id = lp.product_id
     left join users u on p.price_owner_id = u.user_id
     where lp.user_id = ?
     order by p.created_at desc
     limit ? offset ?`,
    [user_id, limit, offset],
  );
  return query.rows;
}

// Fetch user active selling products
export async function getMySellingProducts(user_id: number, limit: number, offset: number) {
  const query = await raw(
    `select p.*, u.username as price_owner_username, count(*) over() as total_count
     from products p
     left join users u on p.price_owner_id = u.user_id
     where p.seller_id = ? and p.end_time > now()
     order by p.created_at desc
     limit ? offset ?`,
    [user_id, limit, offset],
  );
  return query.rows;
}

// Fetch user sold product list
export async function getMySoldProducts(user_id: number, limit: number, offset: number) {
  const query = await raw(
    `select p.*, u.username as price_owner_username, count(*) over() as total_count
     from products p
     left join users u on p.price_owner_id = u.user_id
     where p.seller_id = ? and p.end_time < now() and p.price_owner_id is not null
     order by p.created_at desc
     limit ? offset ?`,
    [user_id, limit, offset],
  );
  return query.rows;
}

// Fetch user won product list
export async function getMyWonProducts(user_id: number, limit: number, offset: number) {
  const query = await raw(
    `select p.*, u.username as price_owner_username, count(*) over() as total_count
     from products p
     left join users u on p.price_owner_id = u.user_id
     where p.price_owner_id = ? and p.end_time < now()
     order by p.created_at desc
     limit ? offset ?`,
    [user_id, limit, offset],
  );
  return query.rows;
}

// Fetch products client is currently bidding on
export async function getMyBiddingProducts(user_id: number, limit: number, offset: number) {
  const query = await raw(
    `SELECT p.*, u.username AS price_owner_username, count(*) OVER() AS total_count
     FROM products p
     LEFT JOIN users u ON p.price_owner_id = u.user_id
     WHERE p.end_time > NOW()
       AND p.product_id IN (
           SELECT DISTINCT product_id
           FROM bidding_history
           WHERE user_id = ? AND user_id != p.seller_id
       )
     ORDER BY p.created_at DESC
     LIMIT ? OFFSET ?`,
    [user_id, limit, offset],
  );
  return query.rows;
}

// Fetch product inventory of unsold items
export async function getMyInventoryProducts(user_id: number, limit: number, offset: number) {
  const query = await raw(
    `select p.*, u.username as price_owner_username, count(*) over() as total_count
     from products p
     left join users u on p.price_owner_id = u.user_id
     where p.seller_id = ? and p.end_time < now() and p.price_owner_id is null
     order by p.created_at desc
     limit ? offset ?`,
    [user_id, limit, offset],
  );
  return query.rows;
}

// Fetch name of product to validate slug matching
export async function getProductNameById(product_id: string): Promise<string | null> {
  if (!/^\d+$/.test(product_id)) return null;
  const queryName = await raw<{ product_name: string | null }>(`SELECT product_name FROM products WHERE product_id = ?`, [BigInt(product_id)]);
  return queryName.rows[0]?.product_name || null;
}

// Insert new product details
export async function postNewProduct(productData: Prisma.productsUncheckedCreateInput) {
  return prisma.products.create({ data: productData });
}

// Search products using text index matching
export async function searchProducts(query: string, limit: number, offset: number) {
  const productsQuery = await raw(
    `SELECT p.*, u.username AS price_owner_username, count(*) OVER() AS total_count
     FROM products p
     LEFT JOIN users u ON p.price_owner_id = u.user_id
     WHERE p.fts @@ websearch_to_tsquery('english', remove_accents(?))
     ORDER BY p.product_id DESC
     LIMIT ? OFFSET ?`,
    [query, limit, offset],
  );
  return productsQuery.rows;
}

// Fetch love stats details
export async function getLoveStatus(user_id: number | null, product_id: number) {
  const query = await raw<{ total_loves: number; is_loved: boolean }>(
    `SELECT 
       (SELECT COUNT(*)::int FROM love_products WHERE product_id = ?) as total_loves,
       EXISTS(
         SELECT 1 FROM love_products 
         WHERE user_id = ? AND product_id = ?
       ) as is_loved`,
    [product_id, user_id, product_id],
  );
  return query.rows[0];
}

// Check if product is loved by user
export async function checkProductIsLoved(user_id: number, product_id: number): Promise<boolean> {
  const currentStatusQuery = await raw<{ is_loved: boolean }>(
    `select exists (
       select 1 
       from love_products 
       where user_id = ? and product_id = ?
     ) as is_loved`,
    [user_id, product_id],
  );
  return currentStatusQuery.rows[0].is_loved;
}

// Add product to user favorites list
export async function loveProduct(user_id: number, product_id: number): Promise<void> {
  await prisma.love_products.create({ data: { user_id, product_id: BigInt(product_id) } });
}

// Remove product from user favorites list
export async function unloveProduct(user_id: number, product_id: number): Promise<void> {
  await prisma.love_products.deleteMany({ where: { user_id, product_id: BigInt(product_id) } });
}

// Retrieve QA list for product
export async function getProductQuestions(product_id: number, limit: number, offset: number) {
  const query = await raw<ProductQuestionRow>(
    `WITH ParentQuestions AS (
         SELECT pq.*, u.username, u.user_id
         FROM product_questions pq 
         LEFT JOIN users u ON pq.user_id = u.user_id
         WHERE pq.product_id = ? AND pq.question_parent_id IS NULL
         ORDER BY pq.created_at DESC
         LIMIT ? OFFSET ?
     ),
     TotalCount AS (
         SELECT count(*) as full_count 
         FROM product_questions 
         WHERE product_id = ? AND question_parent_id IS NULL
     )
     SELECT res.*, tc.full_count as total_count
     FROM (
         SELECT pq.*, u.username, u.user_id
         FROM product_questions pq
         LEFT JOIN users u ON pq.user_id = u.user_id
         WHERE pq.question_parent_id IN (SELECT question_id FROM ParentQuestions)
         
         UNION ALL
         
         SELECT * FROM ParentQuestions
     ) res
     CROSS JOIN TotalCount tc
     ORDER BY res.created_at DESC;`,
    [product_id, limit, offset, product_id],
  );
  return query.rows;
}

// Insert product question or answer
export async function postProductQuestion(insertData: Prisma.product_questionsUncheckedCreateInput) {
  const newQuestion = await prisma.product_questions.create({ data: insertData });
  const query = await raw<ProductQuestionRow>(
    `SELECT pq.*, u.username, u.user_id
     FROM product_questions pq
     LEFT JOIN users u ON pq.user_id = u.user_id
     WHERE pq.question_id = ?`,
    [newQuestion.question_id],
  );
  return query.rows[0];
}

// Fetch user data linked to parent question
export async function getUserInParentQuestion(question_parent_id: number) {
  const query = await raw(
    `SELECT u.*, pq.content
     FROM product_questions pq
     LEFT JOIN users u ON pq.user_id = u.user_id
     WHERE pq.question_id = ?`,
    [question_parent_id],
  );
  return query.rows[0] || null;
}

// Fetch category related product recommendations
export async function getRelatedProducts(category_id: number, product_id: number | null, limit: number) {
  const query = await raw(
    `SELECT p.*, u.username AS price_owner_username
     FROM products p
     LEFT JOIN users u ON p.price_owner_id = u.user_id
     WHERE p.cat2_id = ?
         AND p.product_id != COALESCE(?, 1)
         AND p.is_removed = FALSE
     ORDER BY RANDOM()
     LIMIT ?`,
    [category_id, product_id, limit],
  );
  return query.rows;
}

// Check if user is the seller of the product
export async function verifyProductSeller(product_id: number, seller_id: number): Promise<boolean> {
  const productQuery = await raw(`SELECT 1 FROM products WHERE product_id = ? AND seller_id = ?`, [
    product_id,
    seller_id,
  ]);
  return productQuery.rows.length > 0;
}

// Update the product description
export async function updateProductDescription(product_id: number, new_description: string): Promise<void> {
  await prisma.products.update({ where: { product_id: BigInt(product_id) }, data: { description: new_description } });
}

// Fetch product listing matching admin filter settings
export const getProductWithOffsetLimit = async (
  offset: number,
  limit: number,
  filter: ProductFilter,
  is_removed: boolean = false,
) => {
  const conditions: Prisma.Sql[] = [Prisma.sql`is_removed = ${is_removed}`];
  if (filter?.creator) conditions.push(Prisma.sql`CAST(seller_id AS text) ILIKE ${`%${filter.creator}%`}`);
  if (filter?.dateFrom?.trim()) conditions.push(Prisma.sql`start_time::date >= ${filter.dateFrom}::date`);
  if (filter?.dateTo?.trim()) conditions.push(Prisma.sql`start_time::date <= ${filter.dateTo}::date`);
  if (filter?.search) conditions.push(Prisma.sql`fts @@ websearch_to_tsquery('english', remove_accents(${filter.search}))`);
  return prisma.$queryRaw<ProductRow[]>(Prisma.sql`SELECT product_id, created_at, product_name, seller_id, step_price, start_price, current_price, buy_now_price, price_owner_id, bid_turns, start_time, end_time, cat2_id, is_removed, description, product_images, auto_extended, edited_at, auction_end_email_sent, fts::text as fts FROM products WHERE ${Prisma.join(conditions, " AND ")} ORDER BY product_id ASC OFFSET ${offset} LIMIT ${limit}`);
};

// Calculate total product listing matching admin parameters
export const calTotalProducts = async (filter: ProductFilter = {}, is_removed: boolean = false) => {
  const conditions: Prisma.Sql[] = [Prisma.sql`is_removed = ${is_removed}`];
  if (filter?.status && filter.status !== "all") conditions.push(Prisma.sql`is_removed = ${filter.status === "true"}`);
  if (filter?.creator) conditions.push(Prisma.sql`CAST(seller_id AS text) ILIKE ${`%${filter.creator}%`}`);
  if (filter?.dateFrom?.trim()) conditions.push(Prisma.sql`start_time::date >= ${filter.dateFrom}::date`);
  if (filter?.dateTo?.trim()) conditions.push(Prisma.sql`start_time::date <= ${filter.dateTo}::date`);
  if (filter?.search) conditions.push(Prisma.sql`fts @@ websearch_to_tsquery('english', remove_accents(${filter.search}))`);
  const result = await prisma.$queryRaw<Array<{ total: bigint }>>(Prisma.sql`SELECT count(*) AS total FROM products WHERE ${Prisma.join(conditions, " AND ")}`);
  return Number(result[0]?.total ?? 0n);
};

// Delete a product by its ID
export async function deleteProductById(product_id: number): Promise<void> {
  await prisma.products.update({ where: { product_id: BigInt(product_id) }, data: { is_removed: true } });
}

// Restore removed product by ID
export async function restoreProductById(product_id: number): Promise<void> {
  await prisma.products.update({ where: { product_id: BigInt(product_id) }, data: { is_removed: false } });
}

// Permanently destroy product item from DB
export async function destroyProductById(product_id: number): Promise<void> {
  await prisma.products.delete({ where: { product_id: BigInt(product_id) } });
}

// Fetch details for winner view
export async function getProductDetailForWinner(product_id: number, winner_id: number) {
  return prisma.products.findFirst({ where: { product_id: BigInt(product_id), price_owner_id: BigInt(winner_id), end_time: { lt: new Date() } } });
}

// Fetch top products sorted by current price descending
export async function fetchTopHighestPriceProducts(limit: number) {
  const query = await raw(
    `SELECT 
       p.*, u1.username AS price_owner_username, u1.user_id AS price_owner_id,
       u1.rating AS price_owner_rating,
       u2.username AS seller_username, u2.user_id AS seller_id,
       u2.rating AS seller_rating
     FROM products p
     LEFT JOIN users u1 ON p.price_owner_id = u1.user_id
     LEFT JOIN users u2 on p.seller_id = u2.user_id
     where p.is_removed = false
     ORDER BY p.current_price DESC
     LIMIT ?`,
    [limit],
  );
  return query.rows;
}

// Fetch top products sorted by bid counts descending
export async function fetchTopMostBidProducts(limit: number) {
  const query = await raw(
    `SELECT 
       p.*, u1.username AS price_owner_username, u1.user_id AS price_owner_id,
       u1.rating AS price_owner_rating,
       u2.username AS seller_username, u2.user_id AS seller_id,
       u2.rating AS seller_rating
     FROM products p
     LEFT JOIN users u1 ON p.price_owner_id = u1.user_id
     LEFT JOIN users u2 on p.seller_id = u2.user_id
     where p.is_removed = false
     ORDER BY COALESCE(p.bid_turns, 0) DESC
     LIMIT ?`,
    [limit],
  );
  return query.rows;
}

// Fetch active products ending soon sorted by end time ascending
export async function fetchTopEndingSoonProducts(limit: number) {
  const query = await raw(
    `SELECT 
       p.*, u1.username AS price_owner_username, u1.user_id AS price_owner_id,
       u1.rating AS price_owner_rating,
       u2.username AS seller_username, u2.user_id AS seller_id,
       u2.rating AS seller_rating
     FROM products p
     LEFT JOIN users u1 ON p.price_owner_id = u1.user_id
     LEFT JOIN users u2 on p.seller_id = u2.user_id
     where p.is_removed = false and p.end_time > NOW()
     ORDER BY p.end_time ASC
     LIMIT ?`,
    [limit],
  );
  return query.rows;
}

// Count products under a list of category IDs
export async function countProductsByCategories(categoryIds: number[]): Promise<number> {
  if (categoryIds.length === 0) return 0;
  const query = await raw<{ count: bigint }>(`SELECT COUNT(*) as count FROM products WHERE cat2_id = ANY(?)`, [categoryIds]);
  return Number(query.rows[0].count);
}
