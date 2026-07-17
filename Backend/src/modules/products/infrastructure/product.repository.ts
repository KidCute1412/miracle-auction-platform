import db from "@/config/database.config.ts";

// Check if the product is in bidding duration
export async function isProductInBiddingTime(product_id: number): Promise<boolean> {
  const resultQuery = await db.raw(
    `select * from products where product_id = ? and start_time <= now() and end_time >= now()`,
    [product_id],
  );
  return resultQuery.rows[0] ? true : false;
}

// Check if product is extended time
export async function getProductForExtension(product_id: number) {
  const productQuery = await db.raw(`select * from products where auto_extended = true and product_id = ?`, [
    product_id,
  ]);
  return productQuery.rows[0] || null;
}

// Get extend bidding time setting parameters
export async function getExtendTimeSetting() {
  const settingQuery = await db.raw(`select extend_time, threshold_time from extend_bidding_time limit 1`);
  return settingQuery.rows[0] || null;
}

// Update the end time of a product
export async function updateProductEndTime(product_id: number, newEndTime: Date): Promise<void> {
  await db("products").where({ product_id }).update({ end_time: newEndTime });
}

// Get seller details linked to product
export async function getSellerOfProduct(product_id: number) {
  const query = await db.raw(
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
  const query = await db.raw(
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

// Query client products page view list
export async function getProductsPageList(
  cat2_id: number,
  limit: number,
  offset: number,
  orderBy: string[],
  searchKeyword: string,
) {
  let searchCondition = "";
  const bindings: any = [cat2_id];
  if (searchKeyword && searchKeyword.trim() !== "") {
    searchCondition = "AND p.fts @@ websearch_to_tsquery('english', remove_accents(?))";
    bindings.push(searchKeyword);
  }
  bindings.push(limit, offset);

  const query = await db.raw(
    `SELECT p.*, u.username AS price_owner_username, count(*) OVER() AS total_count
     FROM products p
     LEFT JOIN users u ON p.price_owner_id = u.user_id
     WHERE p.cat2_id = ? AND p.is_removed = false
     ${searchCondition}  
     ORDER BY ${orderBy.length > 0 ? orderBy.join(", ") : "p.product_id DESC"}
     LIMIT ? OFFSET ?`,
    bindings,
  );
  return query.rows;
}

// Fetch favorite user love products list
export async function getMyFavoriteProducts(user_id: string, limit: number, offset: number) {
  const query = await db.raw(
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
export async function getMySellingProducts(user_id: string, limit: number, offset: number) {
  const query = await db.raw(
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
export async function getMySoldProducts(user_id: string, limit: number, offset: number) {
  const query = await db.raw(
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
export async function getMyWonProducts(user_id: string, limit: number, offset: number) {
  const query = await db.raw(
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
export async function getMyBiddingProducts(user_id: string, limit: number, offset: number) {
  const query = await db.raw(
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
export async function getMyInventoryProducts(user_id: string, limit: number, offset: number) {
  const query = await db.raw(
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
  const queryName = await db.raw(`SELECT product_name FROM products WHERE product_id = ?`, [product_id]);
  return queryName.rows[0]?.product_name || null;
}

// Insert new product details
export async function postNewProduct(productData: any) {
  return await db("products").insert(productData);
}

// Search products using text index matching
export async function searchProducts(query: string, limit: number, offset: number) {
  const productsQuery = await db.raw(
    `SELECT p.*, u.username AS price_owner_username, count(*) OVER() AS total_count
     FROM products p
     LEFT JOIN users u ON p.price_owner_id = u.user_id
     WHERE fts @@ websearch_to_tsquery('english', remove_accents(?))
     ORDER BY p.product_id DESC
     LIMIT ? OFFSET ?`,
    [query, limit, offset],
  );
  return productsQuery.rows;
}

// Fetch love stats details
export async function getLoveStatus(user_id: number | null, product_id: number) {
  const query = await db.raw(
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
  const currentStatusQuery = await db.raw(
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
  await db("love_products").insert({ user_id, product_id });
}

// Remove product from user favorites list
export async function unloveProduct(user_id: number, product_id: number): Promise<void> {
  await db("love_products").where({ user_id, product_id }).del();
}

// Retrieve QA list for product
export async function getProductQuestions(product_id: number, limit: number, offset: number) {
  const query = await db.raw(
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
export async function postProductQuestion(insertData: any) {
  const result = await db("product_questions").insert(insertData).returning("*");
  const newQuestion = result[0];
  const query = await db.raw(
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
  const query = await db.raw(
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
  const query = await db.raw(
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
export async function verifyProductSeller(product_id: number, seller_id: string): Promise<boolean> {
  const productQuery = await db.raw(`SELECT 1 FROM products WHERE product_id = ? AND seller_id = ?`, [
    product_id,
    seller_id,
  ]);
  return productQuery.rows.length > 0;
}

// Update the product description
export async function updateProductDescription(product_id: number, new_description: string): Promise<void> {
  await db("products").where({ product_id }).update({ description: new_description });
}

// Fetch product listing matching admin filter settings
export const getProductWithOffsetLimit = async (
  offset: number,
  limit: number,
  filter: any,
  is_removed: boolean = false,
) => {
  const q = db("products")
    .select("*")
    .orderBy("product_id", "asc")
    .where("is_removed", is_removed)
    .offset(offset)
    .limit(limit);

  if (filter?.creator) {
    q.andWhereILike("seller_id", `%${filter.creator}%`);
  }
  if (filter?.dateFrom?.trim() && filter?.dateTo?.trim()) {
    q.andWhereRaw("start_time::date >= ? and start_time::date <= ?", [filter.dateFrom, filter.dateTo]);
  } else if (filter?.dateFrom?.trim()) {
    q.andWhereRaw("start_time::date >= ?", [filter.dateFrom]);
  } else if (filter?.dateTo?.trim()) {
    q.andWhereRaw("start_time::date <= ?", [filter.dateTo]);
  }
  if (filter?.search) {
    q.andWhereRaw("fts @@ websearch_to_tsquery('english', remove_accents(?))", [filter.search]);
  }
  return q;
};

// Calculate total product listing matching admin parameters
export const calTotalProducts = async (filter: any = {}, is_removed: boolean = false) => {
  const q = db("products").where("is_removed", is_removed).count("* as total");

  if (filter?.status && filter.status !== "all") {
    q.andWhere("is_removed", filter.status === "true");
  }
  if (filter?.creator) {
    q.andWhereILike("seller_id", `%${filter.creator}%`);
  }
  if (filter?.dateFrom?.trim() && filter?.dateTo?.trim()) {
    q.andWhereRaw("start_time::date >= ? and start_time::date <= ?", [filter.dateFrom, filter.dateTo]);
  } else if (filter?.dateFrom?.trim()) {
    q.andWhereRaw("start_time::date >= ?", [filter.dateFrom]);
  } else if (filter?.dateTo?.trim()) {
    q.andWhereRaw("start_time::date <= ?", [filter.dateTo]);
  }
  if (filter?.search) {
    q.andWhereRaw("fts @@ websearch_to_tsquery('english', remove_accents(?))", [filter.search]);
  }
  const result = await q;
  return parseInt(result[0].total as string, 10);
};

// Delete a product by its ID
export async function deleteProductById(product_id: number): Promise<void> {
  await db("products").where({ product_id }).update({ is_removed: true });
}

// Restore removed product by ID
export async function restoreProductById(product_id: number): Promise<void> {
  await db("products").where({ product_id }).update({ is_removed: false });
}

// Permanently destroy product item from DB
export async function destroyProductById(product_id: number): Promise<void> {
  await db("products").where({ product_id }).del();
}

// Fetch details for winner view
export async function getProductDetailForWinner(product_id: number, winner_id: string) {
  return await db("products")
    .where({ product_id, price_owner_id: winner_id })
    .andWhere("end_time", "<", db.raw("now()"))
    .first();
}

// Fetch top products sorted by current price descending
export async function fetchTopHighestPriceProducts(limit: number) {
  const query = await db.raw(
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
  const query = await db.raw(
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
  const query = await db.raw(
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
  const query = await db.raw(`SELECT COUNT(*) as count FROM products WHERE cat2_id = ANY(?)`, [categoryIds]);
  return Number(query.rows[0].count);
}
