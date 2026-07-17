import { beforeEach, describe, expect, it, vi } from "vitest";

const repo = vi.hoisted(() => ({
  getAllCategoriesLv1: vi.fn(), getAllCategoriesLv2NoSlug: vi.fn(), getAllCategoriesLv2: vi.fn(),
  getCategoryLv2ById: vi.fn(), getAllCategories: vi.fn(), getAllCategory: vi.fn(), insertCategory: vi.fn(),
  calTotalCategories: vi.fn(), getCategoryWithOffsetLimit: vi.fn(), getCategoryWithID: vi.fn(),
  updateCategoryWithID: vi.fn(), getAllCategoriesIncludingDeleted: vi.fn(), deleteCategoryWithID: vi.fn(),
  restoreCategoryWithID: vi.fn(), destroyCategoryWithID: vi.fn(), getUniqueCreators: vi.fn(),
}));
const products = vi.hoisted(() => ({ countProductsByCategories: vi.fn() }));
const accounts = vi.hoisted(() => ({ findDetailedById: vi.fn() }));
vi.mock("../../src/modules/categories/infrastructure/category.repository.ts", () => repo);
vi.mock("@/modules/products/infrastructure/product.repository.ts", () => products);
vi.mock("@/modules/accounts/infrastructure/account.repository.ts", () => ({ accountRepository: accounts }));

import * as useCase from "../../src/modules/categories/application/categories.use-case.ts";

describe("category use cases", () => {
  beforeEach(() => vi.clearAllMocks());

  it("delegates simple category reads and writes", async () => {
    repo.getAllCategoriesLv1.mockResolvedValue([1]); repo.getAllCategoriesLv2NoSlug.mockResolvedValue([2]);
    repo.getAllCategoriesLv2.mockResolvedValue([3]); repo.getCategoryLv2ById.mockResolvedValue({ id: 3 });
    repo.calTotalCategories.mockResolvedValue(4); repo.getCategoryWithID.mockResolvedValue({ id: 1 });
    repo.updateCategoryWithID.mockResolvedValue(true); repo.restoreCategoryWithID.mockResolvedValue(true);
    repo.getUniqueCreators.mockResolvedValue(["Admin"]);
    expect(await useCase.getAllCategoriesLv1()).toEqual([1]);
    expect(await useCase.getAllCategoriesLv2NoSlug(1)).toEqual([2]);
    expect(await useCase.getAllCategoriesLv2(1, "slug")).toEqual([3]);
    expect(await useCase.getCategoryLv2ById(3)).toEqual({ id: 3 });
    await useCase.insertCategory({ name: "New" });
    expect(await useCase.calTotalCategories({}, false)).toBe(4);
    expect(await useCase.getCategoryWithID(1)).toEqual({ id: 1 });
    expect(await useCase.updateCategoryWithID(1, { name: "Updated" })).toBe(true);
    expect(await useCase.restoreCategoryWithID(1)).toBe(true);
    expect(await useCase.getUniqueCreators()).toEqual(["Admin"]);
  });

  it("returns null when the public category tree has no rows", async () => {
    repo.getAllCategories.mockResolvedValue(null);
    await expect(useCase.getAllCategoriesTree()).resolves.toBeNull();
  });

  it("adds creator names to the admin list", async () => {
    const rows = [{ created_by: 1, updated_by: 2 }];
    repo.getCategoryWithOffsetLimit.mockResolvedValue(rows);
    accounts.findDetailedById.mockResolvedValueOnce({ full_name: "Creator" }).mockResolvedValueOnce(null);
    await expect(useCase.getCategoryListDetailed(2, 10, {}, false)).resolves.toEqual([{ created_by: "Creator", updated_by: "Unknown" }]);
    expect(repo.getCategoryWithOffsetLimit).toHaveBeenCalledWith(10, 10, {}, false);
  });

  it("finds descendants and refuses deletion when products still exist", async () => {
    repo.getAllCategoriesIncludingDeleted.mockResolvedValue([{ id: 2, parent_id: 1 }, { id: 3, parent_id: 2 }]);
    products.countProductsByCategories.mockResolvedValue(1);
    await expect(useCase.getAllDescendantIds(1)).resolves.toEqual([2, 3]);
    await expect(useCase.deleteCategory(1)).resolves.toBe(false);
    expect(repo.deleteCategoryWithID).not.toHaveBeenCalled();
  });

  it("soft-deletes and permanently destroys descendants", async () => {
    repo.getAllCategoriesIncludingDeleted.mockResolvedValue([{ id: 2, parent_id: 1 }, { id: 3, parent_id: 2 }]);
    products.countProductsByCategories.mockResolvedValue(0);
    await expect(useCase.deleteCategory(1)).resolves.toBe(true);
    expect(repo.deleteCategoryWithID.mock.calls.map(([id]) => id)).toEqual([1, 2, 3]);
    await useCase.destroyCategory(1);
    expect(repo.destroyCategoryWithID.mock.calls.map(([id]) => id)).toEqual([2, 3, 1]);
  });
});
