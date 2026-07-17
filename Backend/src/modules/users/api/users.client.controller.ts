import { Request, Response } from "express";
import * as UsersService from "../application/user.use-case.ts";

// Handle user seller request submission
export async function registerSellerRequest(req: Request, res: Response) {
  const { reason } = req.body;
  const user = (req as any).user;
  const existingRequest = await UsersService.checkRegisterSellerRequest(user.user_id);
  if (existingRequest) {
    return res.status(400).json({
      status: "error",
      message: "You have already submitted a seller upgrade request. Please wait for processing.",
    });
  }
  await UsersService.registerSellerRequest(user.user_id, reason);
  return res.status(200).json({
    status: "success",
    message: "Seller upgrade request submitted successfully.",
  });
}

// Handle rating and score feedback submission
export async function rateUser(req: Request, res: Response) {
  try {
    const rater_id = (req as any).user.user_id;
    const { user_id, score, comment } = req.body;
    await UsersService.rateUser(user_id, rater_id, score, comment);
    return res.status(200).json({
      status: "success",
      message: "User rated successfully.",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: "error",
      message: "An error occurred while rating the user.",
    });
  }
}

// Retrieve ratings counts for a user
export async function getUserRatingCount(req: Request, res: Response) {
  try {
    const user_id = parseInt(req.query.user_id as string);
    const username = req.query.username as string;
    const ratingData = await UsersService.getUserRatingCount(user_id, username);
    return res.status(200).json({
      status: "success",
      data: ratingData,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: "error",
      message: "An error occurred while fetching user rating data.",
    });
  }
}

// Fetch user rating histories
export async function getUserRatingHistory(req: Request, res: Response) {
  try {
    const user_id = parseInt(req.query.user_id as string);
    const username = req.query.username as string;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const offset = (page - 1) * limit;

    const ratingHistory = await UsersService.getUserRatingHistory(user_id, username, offset, limit);
    return res.status(200).json({
      status: "success",
      data: ratingHistory,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: "error",
      message: "An error occurred while fetching user rating history.",
    });
  }
}
