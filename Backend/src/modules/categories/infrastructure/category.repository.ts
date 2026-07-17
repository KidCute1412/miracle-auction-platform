import { Prisma } from "@prisma/client";
import { prisma } from "@/infrastructure/database/prisma.client.ts";
import { slugify } from "@/helpers/slug.helper.ts";

type CategoryFilter = { status?: string; creator?: string; dateFrom?: string; dateTo?: string; search?: string };
type CategoryRow = Record<string, any>;

function categoryWhere(filter: CategoryFilter, deleted: boolean) {
  const conditions: Prisma.Sql[] = [Prisma.sql`c.deleted = ${deleted}`];
  if (filter.status && filter.status !== "all") conditions.push(Prisma.sql`c.status = ${filter.status}`);
  if (filter.creator) conditions.push(Prisma.sql`u.full_name ILIKE ${`%${filter.creator}%`}`);
  if (filter.dateFrom?.trim()) conditions.push(Prisma.sql`c.created_at >= ${new Date(`${filter.dateFrom} 00:00:00`)}`);
  if (filter.dateTo?.trim()) conditions.push(Prisma.sql`c.created_at <= ${new Date(`${filter.dateTo} 23:59:59`)}`);
  if (filter.search) conditions.push(Prisma.sql`c.slug LIKE ${`%${filter.search}%`}`);
  return Prisma.join(conditions, " AND ");
}

export const getAllCategoriesLv1 = () => prisma.categories.findMany({ where: { parent_id: null } });
export const getAllCategoriesLv2NoSlug = (catId: number) => prisma.categories.findMany({ where: { parent_id: catId } });

export const getAllCategoriesLv2 = async (catId: number, slug: string) => {
  const parent = await prisma.categories.findUnique({ where: { id: catId } });
  if (!parent || slugify(parent.name) !== slug) return null;
  return { data: await prisma.categories.findMany({ where: { parent_id: catId } }), cat1_name: parent.name };
};

export async function getCategoryLv2ById(cat2_id: number) {
  const rows = await prisma.$queryRaw<CategoryRow[]>(Prisma.sql`
    SELECT c2.id AS cat2_id, c2.name AS cat2_name, c2.slug AS cat2_slug,
      c1.id AS cat1_id, c1.name AS cat1_name, c1.slug AS cat1_slug
    FROM categories c2 LEFT JOIN categories c1 ON c2.parent_id = c1.id WHERE c2.id = ${cat2_id}`);
  return rows[0] ?? null;
}

export const getAllCategories = () => prisma.categories.findMany({ where: { status: "active", deleted: false } });
export const insertCategory = (data: Prisma.categoriesUncheckedCreateInput) => prisma.categories.create({ data }).then(() => undefined);
export const getAllCategory = (deleted = false) => prisma.categories.findMany({ where: { deleted } });
export const getAllCategoriesIncludingDeleted = () => prisma.categories.findMany();

export async function getCategoryWithOffsetLimit(offset: number, limit: number, filter: CategoryFilter, deleted = false) {
  const where = categoryWhere(filter, deleted);
  return prisma.$queryRaw<CategoryRow[]>(Prisma.sql`
    SELECT c.* FROM categories c LEFT JOIN users u ON c.created_by = u.user_id
    WHERE ${where} ORDER BY c.id DESC OFFSET ${offset} LIMIT ${limit}`);
}

export async function calTotalCategories(filter: CategoryFilter = {}, deleted = false) {
  const where = categoryWhere(filter, deleted);
  const rows = await prisma.$queryRaw<Array<{ total: bigint }>>(Prisma.sql`
    SELECT count(*) AS total FROM categories c LEFT JOIN users u ON c.created_by = u.user_id WHERE ${where}`);
  return Number(rows[0]?.total ?? 0n);
}

export async function getUniqueCreators() {
  const rows = await prisma.$queryRaw<Array<{ full_name: string }>>(Prisma.sql`
    SELECT DISTINCT u.full_name FROM categories c JOIN users u ON c.created_by = u.user_id`);
  return rows.map((row) => row.full_name);
}

export const getCategoryWithID = (id: number) => prisma.categories.findMany({ where: { deleted: false, id } });
export const updateCategoryWithID = (id: number, data: Prisma.categoriesUncheckedUpdateInput) => prisma.categories.updateMany({ where: { deleted: false, id }, data });
export const deleteCategoryWithID = (id: number) => prisma.categories.update({ where: { id }, data: { deleted: true } });
export const restoreCategoryWithID = (id: number) => prisma.categories.update({ where: { id }, data: { deleted: false } });
export const destroyCategoryWithID = (id: number) => prisma.categories.delete({ where: { id } });
