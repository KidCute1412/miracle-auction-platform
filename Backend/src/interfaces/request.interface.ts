import type { Request } from "express";

export interface AuthenticatedAccount {
  user_id: number;
  email: string;
  username: string;
  role: string;
  rating: number | null;
  rating_count: number | null;
  full_name?: string | null;
  address?: string | null;
  date_of_birth?: string | Date | null;
  avatar?: string | null;
  [key: string]: unknown;
}

export interface AccountRequest extends Request {
  user?: AuthenticatedAccount;
}

export function requireAuthenticatedUser(req: AccountRequest): AuthenticatedAccount {
  if (!req.user) throw new Error("Authenticated user is required before controller execution");
  return req.user;
}
