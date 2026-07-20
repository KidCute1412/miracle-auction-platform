import { Response } from "express";
import * as profileUseCase from "../application/profile.use-case.ts";
import { AccountRequest, requireAuthenticatedUser } from "@/interfaces/request.interface.ts";
import type { EditProfileInput } from "../infrastructure/profile.repository.ts";

// Handle user profile edit requests
export async function editUserProfile(req: AccountRequest, res: Response) {
  try {
    const user = requireAuthenticatedUser(req);
    const data: EditProfileInput = { ...req.body, user_id: user.user_id };

    const file = req.file;
    const results = await profileUseCase.editUserProfile(data, file);

    return res.status(200).json({
      status: "success",
      message: "User profile updated successfully.",
      data: results[0],
    });
  } catch (error) {
    console.error("Error editing user profile:", error);
    return res.status(500).json({
      status: "error",
      message: "Server error while updating user profile.",
    });
  }
}

// Retrieve public user profile details
export async function getUserProfileDetail(req: AccountRequest, res: Response) {
  try {
    const username = req.query.username as string;
    const user_id = req.query.user_id as string;
    const user = req.user;

    if (!username || !user_id) {
      return res.status(400).json({
        status: "error",
        message: "username and user_id are required",
      });
    }

    const profileDetail = await profileUseCase.getUserProfileDetail({
      username,
      user_id: parseInt(user_id),
      current_user_id: user ? user.user_id : null,
    });

    if (!profileDetail) {
      return res.status(404).json({
        status: "error",
        message: "User profile not found",
      });
    }

    return res.status(200).json({
      status: "success",
      data: profileDetail.data,
      is_owner: profileDetail.is_owner,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Server error",
    });
  }
}

// Retrieve private profile metadata for the authenticated user
export function getMeInfo(req: AccountRequest, res: Response) {
  const user = requireAuthenticatedUser(req);
  res.json({
    data: {
      user_id: user.user_id,
      role: user.role,
      email: user.email,
      full_name: user.full_name,
      username: user.username,
      rating: user.rating,
      rating_count: user.rating_count,
      address: user.address,
      date_of_birth: user.date_of_birth,
      avatar: user.avatar,
    },
  });
}
