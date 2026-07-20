import { Request, Response } from "express";
import * as ProductsService from "../application/product.use-case.ts";
import { type AccountRequest, requireAuthenticatedUser } from "@/interfaces/request.interface.ts";

// Fetch paginated products list under category
export async function getProductsPageList(req: Request, res: Response) {
  const cat2_id = req.query.cat2_id as string;
  const page = parseInt(req.query.page as string) || 1;
  const priceFilter = (req.query.price as string) || "";
  const timeFilter = (req.query.time as string) || "";
  const searchKeyword = (req.query.search as string) || "";

  if (!cat2_id) {
    return res.status(400).json({ message: "cat2_id is required" });
  }

  const result = await ProductsService.getProductsPageList(
    parseInt(cat2_id),
    page,
    priceFilter,
    timeFilter,
    searchKeyword,
  );

  if (result === null) {
    return res.status(500).json({ message: "Error in fetching products" });
  }
  return res.status(200).json({
    message: "Success",
    data: result.data,
    numberOfPages: result.numberOfPages,
    quantity: result.quantity,
  });
}

// Fetch detailed product row by slug and id
export async function getProductDetailBySlugId(req: Request, res: Response) {
  try {
    const product_id = req.params.id as string;
    const product_slug = req.query.slug as string | undefined;

    const productDetail = await ProductsService.getProductDetailBySlugId(product_id, product_slug ?? "");
    if (!productDetail) {
      return res.status(404).json({
        status: "error",
        message: "Product does not exist",
      });
    }
    return res.status(200).json({
      status: "success",
      data: productDetail,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: "error",
      message: "Server error",
    });
  }
}

// Submit a new product listing with uploads
export async function postNewProduct(req: AccountRequest, res: Response) {
  try {
    const files = req.files as Express.Multer.File[];
    const user = requireAuthenticatedUser(req);

    await ProductsService.postNewProduct(req.body, files, user.user_id);
    return res.status(201).json({
      status: "success",
      message: "Product posted successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: "error",
      message: "Server error",
    });
  }
}

// Retrieve active selling / won / sold product collections
export async function getMyProductsList(req: AccountRequest, res: Response) {
  try {
    const user = requireAuthenticatedUser(req);
    const type = req.query.type as string;
    const page = parseInt(req.query.page as string) || 1;

    const result = await ProductsService.getMyProductsList(user.user_id, type, page);
    if (!result) {
      return res.status(400).json({
        status: "error",
        message: "Invalid type parameter or no products found",
      });
    }

    return res.status(200).json({
      status: "success",
      data: result.data,
      numberOfPages: result.numberOfPages,
      quantity: result.quantity,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: "error",
      message: "Server error",
    });
  }
}

