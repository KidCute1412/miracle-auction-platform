// Authentication application operations: no Express or database query code lives here.
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { accountRepository, type NewAccount } from "../infrastructure/account.repository.ts";

const SALT_ROUNDS = 10;
const SECTION_TYPES = ["long", "short"];

// Hash passwords using bcrypt
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  return await bcrypt.hash(password, salt);
}

// Compare password with hash
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

// Verify Google reCAPTCHA token validity
export async function verifyCaptcha(token: string): Promise<boolean> {
  try {
    const secretKey = process.env.CAPTCHA_SECRET_KEY;
    if (!secretKey) {
      console.error("Missing CAPTCHA_SECRET_KEY in env configuration");
      return false;
    }
    const params = new URLSearchParams({ secret: secretKey, response: token });
    const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });
    const data: unknown = await response.json();
    return typeof data === "object" && data !== null && "success" in data && data.success === true;
  } catch (error) {
    console.error("Error validating CAPTCHA:", error);
    return false;
  }
}

type UserPayload = {
  user_id: number;
  role: string;
};

// Generate access JWT token with expiry
export function generateAccessToken(user: UserPayload, rememberMe?: boolean): string {
  const payload = { user_id: user.user_id, role: user.role };
  return jwt.sign(payload, process.env.JWT_SECRET as string, {
    expiresIn: rememberMe ? "3d" : "1d",
  });
}

// Generate refresh JWT token with expiry
export function generateRefreshToken(user: UserPayload, rememberMe: boolean): string {
  const payload = {
    id: user.user_id,
    role: user.role,
    section: rememberMe ? SECTION_TYPES[0] : SECTION_TYPES[1],
  };
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET as string, {
    expiresIn: rememberMe ? "7d" : "1d",
  });
}

// Delete expired OTP verification entries
export async function deleteExpiredOTP(): Promise<void> {
  await accountRepository.deleteExpiredOtps();
}

// Verify email and OTP match in database
export async function findEmailAndOtp(email: string, otp: string) {
  return accountRepository.findOtp(email, otp);
}

// Delete OTP verification record
export async function deletedOTP(email: string): Promise<void> {
  await accountRepository.deleteOtp(email);
}

// Find user account details by email
export async function findEmail(email: string) {
  return accountRepository.findByEmail(email);
}

// Find user OTP entry by email
export async function findOtpByEmail(email: string) {
  return accountRepository.findOtpByEmail(email);
}

// Insert OTP code record into database
export async function insertOtpAndEmail(email: string, otp: string): Promise<void> {
  await accountRepository.createOtp(email, otp);
}

// Create new user account registration entry
export async function insertAccount(data: NewAccount): Promise<void> {
  await accountRepository.create(data);
}

// Update user account password
export async function updatePassword(email: string, newPassword: string): Promise<void> {
  await accountRepository.updatePassword(email, newPassword);
}

// Retrieve detailed account data for password changes
export async function findAccountByIdDetailed(user_id: number) {
  return accountRepository.findDetailedById(user_id);
}
