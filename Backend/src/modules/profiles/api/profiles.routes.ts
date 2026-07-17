import { Router } from "express";
import * as profilesController from "./profiles.controller.ts";
import { verifyToken, justDecodeToken } from "@/middlewares/auth.middleware.ts";
import upload from "@/helpers/uploadImage.helper.ts";

export const profileRouter = Router();

// Get current authenticated user's profile
profileRouter.get("/me", verifyToken, profilesController.getMeInfo);

// Update current authenticated user's profile
profileRouter.patch("/me", verifyToken, upload.single("avatar"), profilesController.editUserProfile);

// Get a public profile by user ID
profileRouter.get("/:id", justDecodeToken, profilesController.getUserProfileDetail);