// Handle keyword search requests
export async function searchProducts(req: Request, res: Response) {
  try {
    const query = req.query.query as string;
    const page = parseInt(req.query.page as string) || 1;

    const result = await ProductsService.searchProducts(query, page);
    return res.status(200).json({
      status: "success",
      data: {
        products: result.data,
        total_pages: result.numberOfPages,
        quantity: result.quantity,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Server error",
    });
  }
}

// Retrieve user love preference stats on product
export async function getLoveStatus(req: AccountRequest, res: Response) {
  try {
    const user = req.user;
    const product_id = req.params.id as string;

    const loveStatus = await ProductsService.getLoveStatus(user ? user.user_id : null, parseInt(product_id));

    return res.status(200).json({
      status: "success",
      data: {
        is_loved: loveStatus.is_loved,
        total_loves: loveStatus.total_loves,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: "error",
      message: "Server error",
    });
  }
}

// Set or clear favorite loved state on product
export async function updateLoveStatus(req: AccountRequest, res: Response) {
  try {
    const user = requireAuthenticatedUser(req);
    const product_id = req.params.id as string;
    const love_status = req.body.love_status as boolean;

    await ProductsService.updateLoveStatus(user.user_id, parseInt(product_id), love_status);
    return res.status(200).json({
      status: "success",
      message: "Successfully updated love status",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: "error",
      message: "Server error",
    });
  }
}

// Fetch QA list mapped to product
export async function getProductQuestions(req: Request, res: Response) {
  const product_id = req.params.id as string;
  const page = parseInt(req.query.page as string) || 1;
  const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;

  const result = await ProductsService.getProductQuestions(parseInt(product_id), page, limit);
  return res.status(200).json({
    status: "success",
    data: result.data,
    totalQuestions: result.total_questions,
  });
}

// Post a question or answer reply
export async function postProductQuestion(req: AccountRequest, res: Response) {
  const user = requireAuthenticatedUser(req);
  const product_id = req.params.id as string;
  const content = req.body.content as string;
  const question_parent_id = req.body.question_parent_id ? parseInt(req.body.question_parent_id as string) : null;

  if (!product_id || !content) {
    return res.status(400).json({
      status: "error",
      message: "product_id and content are required",
    });
  }

  const result = await ProductsService.postProductQuestion(
    parseInt(product_id),
    user.user_id,
    content,
    question_parent_id,
  );

  return res.status(201).json({
    status: "success",
    message: "Question posted successfully",
    data: result,
  });
}

// Fetch related recommendations list
export async function getRelatedProducts(req: Request, res: Response) {
  try {
    const category_id = req.query.category_id as string;
    const product_id = req.query.product_id as string;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
    if (!category_id) {
      return res.status(400).json({
        status: "error",
        message: "category_id is required",
      });
    }
    const products = await ProductsService.getRelatedProducts(
      parseInt(category_id),
      product_id ? parseInt(product_id) : null,
      limit,
    );
    return res.status(200).json({
      status: "success",
      data: products,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Server error",
    });
  }
}

// Modify descriptions and alert the lead bidder by email if necessary
export async function updateProductDescription(req: AccountRequest, res: Response) {
  try {
    const user = requireAuthenticatedUser(req);
    const product_id = parseInt(req.params.id);
    const newDescription = req.body.description as string;
    const promise = await ProductsService.updateProductDescription(product_id, user.user_id, newDescription);

    if (promise.status === "403") {
      return res.status(403).json({
        status: "error",
        message: promise.message,
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Successfully updated product description",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: "error",
      message: "Server error",
    });
  }
}

// Retrieve general product details for winner checkout view
export async function getProductDetailForWinner(req: AccountRequest, res: Response) {
  try {
    const product_id = req.params.id as string;
    const winner_id = requireAuthenticatedUser(req).user_id;
    const detailResult = await ProductsService.getProductDetailForWinner(parseInt(product_id), winner_id);

    if (!detailResult) {
      return res.status(404).json({
        status: "error",
        message: "Product does not exist or you are not the winner",
      });
    }
    return res.status(200).json({
      status: "success",
      data: detailResult.productDetail,
      infoSeller: detailResult.infoSeller,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: "error",
      message: "An error occurred, please try again later",
    });
  }
}

// Fetch ending soon products list for client home screen
export async function getTopEndingSoonProducts(req: Request, res: Response) {
  try {
    const limit = parseInt(req.query.limit as string) || 5;
    const products = await ProductsService.getTopEndingSoonProducts(limit);
    return res.status(200).json({ status: "success", data: products });
  } catch (error) {
    return res.status(500).json({ status: "error", message: "Server error" });
  }
}

// Fetch highest priced products list for client home screen
export async function getTopHighestPriceProducts(req: Request, res: Response) {
  try {
    const limit = parseInt(req.query.limit as string) || 5;
    const products = await ProductsService.getTopHighestPriceProducts(limit);
    return res.status(200).json({ status: "success", data: products });
  } catch (error) {
    return res.status(500).json({ status: "error", message: "Server error" });
  }
}

// Fetch top most bids products list for client home screen
export async function getTopMostBidProducts(req: Request, res: Response) {
  try {
    const limit = parseInt(req.query.limit as string) || 5;
    const products = await ProductsService.getTopMostBidProducts(limit);
    return res.status(200).json({ status: "success", data: products });
  } catch (error) {
    return res.status(500).json({ status: "error", message: "Server error" });
  }
}
