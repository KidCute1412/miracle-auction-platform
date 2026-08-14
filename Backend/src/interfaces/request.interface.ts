import type { Request } from "express";

export interface AuthenticatedAccount {
  user_id: number;
  role: string;
  status: string;
  auth_version: number;
}

export interface AccountRequest extends Request {
  user?: AuthenticatedAccount;
}

export function requireAuthenticatedUser(req: AccountRequest): AuthenticatedAccount {
  if (!req.user) throw new Error("Authenticated user is required before controller execution");
  return req.user;
}
