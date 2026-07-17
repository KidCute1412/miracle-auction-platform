import crypto from "crypto";
import { NextFunction, Request, Response } from "express";

const COOKIE = "csrfToken";
const HEADER = "x-csrf-token";
const secret = () => {
  if (process.env.CSRF_SECRET) return process.env.CSRF_SECRET;
  if (process.env.NODE_ENV === "production") throw new Error("CSRF_SECRET must be configured in production");
  return process.env.JWT_SECRET || "development-only-csrf-secret";
};
const sign = (value: string) => crypto.createHmac("sha256", secret()).update(value).digest("base64url");

export function issueCsrfToken(req: Request, res: Response) {
  const existing = req.cookies?.[COOKIE] as string | undefined;
  if (existing?.includes(".")) return existing;
  const token = crypto.randomBytes(32).toString("base64url");
  const signed = `${token}.${sign(token)}`;
  res.cookie(COOKIE, signed, { httpOnly: false, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/" });
  return signed;
}

export function csrfProtection(req: Request, res: Response, next: NextFunction) {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return next();
  const origin = req.get("origin");
  const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
  const cookie = req.cookies?.[COOKIE] as string | undefined;
  const header = req.get(HEADER);
  if (!origin || origin !== clientUrl || !cookie || !header || cookie !== header) {
    return res.status(403).json({ code: "error", message: "Invalid CSRF token" });
  }
  const [token, signature] = cookie.split(".");
  const expected = sign(token || "");
  if (!token || !signature || signature.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    return res.status(403).json({ code: "error", message: "Invalid CSRF token" });
  }
  next();
}
