import { Request, Response } from "express";
import * as ProductsService from "../application/product.use-case.ts";
import { AccountRequest, requireAuthenticatedUser } from "@/interfaces/request.interface.ts";
import { getBidEngine } from "@/modules/bids/application/bid-engine.ts";
import { MutateAuctionUseCase } from "@/modules/bids/application/mutate-auction.use-case.ts";

// Calculate total product listing matching filter parameters
export async function calTotalProducts(req: Request, res: Response) {
  const filter = {};
  const is_removed = req.query.is_removed === "true";
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

  const total = await ProductsService.calTotalProducts(filter, is_removed);
  res.json({ code: "success", message: "Success", total });
}

// Fetch admin paginated products list with detailed creator names
export async function list(req: AccountRequest, res: Response) {
  try {
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const filter = {};
    const is_removed = req.query.is_removed === "true";
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

    const resultList = await ProductsService.getAdminProductList(page, limit, filter, is_removed);
    res.json({
      code: "success",
      message: "Success",
      list: resultList,
    });
  } catch (error) {
    console.error("Error in product list controller:", error);
    res.json({ code: "error", message: "An error occurred", list: [] });
  }
}

// Fetch detailed product page info
export async function detail(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const product = await ProductsService.getProductById(Number(id));

    if (!product) {
      return res.json({ code: "error", message: "Product not found" });
    }

    res.json({
      code: "success",
      message: "Success",
      product,
    });
  } catch (error) {
    console.error("Error in product detail controller:", error);
    res.json({ code: "error", message: "An error occurred" });
  }
}

// Soft delete a product
export async function deleteProduct(req: AccountRequest, res: Response) {
  try {
    const { id } = req.params;
    if (getBidEngine() === "redis") {
      const actor = requireAuthenticatedUser(req);
      const idempotencyKey = req.header("Idempotency-Key")?.trim();
      if (!idempotencyKey) return res.status(400).json({ code: "IDEMPOTENCY_KEY_REQUIRED", message: "Idempotency-Key is required" });
      await new MutateAuctionUseCase().cancel({
        productId: Number(id),
        actorId: actor.user_id,
        actorRole: actor.role,
        idempotencyKey,
        correlationId: req.header("x-request-id") ?? undefined,
        reason: "admin soft delete",
      });
    } else {
      await ProductsService.deleteProductById(Number(id));
    }
    res.json({ code: "success", message: "Deleted product successfully" });
  } catch (error) {
    res.json({ code: "error", message: "An error occurred while deleting product" });
  }
}

// Restore a soft-deleted product
export async function restoreProduct(req: Request, res: Response) {
  try {
    const { id } = req.params;
    await ProductsService.restoreProductById(Number(id));
    res.json({ code: "success", message: "Restored product successfully" });
  } catch (error) {
    res.json({ code: "error", message: "An error occurred while restoring product" });
  }
}

// Permanently destroy a product
export async function destroyProduct(req: Request, res: Response) {
  try {
    const { id } = req.params;
    await ProductsService.destroyProductById(Number(id));
    res.json({ code: "success", message: "Permanently deleted product successfully" });
  } catch (error) {
    res.json({ code: "error", message: "An error occurred while permanently deleting product" });
  }
}
