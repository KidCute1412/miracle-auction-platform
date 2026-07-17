import { Router } from "express";
import * as accountsController from "./accounts.controller.ts";
import * as accountValidate from "./accounts.schemas.ts";
import { verifyToken } from "@/middlewares/auth.middleware.ts";

const route = Router();

// Create a new account (register)
route.post("/", accountValidate.registerPost, accountsController.registerPost);

// Check account verification status
route.get("/verification", accountsController.verifyAccount);

// Verify registration OTP and finalize account
route.post("/registration/verification", accountsController.registerVerifyPost);

// Verify forgot password OTP
route.patch("/password/recovery/verification", accountsController.forgotPasswordVerify);

// Initiate password recovery process
route.post("/password/recovery", accountsController.forgotPassword);

// Reset account password (full replacement)
route.put("/password", accountsController.resetPassword);

// Change password with auth validation
route.patch("/password", verifyToken, accountsController.changePassword);

// Verify password change OTP
route.post("/password/verification", verifyToken, accountsController.verifyChangePassword);

// Create login session
route.post("/sessions", accountValidate.loginPost, accountsController.loginPost);

// Create login session via Google OAuth
route.post("/sessions/google", accountsController.googleLoginPost);

// Destroy login session (logout)
route.delete("/sessions", verifyToken, accountsController.logoutPost);

export default route;
