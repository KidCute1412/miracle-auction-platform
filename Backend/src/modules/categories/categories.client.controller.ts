import { Request, Response } from "express";
import * as CategoriesService from "./categories.service.ts";

// Fetch all level 1 categories
export async function getAllCategoriesLv1(_: Request, res: Response) {
  const resultData = await CategoriesService.getAllCategoriesLv1();
  if (resultData === null) {
    return res.status(500).json({
      code: "error",
      message: "Server error fetching level 1 categories",
    });
  }
  return res.status(200).json({
    code: "success",
    message: "Successfully fetched all level 1 categories",
    data: resultData,
  });
}

// Fetch level 2 categories without checking slug
export async function getAllCategoriesLv2NoSlug(req: Request, res: Response) {
  const id = req.query.cat_id;
  const resultData = await CategoriesService.getAllCategoriesLv2NoSlug(Number(id));
  if (resultData === null) {
    return res.status(500).json({
      code: "error",
      message: "Server error fetching level 2 categories",
    });
  }
  return res.status(200).json({
    code: "success",
    message: "Successfully fetched all level 2 categories",
    data: resultData,
  });
}

// Fetch level 2 categories and validate slug matches level 1 category name
export async function getAllCategoriesLv2(req: Request, res: Response) {
  const id = req.query.cat_id;
  const slug = req.query.cat_slug;
  const result = await CategoriesService.getAllCategoriesLv2(Number(id), String(slug));
  let data = null;
  let cat1_name = "";
  if (result) {
    data = result.data;
    cat1_name = result.cat1_name;
  }
  if (data === null) {
    return res.status(400).json({
      code: "error",
      message: "Slug does not match level 1 category name",
    });
  }
  return res.status(200).json({
    code: "success",
    message: "Successfully fetched all level 2 categories",
    data,
    cat1_name,
  });
}

// Fetch details for level 2 category by ID
export async function getCategoryLv2ById(req: Request, res: Response) {
  const cat2_id = req.params.id;
  const resultData = await CategoriesService.getCategoryLv2ById(Number(cat2_id));
  if (resultData === null) {
    return res.status(500).json({
      code: "error",
      message: "Server error fetching level 2 categories",
    });
  }
  return res.status(200).json({
    code: "success",
    message: "Successfully fetched level 2 category",
    data: resultData,
  });
}

// Fetch all categories tree structure
export async function getAll(_: Request, res: Response) {
  const formattedData = await CategoriesService.getAllCategoriesTree();
  if (formattedData === null) {
    return res.status(500).json({
      code: "error",
      message: "Server error fetching all categories",
    });
  }
  return res.status(200).json({
    code: "success",
    message: "Successfully fetched all categories",
    data: formattedData,
  });
}
