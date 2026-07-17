import { Router } from "express";
import * as accountsController from "./accounts.controller.ts";
import * as accountValidate from "./accounts.schemas.ts";
import { verifyToken } from "@/middlewares/auth.middleware.ts";
import { issueCsrfToken } from "@/middlewares/csrf.middleware.ts";
import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import { redisClient } from "@/config/redis.config.ts";

const route = Router();
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore({ sendCommand: (...args: string[]) => redisClient.call(args[0], ...args.slice(1)) as never }),
  message: { code: "error", message: "Too many authentication attempts. Please try again later." },
});

route.get("/csrf", (req, res) => res.json({ code: "success", token: issueCsrfToken(req, res) }));

// Create a new account (register)
route.post("/", accountValidate.registerPost, accountsController.registerPost);

// Check account verification status
route.get("/verification", accountsController.verifyAccount);

// Verify registration OTP and finalize account
route.post("/registration/verification", accountValidate.registerVerifyPost, accountsController.registerVerifyPost);

// Verify forgot password OTP
route.patch("/password/recovery/verification", accountValidate.forgotPasswordVerify, accountsController.forgotPasswordVerify);

// Initiate password recovery process
route.post("/password/recovery", authLimiter, accountValidate.forgotPassword, accountsController.forgotPassword);

// Reset account password (full replacement)
route.put("/password", accountValidate.resetPassword, accountsController.resetPassword);

// Change password with auth validation
route.patch("/password", verifyToken, accountValidate.changePassword, accountsController.changePassword);

// Verify password change OTP
route.post("/password/verification", verifyToken, accountValidate.verifyChangePassword, accountsController.verifyChangePassword);

// Create login session
route.post("/sessions", authLimiter, accountValidate.loginPost, accountsController.loginPost);

// Create login session via Google OAuth
route.post("/sessions/google", authLimiter, accountValidate.googleLoginPost, accountsController.googleLoginPost);

// Refresh login session
route.post("/sessions/refresh", authLimiter, accountsController.refreshSession);

// Destroy login session (logout)
route.delete("/sessions", accountsController.logoutPost);

export default route;
