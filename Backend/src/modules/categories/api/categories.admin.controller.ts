import { Request, Response } from "express";
import * as CategoriesService from "../application/categories.use-case.ts";
import { AccountRequest, requireAuthenticatedUser } from "@/interfaces/request.interface.ts";

// Build hierarchical category tree mapping starting from root node
export async function buildTree(_: Request, res: Response) {
  const tree = await CategoriesService.buildCategoryTreeAdmin();
  res.json({ code: "success", message: "Success", tree });
}

// Create and register a new category
export async function createPost(req: AccountRequest, res: Response) {
  try {
    const account = requireAuthenticatedUser(req);
    req.body.created_by = account.user_id;
    req.body.updated_by = account.user_id;
    await CategoriesService.insertCategory(req.body);
    res.json({ code: "success", message: "Created new category successfully" });
  } catch (error) {
    res.json({ code: "error", message: "An error occurred" });
  }
}

// Calculate total category entries matching status and creation parameters
export async function calTotalCategories(req: Request, res: Response) {
  const filter = {};
  const deleted = req.query.deleted === "true";
  if (req.query.status) {
    Object.assign(filter, { status: req.query.status });
  }
  if (req.query.creator) {
    Object.assign(filter, { creator: req.query.creator });
  }
  if (req.query.dateFrom) {
    Object.assign(filter, { dateFrom: req.query.dateFrom });
  }
  if (req.query.dateTo) {
    Object.assign(filter, { dateTo: req.query.dateTo });
  }
  if (req.query.search) {
    Object.assign(filter, { search: req.query.search as string });
  }

  const total = await CategoriesService.calTotalCategories(filter, deleted);
  res.json({ code: "success", message: "Success", total });
}

// Fetch detailed list of categories with creator information
export async function list(req: AccountRequest, res: Response) {
  const page = req.query.page ? Number(req.query.page) : 1;
  const limit = req.query.limit ? Number(req.query.limit) : 10;
  const filter = {};
  const deleted = req.query.deleted === "true";
  if (req.query.status) {
    Object.assign(filter, { status: req.query.status });
  }
  if (req.query.creator) {
    Object.assign(filter, { creator: req.query.creator });
  }
  if (req.query.dateFrom) {
    Object.assign(filter, { dateFrom: req.query.dateFrom });
  }
  if (req.query.dateTo) {
    Object.assign(filter, { dateTo: req.query.dateTo });
  }
  if (req.query.search) {
    Object.assign(filter, { search: req.query.search as string });
  }

  const resultList = await CategoriesService.getCategoryListDetailed(page, limit, filter, deleted);
  res.json({
    code: "success",
    message: "Success",
    list: resultList,
  });
}

// Retrieve single category item for editing
export async function edit(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const list = await CategoriesService.getCategoryWithID(Number(id));
    const item = list.length > 0 ? list[0] : null;
    res.json({ code: "success", item });
  } catch (error) {
    res.json({ code: "error", item: null });
  }
}

// Patch updates on specific category ID
export async function editPatch(req: Request, res: Response) {
  try {
    const { id } = req.params;
    await CategoriesService.updateCategoryWithID(Number(id), req.body);
    res.json({ code: "success", message: "Updated successfully" });
  } catch (error) {
    res.json({ code: "error", message: "An error occurred here" });
  }
}

// Soft delete category and its descendants
export async function deleteCategory(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const success = await CategoriesService.deleteCategory(Number(id));
    if (!success) {
      return res.json({
        code: "error",
        message: "Cannot delete category",
      });
    }
    res.json({ code: "success", message: "Deleted category successfully" });
  } catch (error) {
    res.json({ code: "error", message: "An error occurred" });
  }
}

// Restore soft deleted category by ID
export async function restoreCategory(req: Request, res: Response) {
  try {
    const { id } = req.params;
    await CategoriesService.restoreCategoryWithID(Number(id));
    res.json({ code: "success", message: "Restored category successfully" });
  } catch (error) {
    res.json({ code: "error", message: "An error occurred" });
  }
}

// Permanently destroy category and its descendants
export async function destroyCategory(req: Request, res: Response) {
  try {
    const { id } = req.params;
    await CategoriesService.destroyCategory(Number(id));
    res.json({ code: "success", message: "Permanently deleted category successfully" });
  } catch (error) {
    res.json({ code: "error", message: "An error occurred" });
  }
}

// Fetch all unique category creators
export async function getCreators(_: Request, res: Response) {
  try {
    const list = await CategoriesService.getUniqueCreators();
    res.json({ code: "success", message: "Success", list });
  } catch (error) {
    res.json({ code: "error", message: "An error occurred fetching creators", list: [] });
  }
}
