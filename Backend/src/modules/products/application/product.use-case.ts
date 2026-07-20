import * as ProductsModel from "../infrastructure/product.repository.ts";
import * as usersModel from "@/modules/users/infrastructure/user.repository.ts";
import { accountRepository } from "@/modules/accounts/infrastructure/account.repository.ts";
import { uploadToCloudinary } from "@/config/cloud.config.ts";
import fs from "fs";
import { slugify } from "@/helpers/slug.helper.ts";
import { emitBidUpdate } from "@/socket.ts";
import {
  sendBidderQuestionTemplate,
  sendSellerAnswerTemplate,
  getProductDescriptionChangedTemplate,
  sendMail,
} from "@/helpers/mail.helper.ts";
import type { Prisma } from "@prisma/client";
import type { ProductFilter, ProductRow } from "../infrastructure/product.repository.ts";

export type NewProductRequest = {
  product_name: string;
  step_price: string | number;
  start_price: string | number;
  buy_now_price: string | number;
  cat2_id: string | number;
  start_time: string | Date;
  end_time: string | Date;
  description?: string;
  auto_extended?: string | boolean;
};

const ITEMS_PER_PAGE = 6;
const DASHBOARD_ITEMS_PER_PAGE = 4;

// Retrieve products page list with optional search and sorting filters
export async function getProductsPageList(
  cat2_id: number,
  page: number,
  priceFilter: string,
  timeFilter: string,
  searchKeyword: string,
) {
  const offset = (page - 1) * ITEMS_PER_PAGE;
  const orderBy: string[] = [];
  if (priceFilter === "asc") {
    orderBy.push("p.current_price ASC");
  } else if (priceFilter === "desc") {
    orderBy.push("p.current_price DESC");
  }
  if (timeFilter === "asc") {
    orderBy.push("p.end_time ASC");
  } else if (timeFilter === "desc") {
    orderBy.push("p.end_time DESC");
  }

  const results = await ProductsModel.getProductsPageList(cat2_id, ITEMS_PER_PAGE, offset, orderBy, searchKeyword);

  const numberOfPages = results.length > 0 ? Math.ceil(Number(results[0].total_count) / ITEMS_PER_PAGE) : 0;
  return {
    data: results,
    numberOfPages,
    quantity: results.length > 0 ? Number(results[0].total_count) : 0,
  };
}

// Retrieve details for a specific product and validate its slug matches the name
export async function getProductDetailBySlugId(product_id: string, product_slug: string) {
  const productName = await ProductsModel.getProductNameById(product_id);
  if (!productName) {
    return null;
  }
  // Only validate slug if one was provided
  if (product_slug) {
    const generatedSlug = slugify(productName);
    if (generatedSlug !== product_slug) {
      return null;
    }
  }
  return await ProductsModel.getProductById(Number(product_id));
}

// Handle posting a new product along with multiple image uploads to Cloudinary
export async function postNewProduct(reqBody: NewProductRequest, files: Express.Multer.File[], user_id: number): Promise<void> {
  const imageUrls: string[] = [];
  for (const file of files) {
    const uploadResult = await uploadToCloudinary(file.path, "product_images");
    fs.unlinkSync(file.path);
    imageUrls.push(uploadResult.secure_url);
  }

  const newProductData: Prisma.productsUncheckedCreateInput = {
    product_name: reqBody.product_name,
    seller_id: BigInt(user_id),
    step_price: Number(reqBody.step_price),
    start_price: Number(reqBody.start_price),
    buy_now_price: Number(reqBody.buy_now_price),
    current_price: Number(reqBody.start_price),
    cat2_id: BigInt(reqBody.cat2_id),
    start_time: reqBody.start_time,
    bid_turns: 0,
    end_time: reqBody.end_time,
    description: reqBody.description,
    auto_extended: reqBody.auto_extended === true || reqBody.auto_extended === "true",
    product_images: imageUrls,
  };

  await ProductsModel.postNewProduct(newProductData);
}

// Retrieve dashboard listings by categories (won, sold, selling, inventory)
export async function getMyProductsList(user_id: number, type: string, page: number) {
  const offset = (page - 1) * DASHBOARD_ITEMS_PER_PAGE;
  let results: ProductRow[] = [];

  switch (type) {
    case "my-favorites":
      results = await ProductsModel.getMyFavoriteProducts(user_id, DASHBOARD_ITEMS_PER_PAGE, offset);
      break;
    case "my-selling":
      results = await ProductsModel.getMySellingProducts(user_id, DASHBOARD_ITEMS_PER_PAGE, offset);
      break;
    case "my-sold":
      results = await ProductsModel.getMySoldProducts(user_id, DASHBOARD_ITEMS_PER_PAGE, offset);
      break;
    case "my-won":
      results = await ProductsModel.getMyWonProducts(user_id, DASHBOARD_ITEMS_PER_PAGE, offset);
      break;
    case "my-bidding":
      results = await ProductsModel.getMyBiddingProducts(user_id, DASHBOARD_ITEMS_PER_PAGE, offset);
      break;
    case "my-inventory":
      results = await ProductsModel.getMyInventoryProducts(user_id, DASHBOARD_ITEMS_PER_PAGE, offset);
      break;
    default:
      return null;
  }

  const numberOfPages = results.length > 0 ? Math.ceil(Number(results[0].total_count) / DASHBOARD_ITEMS_PER_PAGE) : 0;
  return {
    data: results,
    numberOfPages,
    quantity: results.length > 0 ? Number(results[0].total_count) : 0,
  };
}

