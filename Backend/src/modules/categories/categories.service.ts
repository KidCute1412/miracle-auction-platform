import * as CategoriesModel from "./categories.model.ts";
import { accountRepository } from "@/modules/accounts/infrastructure/account.repository.ts";
import * as productsModel from "@/modules/products/products.model.ts";
import { buildTree, Category, CategoryNode } from "@/helpers/category.helper.ts";

// Fetch all level 1 categories
export async function getAllCategoriesLv1() {
  return await CategoriesModel.getAllCategoriesLv1();
}

// Fetch all level 2 categories without validating slug
export async function getAllCategoriesLv2NoSlug(catId: number) {
  return await CategoriesModel.getAllCategoriesLv2NoSlug(catId);
}

// Fetch level 2 categories and validate slug matches level 1 category name
export async function getAllCategoriesLv2(catId: number, slug: string) {
  return await CategoriesModel.getAllCategoriesLv2(catId, slug);
}

// Retrieve details for level 2 category by ID
export async function getCategoryLv2ById(cat2_id: number) {
  return await CategoriesModel.getCategoryLv2ById(cat2_id);
}

// Retrieve all categories formatted into tree structure
export async function getAllCategoriesTree(): Promise<CategoryNode[] | null> {
  const categories = (await CategoriesModel.getAllCategories()) as Category[] | null;
  if (!categories) {
    return null;
  }
  return buildTree(categories);
}

// Build hierarchical category tree mapping starting from root node
export async function buildCategoryTreeAdmin(): Promise<CategoryNode[]> {
  const categories = (await CategoriesModel.getAllCategory()) as Category[];
  return buildTree(categories, null);
}

// Create and register a new category
export async function insertCategory(data: any) {
  await CategoriesModel.insertCategory(data);
}

// Calculate total category entries matching status and creation parameters
export async function calTotalCategories(filter: any, deleted: boolean) {
  return await CategoriesModel.calTotalCategories(filter, deleted);
}

// Fetch detailed list of categories with creator information
export async function getCategoryListDetailed(page: number, limit: number, filter: any, deleted: boolean) {
  const list = await CategoriesModel.getCategoryWithOffsetLimit((page - 1) * limit, limit, filter, deleted);

  for (const category of list) {
    const detailedAccount = await accountRepository.findDetailedById(category.created_by);
    category.created_by = detailedAccount ? detailedAccount.full_name : "Unknown";

    const detailedAccountUpdated = await accountRepository.findDetailedById(category.updated_by);
    category.updated_by = detailedAccountUpdated ? detailedAccountUpdated.full_name : "Unknown";
  }

  return list;
}

// Retrieve category list by ID
export async function getCategoryWithID(id: number) {
  return await CategoriesModel.getCategoryWithID(id);
}

// Update category fields by category ID
export async function updateCategoryWithID(id: number, data: any) {
  return await CategoriesModel.updateCategoryWithID(id, data);
}

// Helper to calculate all descendant category IDs recursively
export async function getAllDescendantIds(categoryId: number): Promise<number[]> {
  const allCategories = await CategoriesModel.getAllCategoriesIncludingDeleted();
  const descendants: number[] = [];

  function findDescendants(parentId: number) {
    for (const cat of allCategories) {
      if (cat.parent_id === parentId) {
        descendants.push(cat.id);
        findDescendants(cat.id);
      }
    }
  }

  findDescendants(categoryId);
  return descendants;
}

// Delete a category and its descendants if no products are linked
export async function deleteCategory(categoryId: number): Promise<boolean> {
  const descendantIds = await getAllDescendantIds(categoryId);
  const count = await productsModel.countProductsByCategories([categoryId, ...descendantIds]);
  if (count > 0) {
    return false;
  }
  await CategoriesModel.deleteCategoryWithID(categoryId);
  for (const descId of descendantIds) {
    await CategoriesModel.deleteCategoryWithID(descId);
  }
  return true;
}

// Restore a category by ID
export async function restoreCategoryWithID(id: number) {
  return await CategoriesModel.restoreCategoryWithID(id);
}

// Permanently destroy a category and all its descendants
export async function destroyCategory(categoryId: number): Promise<void> {
  const descendantIds = await getAllDescendantIds(categoryId);
  for (const descId of descendantIds) {
    await CategoriesModel.destroyCategoryWithID(descId);
  }
  await CategoriesModel.destroyCategoryWithID(categoryId);
}

// Fetch list of unique creator full names
export async function getUniqueCreators() {
  return await CategoriesModel.getUniqueCreators();
}
