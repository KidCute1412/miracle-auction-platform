import { createComponentLogger } from "@/infrastructure/observability/logger.ts";

const log = createComponentLogger("profiles.controller");

import { Response } from "express";
import * as profileUseCase from "../application/profile.use-case.ts";
import { AccountRequest, requireAuthenticatedUser } from "@/interfaces/request.interface.ts";
import type { EditProfileInput } from "../infrastructure/profile.repository.ts";
import { accountRepository } from "@/modules/accounts/infrastructure/account.repository.ts";

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
    log.error("Error editing user profile:", error);
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
  } catch {
    return res.status(500).json({
      status: "error",
      message: "Server error",
    });
  }
}

// Retrieve private profile metadata for the authenticated user
export async function getMeInfo(req: AccountRequest, res: Response) {
  const user = requireAuthenticatedUser(req);
  const profile = await accountRepository.findById(user.user_id);
  if (!profile) return res.status(404).json({ status: "error", message: "User profile not found" });
  res.json({
    data: {
      user_id: profile.user_id,
      role: profile.role,
      email: profile.email,
      full_name: profile.full_name,
      username: profile.username,
      rating: profile.rating,
      rating_count: profile.rating_count,
      address: profile.address,
      date_of_birth: profile.date_of_birth,
      avatar: profile.avatar,
    },
  });
}