// Search products using text matching with pagination
export async function searchProducts(query: string, page: number) {
  const limit = 6;
  const offset = (page - 1) * limit;
  const results = await ProductsModel.searchProducts(query.trim(), limit, offset);
  return {
    data: results,
    numberOfPages: results.length > 0 ? Math.ceil(Number(results[0].total_count) / limit) : 0,
    quantity: results.length > 0 ? Number(results[0].total_count) : 0,
  };
}

// Retrieve favorite love count status details
export async function getLoveStatus(user_id: number | null, product_id: number) {
  const status = await ProductsModel.getLoveStatus(user_id, product_id);
  return {
    is_loved: status.is_loved,
    total_loves: Number(status.total_loves),
  };
}

// Update love preference status for a product
export async function updateLoveStatus(user_id: number, product_id: number, love_status: boolean): Promise<void> {
  const currentStatus = await ProductsModel.checkProductIsLoved(user_id, product_id);
  if (love_status && !currentStatus) {
    await ProductsModel.loveProduct(user_id, product_id);
  } else if (!love_status && currentStatus) {
    await ProductsModel.unloveProduct(user_id, product_id);
  }
}

// Retrieve questions mapped to product
export async function getProductQuestions(product_id: number, page: number, limit: number) {
  const offset = (page - 1) * limit;
  const allQuestions = await ProductsModel.getProductQuestions(product_id, limit, offset);
  return {
    data: allQuestions,
    total_questions: allQuestions.length > 0 ? Number(allQuestions[0].total_count) : 0,
  };
}

// Submit a new question or reply answer on product page
export async function postProductQuestion(
  product_id: number,
  user_id: number,
  content: string,
  question_parent_id: number | null,
) {
  const insertData: Prisma.product_questionsUncheckedCreateInput = {
    product_id: BigInt(product_id),
    user_id,
    content,
  };
  if (question_parent_id) {
    insertData.question_parent_id = BigInt(question_parent_id);
  }
  const result = await ProductsModel.postProductQuestion(insertData);

  const sellerInfo = await ProductsModel.getSellerOfProduct(product_id);
  if (sellerInfo && sellerInfo.user_id !== user_id && sellerInfo.product_name && sellerInfo.username && sellerInfo.email) {
    const product_name = sellerInfo.product_name;
    const product_name_slug = slugify(product_name);
    const productUrl = `${process.env.CLIENT_URL}/product/${product_name_slug}-${product_id}`;
    const emailContent = sendBidderQuestionTemplate({
      seller_username: sellerInfo.username,
      product_name,
      productUrl,
      content,
    });
    sendMail(sellerInfo.email, "New question regarding your product", emailContent);
  }

  let userInParentQuestion = null;
  if (question_parent_id) {
    userInParentQuestion = await ProductsModel.getUserInParentQuestion(question_parent_id);
  }
  if (
    userInParentQuestion?.user_id !== undefined
    && sellerInfo?.user_id !== undefined
    && userInParentQuestion.user_id !== sellerInfo.user_id
    && user_id === sellerInfo.user_id
    && sellerInfo.product_name
    && sellerInfo.username
    && userInParentQuestion.username
    && userInParentQuestion.email
    && userInParentQuestion.content
  ) {
    const product_name = sellerInfo.product_name;
    const product_name_slug = slugify(product_name);
    const productUrl = `${process.env.CLIENT_URL}/product/${product_name_slug}-${product_id}`;
    const emailContent = sendSellerAnswerTemplate({
      bidder_username: userInParentQuestion.username,
      seller_username: sellerInfo.username,
      product_name,
      productUrl,
      bidder_question: userInParentQuestion.content,
      content,
    });
    sendMail(userInParentQuestion.email, "Seller replied to your question", emailContent);
  }

  return result;
}

// Fetch related product list matching category recommendation
export async function getRelatedProducts(category_id: number, product_id: number | null, limit: number) {
  return await ProductsModel.getRelatedProducts(category_id, product_id, limit);
}

