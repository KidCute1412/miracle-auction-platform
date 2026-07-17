import * as profileRepository from "../infrastructure/profile.repository.ts";
import { uploadToCloudinary } from "@/config/cloud.config.ts";
import fs from "fs";

// Edit user profile details and handle optional avatar upload
export async function editUserProfile(
  data: import("../infrastructure/profile.repository.ts").EditProfileInput,
  file?: Express.Multer.File,
) {
  if (file) {
    const uploadResult = await uploadToCloudinary(file.path, "avatar");
    fs.unlinkSync(file.path);
    data.avatar = uploadResult.secure_url;
  }
  return profileRepository.editUserProfile(data);
}

// Retrieve detailed user profile data and owner verification
export async function getUserProfileDetail(params: {
  username: string;
  user_id: number;
  current_user_id: number | null;
}) {
  return profileRepository.getUserProfileDetail(params);
}
