import { Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import * as AccountsService from "../application/account-auth.use-case.ts";
import { generateOTP } from "@/helpers/generate.helper.ts";
import { sendMail } from "@/helpers/mail.helper.ts";
import type { AccountRequest } from "@/interfaces/request.interface.ts";

const googleClient = new OAuth2Client();

type GoogleAccountData = {
  full_name: string;
  email: string;
  username: string;
  address: null;
};

// Verify user account with OTP cookie
export const verifyAccount = async (req: Request, res: Response) => {
  await AccountsService.deleteExpiredOTP();
  const verified_otp_token = req.cookies.verified_otp_token;
  if (!verified_otp_token) {
    res.json({ code: "error", message: "An error occurred here" });
    return;
  }
  const decoded = jwt.verify(verified_otp_token, `${process.env.JWT_SECRET}`) as JwtPayload;
  const existedOTP = await AccountsService.findEmailAndOtp(decoded.email, decoded.otp);
  if (!existedOTP) {
    res.clearCookie("verified_otp_token");
    res.json({ code: "error", message: "An error occurred here" });
    return;
  }
  res.json({ code: "success", message: "OTP is valid for 5 minutes" });
};

// Process user registration request
export const registerPost = async (req: Request, res: Response) => {
  const existedEmail = await AccountsService.findEmail(req.body.email);
  if (existedEmail) {
    res.json({ code: "error", message: "Email already exists in the system!" });
    return;
  }
  await AccountsService.deleteExpiredOTP();
  const existedOTP = await AccountsService.findOtpByEmail(req.body.email);
  if (existedOTP) {
    res.json({ code: "existedOTP", message: "OTP has been sent and is valid for 5 minutes!" });
    return;
  }
  const length = 6;
  const otp = generateOTP(length);
  await AccountsService.insertOtpAndEmail(req.body.email, otp);
  const verified_otp_token = jwt.sign(
    {
      otp: otp,
      email: req.body.email,
      full_name: req.body.full_name,
      address: req.body.address,
      password: req.body.password,
    },
    `${process.env.JWT_SECRET}`,
    { expiresIn: "5m" },
  );
  const title = "Registration OTP Confirmation";
  const content = `Your OTP is <b>${otp}</b>. It is valid for 5 minutes. Do not share it.`;
  sendMail(req.body.email, title, content);
  res.cookie("verified_otp_token", verified_otp_token, {
    maxAge: 5 * 60 * 1000,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
  res.json({ code: "success", message: "Please enter the OTP" });
};

// Validate registration OTP and create account
export const registerVerifyPost = async (req: Request, res: Response) => {
  await AccountsService.deleteExpiredOTP();
  const verified_otp_token = req.cookies.verified_otp_token;
  if (!verified_otp_token) {
    res.json({ code: "error", message: "An error occurred here" });
    return;
  }
  const decoded = jwt.verify(verified_otp_token, `${process.env.JWT_SECRET}`) as JwtPayload;
  const existedRecord = await AccountsService.findEmailAndOtp(`${decoded.email}`, req.body.otp);
  if (!existedRecord) {
    res.json({ code: "otp error", message: "Invalid OTP!" });
    return;
  }
  decoded.password = await AccountsService.hashPassword(decoded.password);
  const finalData = {
    full_name: decoded.full_name,
    email: decoded.email,
    password: decoded.password,
    address: decoded.address,
    username: decoded.full_name,
  };
  await AccountsService.insertAccount(finalData);
  await AccountsService.deletedOTP(finalData.email);
  res.clearCookie("verified_otp_token");
  res.json({ code: "success", message: "Congratulations, registered successfully" });
};

// Handle account login
export const loginPost = async (req: Request, res: Response) => {
  const captchaResponse = await AccountsService.verifyCaptcha(req.body.captchaToken);
  if (!captchaResponse) {
    res.json({ code: "error", message: "Invalid Captcha" });
    return;
  }
  const existedAccount = await AccountsService.findEmail(req.body.email);
  if (!existedAccount) {
    res.json({ code: "error", message: "Email does not exist in the system" });
    return;
  }
  const isPasswordValidate = await AccountsService.comparePassword(req.body.password, existedAccount.password ?? "");
  if (!isPasswordValidate) {
    res.json({ code: "error", message: "Incorrect password" });
    return;
  }
  if (existedAccount.status === "inactive") {
    res.json({
      code: "error",
      message: "Your account is deactivated. Please contact the administrator.",
    });
    return;
  }
  const accessToken = AccountsService.generateAccessToken(
    { user_id: existedAccount.user_id, role: existedAccount.role },
    req.body.rememberMe,
  );
  res.cookie("accessToken", accessToken, {
    maxAge: req.body.rememberMe ? 3 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
  res.json({
    code: "success",
    role: existedAccount.role,
    message: "Welcome to our website!",
  });
};

// Send OTP code for password recovery
export const forgotPassword = async (req: Request, res: Response) => {
  const existedEmail = await AccountsService.findEmail(req.body.email);
  if (!existedEmail) {
    res.json({ code: "error", message: "Email does not exist" });
    return;
  }
  await AccountsService.deleteExpiredOTP();
  const existedOTP = await AccountsService.findOtpByEmail(req.body.email);
  if (existedOTP) {
    res.json({ code: "existedOTP", message: "OTP has been sent and is valid for 5 minutes!" });
    return;
  }
  const length = 6;
  const otp = generateOTP(length);
  await AccountsService.insertOtpAndEmail(req.body.email, otp);
  const verified_otp_token = jwt.sign({ otp: otp, email: req.body.email }, `${process.env.JWT_SECRET}`, {
    expiresIn: "5m",
  });
  const title = "OTP for password recovery";
  const content = `Your OTP is <b>${otp}</b>. It is valid for 5 minutes. Do not share it.`;
  sendMail(req.body.email, title, content);
  res.cookie("verified_otp_token", verified_otp_token, {
    maxAge: 5 * 60 * 1000,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
  res.json({ code: "success", message: "Please enter the OTP" });
};

// Validate password recovery OTP
export const forgotPasswordVerify = async (req: Request, res: Response) => {
  await AccountsService.deleteExpiredOTP();
  const verified_otp_token = req.cookies.verified_otp_token;
  if (!verified_otp_token) {
    res.json({ code: "error", message: "An error occurred here" });
    return;
  }
  const decoded = jwt.verify(verified_otp_token, `${process.env.JWT_SECRET}`) as JwtPayload;
  const existedRecord = await AccountsService.findEmailAndOtp(`${decoded.email}`, req.body.otp);
  if (!existedRecord) {
    res.json({ code: "otp error", message: "Invalid OTP!" });
    return;
  }
  res.json({ code: "success", message: "Please enter your password again" });
};

// Reset account password
export const resetPassword = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const newPassword = await AccountsService.hashPassword(password);
  await AccountsService.updatePassword(email, newPassword);
  await AccountsService.deletedOTP(email);
  res.clearCookie("verified_otp_token");
  res.json({ code: "success", message: "Password reset successfully" });
};

// Log out active user session
export const logoutPost = async (_: Request, res: Response) => {
  res.clearCookie("accessToken");
  res.json({ code: "success", message: "Logged out successfully", data: null });
};

// Sign in or sign up via Google authentication
export const googleLoginPost = async (req: Request, res: Response) => {
  try {
    const credential = typeof req.body.credential === "string" ? req.body.credential : "";
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!credential || !clientId) {
      res.status(400).json({ code: "error", message: "Google login is not configured correctly." });
      return;
    }
    const ticket = await googleClient.verifyIdToken({ idToken: credential, audience: clientId });
    const payload = ticket.getPayload();
    if (!payload?.email || !payload.email_verified) {
      res.status(401).json({ code: "error", message: "Google account email could not be verified." });
      return;
    }
    const infoUser = { email: payload.email, name: payload.name || payload.email.split("@")[0] };
    const existedAccount = await AccountsService.findEmail(infoUser.email);
    if (existedAccount) {
      if (existedAccount.password) {
        res.json({
          code: "error",
          message: "Account registered with email/password. Please log in using that method.",
        });
        return;
      }
      const accessToken = AccountsService.generateAccessToken(
        { user_id: existedAccount.user_id, role: existedAccount.role },
        req.body.rememberMe,
      );
      res.cookie("accessToken", accessToken, {
        maxAge: req.body.rememberMe ? 3 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });
      res.json({
        code: "success",
        role: existedAccount.role,
        message: "Welcome to our website!",
      });
    } else {
      const finalData: GoogleAccountData = {
        full_name: infoUser.name,
        email: infoUser.email,
        username: infoUser.name,
        address: null,
      };
      await AccountsService.insertAccount(finalData);
      const newAccount = await AccountsService.findEmail(infoUser.email);
      if (!newAccount) {
        res.status(500).json({ code: "error", message: "Account could not be created." });
        return;
      }
      const accessToken = AccountsService.generateAccessToken(
        { user_id: newAccount.user_id, role: newAccount.role },
        req.body.rememberMe,
      );
      res.cookie("accessToken", accessToken, {
        maxAge: req.body.rememberMe ? 3 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });
      res.json({
        code: "success",
        role: newAccount.role,
        message: "Welcome to our website!",
      });
    }
  } catch (error) {
    console.error(
      "[AUTH] Google ID token verification failed:",
      error instanceof Error ? error.message : "unknown error",
    );
    res.status(401).json({ code: "error", message: "Google sign-in could not be verified." });
  }
};

// Start password change workflow
export const changePassword = async (req: AccountRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user_id = req.user?.user_id;
    if (!user_id) {
      res.status(401).json({ code: "error", message: "User not authenticated" });
      return;
    }
    const existedAccount = await AccountsService.findAccountByIdDetailed(user_id);
    if (!existedAccount) {
      res.json({ code: "error", message: "Account does not exist" });
      return;
    }
    const isPasswordValid = await AccountsService.comparePassword(currentPassword, existedAccount.password ?? "");
    if (!isPasswordValid) {
      res.json({ code: "error", message: "Current password is incorrect" });
      return;
    }
    const isSamePassword = await AccountsService.comparePassword(newPassword, existedAccount.password ?? "");
    if (isSamePassword) {
      res.json({ code: "error", message: "New password must be different from current password" });
      return;
    }
    await AccountsService.deleteExpiredOTP();
    await AccountsService.deletedOTP(existedAccount.email);
    res.clearCookie("change_password_token");
    const length = 6;
    const otp = generateOTP(length);
    await AccountsService.insertOtpAndEmail(existedAccount.email, otp);
    const change_password_token = jwt.sign(
      {
        otp: otp,
        email: existedAccount.email,
        user_id: user_id,
        newPassword: newPassword,
      },
      `${process.env.JWT_SECRET}`,
      { expiresIn: "5m" },
    );
    const title = "Change Password OTP Confirmation";
    const content = `Your OTP is <b>${otp}</b>. It is valid for 5 minutes. Do not share it.`;
    sendMail(existedAccount.email, title, content);
    res.cookie("change_password_token", change_password_token, {
      maxAge: 5 * 60 * 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
    res.json({ code: "success", message: "OTP sent to your email" });
  } catch (error) {
    console.error("Change password error:", error);
    res.json({ code: "error", message: "An error occurred, please try again" });
  }
};

// Verify password change OTP
export const verifyChangePassword = async (req: Request, res: Response) => {
  try {
    await AccountsService.deleteExpiredOTP();
    const change_password_token = req.cookies.change_password_token;
    if (!change_password_token) {
      res.json({ code: "error", message: "Session expired" });
      return;
    }
    const decoded = jwt.verify(change_password_token, `${process.env.JWT_SECRET}`) as JwtPayload;
    const existedRecord = await AccountsService.findEmailAndOtp(decoded.email, req.body.otp);
    if (!existedRecord) {
      res.json({ code: "otp error", message: "Invalid OTP!" });
      return;
    }
    const hashedNewPassword = await AccountsService.hashPassword(decoded.newPassword);
    await AccountsService.updatePassword(decoded.email, hashedNewPassword);
    await AccountsService.deletedOTP(decoded.email);
    res.clearCookie("change_password_token");
    res.json({ code: "success", message: "Password changed successfully" });
  } catch (error) {
    console.error("Verify change password error:", error);
    res.json({ code: "error", message: "An error occurred, please try again" });
  }
};