// Modify descriptions and alert the lead bidder by email if necessary
export async function updateProductDescription(
  product_id: number,
  seller_id: number,
  newDescription: string,
): Promise<{ status: string; message: string }> {
  const isAuthorized = await ProductsModel.verifyProductSeller(product_id, seller_id);
  if (!isAuthorized) {
    return {
      status: "403",
      message: "You are not authorized to update this product.",
    };
  }
  await ProductsModel.updateProductDescription(product_id, newDescription);

  const productInfo = await ProductsModel.getProductById(product_id);
  if (
    productInfo
    && (productInfo.bid_turns ?? 0n) > 0n
    && productInfo.price_owner_id
    && productInfo.product_name
    && productInfo.price_owner_username
    && productInfo.current_price !== null
  ) {
    const emailContent = getProductDescriptionChangedTemplate({
      bidderUsername: productInfo.price_owner_username,
      productName: productInfo.product_name,
      currentPrice: productInfo.current_price,
      productUrl: `${process.env.CLIENT_URL}/product/${slugify(productInfo.product_name)}-${productInfo.product_id}`,
      changeDate: new Date().toLocaleString(),
    });
    const userInfo = await usersModel.getUserById(Number(productInfo.price_owner_id));
    if (userInfo) {
      sendMail(userInfo.email, "Product description update alert", emailContent);
    }
  }

  return {
    status: "200",
    message: "Product description updated successfully.",
  };
}

// Fetch auction listing winner details
export async function getProductDetailForWinner(product_id: number, winner_id: number) {
  const productDetail = await ProductsModel.getProductDetailForWinner(product_id, winner_id);
  if (!productDetail) {
    return null;
  }
  const infoSeller = await usersModel.getUserById(Number(productDetail.seller_id));
  return { productDetail, infoSeller };
}

// Fetch top products ending soon
export async function getTopEndingSoonProducts(limit: number) {
  return await ProductsModel.fetchTopEndingSoonProducts(limit);
}

// Fetch top products with highest prices
export async function getTopHighestPriceProducts(limit: number) {
  return await ProductsModel.fetchTopHighestPriceProducts(limit);
}

// Fetch top products with most bids
export async function getTopMostBidProducts(limit: number) {
  return await ProductsModel.fetchTopMostBidProducts(limit);
}

// Calculate total product count matching admin parameters
export async function calTotalProducts(filter: ProductFilter, is_removed: boolean) {
  return await ProductsModel.calTotalProducts(filter, is_removed);
}

// Fetch admin paginated products list with detailed creator names
export async function getAdminProductList(page: number, limit: number, filter: ProductFilter, is_removed: boolean) {
  const list = await ProductsModel.getProductWithOffsetLimit((page - 1) * limit, limit, filter, is_removed);

  for (const product of list) {
    const creator = await accountRepository.findDetailedById(Number(product.seller_id));
    product.creator_name = creator ? creator.full_name : "Unknown";
  }

  return list;
}

// Retrieve general product details by ID
export async function getProductById(id: number) {
  const product = await ProductsModel.getProductById(id);
  if (!product) return null;
  const seller = await accountRepository.findDetailedById(Number(product.seller_id));
  if (seller) {
    product.seller_name = seller.full_name;
  }
  return product;
}

// Soft delete a product
export async function deleteProductById(id: number): Promise<void> {
  await ProductsModel.deleteProductById(id);
}

// Restore a soft-deleted product
export async function restoreProductById(id: number): Promise<void> {
  await ProductsModel.restoreProductById(id);
}

// Permanently destroy a product
export async function destroyProductById(id: number): Promise<void> {
  await ProductsModel.destroyProductById(id);
}

// Automatically extend product bidding time if needed
export async function extendBiddingTimeIfNeeded(product_id: number): Promise<void> {
  const product = await ProductsModel.getProductForExtension(product_id);
  if (!product) {
    return;
  }
  const setting = await ProductsModel.getExtendTimeSetting();
  if (!setting) {
    return;
  }
  const extend_time = Number(setting.extend_time ?? 0n);
  const threshold_time = Number(setting.threshold_time ?? 0n);

  const currentTime = new Date();
  if (!product.end_time) return;
  const endTime = new Date(product.end_time);
  const timeDiff = (endTime.getTime() - currentTime.getTime()) / (1000 * 60);
  if (timeDiff <= threshold_time) {
    const newEndTime = new Date(endTime.getTime() + extend_time * 60 * 1000);
    await ProductsModel.updateProductEndTime(product_id, newEndTime);

    const productInfo = await ProductsModel.getProductById(product_id);
    emitBidUpdate(product_id, { data: productInfo });
  }
}

// Verify if a product is in active bidding time
export async function isProductInBiddingTime(product_id: number): Promise<boolean> {
  return await ProductsModel.isProductInBiddingTime(product_id);
}
