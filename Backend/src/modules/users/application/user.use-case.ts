import * as UsersModel from "../infrastructure/user.repository.ts";
import { sendMail } from "@/helpers/mail.helper.ts";
import bcrypt from "bcryptjs";

const NEW_PASSWORD = "OnlineAuction123@";
const SALT_ROUNDS = 10;

// Hash password with bcrypt
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  return await bcrypt.hash(password, salt);
}

// Retrieve user detail profile by ID
export async function getUserById(user_id: number) {
  return await UsersModel.getUserById(user_id);
}

// Submit user upgrade seller application request
export async function registerSellerRequest(user_id: number, reason: string): Promise<void> {
  await UsersModel.registerSellerRequest(user_id, reason);
}

// Check upgrade request status
export async function checkRegisterSellerRequest(user_id: number): Promise<boolean> {
  return await UsersModel.checkRegisterSellerRequest(user_id);
}

// Submit a review rating score
export async function rateUser(user_id: number, rater_id: number, score: number, comment: string) {
  return await UsersModel.rateUser(user_id, rater_id, score, comment);
}

// Get count of ratings
export async function getUserRatingCount(user_id: number, username: string) {
  return await UsersModel.getUserRatingCount(user_id, username);
}

// Get user rating records log history
export async function getUserRatingHistory(user_id: number, username: string, offset: number, limit: number) {
  return await UsersModel.getUserRatingHistory(user_id, username, offset, limit);
}

// Get count of users
export async function calTotalUsers(filter: any) {
  return await UsersModel.calTotalUsers(filter);
}

// Fetch users list with pagination
export async function getUsersWithOffsetLimit(offset: number, limit: number, filter: any) {
  return await UsersModel.getUsersWithOffsetLimit(offset, limit, filter);
}

// Update role and status flags
export async function editUserRoleAndStatus(user_id: number, role: string, status: string): Promise<void> {
  await UsersModel.updateUserRole(user_id, role);
  await UsersModel.updateUserStatus(user_id, status);
}

// Reset password to default value and notify user by email
export async function resetUserPassword(user_id: number): Promise<boolean> {
  const user = await UsersModel.getUserById(user_id);
  if (!user) {
    return false;
  }
  const title = "Password reset request for your account";
  const content = `Your new password is: ${NEW_PASSWORD}. Please log in and change your password immediately.`;
  sendMail(user.email, title, content);
  const hashedPassword = await hashPassword(NEW_PASSWORD);
  await UsersModel.resetUserPassword(user_id, hashedPassword);
  return true;
}

// Calculate total application count
export async function calTotalApplications(filter: any) {
  return await UsersModel.calTotalApplications(filter);
}

// Fetch application listing details with name and email joins
export async function getSellerApplicationsDetailed(page: number, limit: number, filter: any) {
  const list = await UsersModel.getAllSellerApplications((page - 1) * limit, limit, filter);
  for (const application of list) {
    const user = await UsersModel.getUserById(application.user_id);
    if (user) {
      application.full_name = user.full_name;
      application.email = user.email;
    }
  }
  return list;
}

// Fetch detailed single upgrade application details
export async function getSellerApplicationByIdDetailed(id: number) {
  const applicationDetail = await UsersModel.getSellerApplicationById(id);
  if (!applicationDetail) return null;
  const userInfo = await UsersModel.getUserById(applicationDetail.user_id);
  if (!userInfo) return null;
  return {
    ...applicationDetail,
    full_name: userInfo.full_name,
    email: userInfo.email,
    username: userInfo.username,
  };
}

// Confirm or reject application form status and update user role if accepted
export async function setApplicationStatus(applicationId: number, status: string): Promise<boolean> {
  await UsersModel.setApplicationStatus(applicationId, status);
  if (status === "accepted") {
    const application = await UsersModel.getSellerApplicationById(applicationId);
    if (application) {
      await UsersModel.updateUserRole(application.user_id, "seller");
    }
  }
  return true;
}
