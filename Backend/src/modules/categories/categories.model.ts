import db from "@/config/database.config.ts";
import { slugify } from "@/helpers/slug.helper.ts";

// Fetch all level 1 categories (where parent_id is null)
export const getAllCategoriesLv1 = async () => {
  const result = await db.raw("select * from categories where parent_id IS NULL");
  return result.rows || null;
};

// Fetch all level 2 categories under a parent category ID
export const getAllCategoriesLv2NoSlug = async (catId: number) => {
  const result = await db.raw("select * from categories where parent_id = ?", [catId]);
  return result.rows || null;
};

// Fetch level 2 categories and verify matching level 1 slug
export const getAllCategoriesLv2 = async (catId: number, slug: string) => {
  const lv1Result = await db.raw("select * from categories where id = ?", [catId]);
  const lv1Data = lv1Result.rows[0];
  if (!lv1Data) {
    return null;
  }
  const expectedSlug = slugify(lv1Data.name);
  if (expectedSlug !== slug) {
    return null;
  }
  const result = await db.raw("select * from categories where parent_id = ?", [catId]);
  return {
    data: result.rows || null,
    cat1_name: lv1Data.name,
  };
};

// Fetch details for category level 2 by its ID
export const getCategoryLv2ById = async (cat2_id: number) => {
  const result = await db.raw(
    `select c2.id as cat2_id, c2.name as cat2_name, c2.slug as cat2_slug, 
            c1.id as cat1_id, c1.name as cat1_name, c1.slug as cat1_slug
     from categories c2 
     left join categories c1 on c2.parent_id = c1.id
     where c2.id = ?`,
    [cat2_id]
  );
  return result.rows[0] || null;
};

// Retrieve all active categories
export const getAllCategories = async () => {
  const result = await db.raw(
    `select * from categories
     where status = 'active' and deleted = false`
  );
  return result.rows || null;
};

// Insert a new category
export const insertCategory = async (data: object) => {
  await db("categories").insert(data);
};

// Retrieve all categories based on deleted status
export const getAllCategory = async (deleted: boolean = false) => {
  return db("categories").select("*").where({ deleted });
};

// Retrieve all categories including deleted ones
export const getAllCategoriesIncludingDeleted = async () => {
  return db("categories").select("*");
};

// Query categories with offset, limit, and filters
export const getCategoryWithOffsetLimit = async (
  offset: number,
  limit: number,
  filter: any,
  deleted: boolean = false
) => {
  const q = db("categories")
    .select("categories.*")
    .where({ "categories.deleted": deleted })
    .orderBy("categories.id", "desc")
    .offset(offset)
    .limit(limit);

  if (filter?.status && filter.status !== "all") {
    q.andWhere("categories.status", filter.status);
  }
  if (filter?.creator) {
    q.join("users", "categories.created_by", "users.user_id")
      .andWhereILike("users.full_name", `%${filter.creator}%`);
  }
  if (filter?.dateFrom?.trim() && filter?.dateTo?.trim()) {
    q.andWhereBetween("categories.created_at", [
      `${filter.dateFrom} 00:00:00`,
      `${filter.dateTo} 23:59:59`,
    ]);
  } else if (filter?.dateFrom?.trim()) {
    q.andWhere("categories.created_at", ">=", `${filter.dateFrom} 00:00:00`);
  } else if (filter?.dateTo?.trim()) {
    q.andWhere("categories.created_at", "<=", `${filter.dateTo} 23:59:59`);
  }
  if (filter?.search) {
    q.andWhere("categories.slug", "like", `%${filter.search}%`);
  }
  return q;
};

// Calculate total category count with filters
export const calTotalCategories = async (filter: any = {}, deleted: boolean = false) => {
  const q = db("categories").count("* as total").where({ "categories.deleted": deleted });

  if (filter?.status && filter.status !== "all") {
    q.andWhere("categories.status", filter.status);
  }
  if (filter?.creator) {
    q.join("users", "categories.created_by", "users.user_id")
      .andWhereILike("users.full_name", `%${filter.creator}%`);
  }
  if (filter?.dateFrom?.trim() && filter?.dateTo?.trim()) {
    q.andWhereBetween("categories.created_at", [
      `${filter.dateFrom} 00:00:00`,
      `${filter.dateTo} 23:59:59`,
    ]);
  } else if (filter?.dateFrom?.trim()) {
    q.andWhere("categories.created_at", ">=", `${filter.dateFrom} 00:00:00`);
  } else if (filter?.dateTo?.trim()) {
    q.andWhere("categories.created_at", "<=", `${filter.dateTo} 23:59:59`);
  }
  if (filter?.search) {
    q.andWhere("categories.slug", "like", `%${filter.search}%`);
  }

  const result = await q;
  return parseInt(result[0].total as string, 10);
};

// Fetch unique names of users who created categories
export const getUniqueCreators = async () => {
  const result = await db("categories")
    .join("users", "categories.created_by", "users.user_id")
    .distinct("users.full_name")
    .select("users.full_name");
  return result.map((r: any) => r.full_name);
};

// Fetch category by ID
export const getCategoryWithID = async (id: number) => {
  return db("categories").select("*").where({ deleted: false, id });
};

// Update category details by ID
export const updateCategoryWithID = async (id: number, data: any) => {
  return db("categories").where({ deleted: false, id }).update(data);
};

// Mark category as deleted by ID
export const deleteCategoryWithID = async (id: number) => {
  return db("categories").where({ id }).update({ deleted: true });
};

// Restore category from deleted status by ID
export const restoreCategoryWithID = async (id: number) => {
  return db("categories").where({ id }).update({ deleted: false });
};

// Permanently destroy category from database by ID
export const destroyCategoryWithID = async (id: number) => {
  return db("categories").where({ id }).del();
};
