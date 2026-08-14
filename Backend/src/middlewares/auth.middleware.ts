import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { accountRepository } from "@/modules/accounts/infrastructure/account.repository.ts";
import { AccountRequest } from "../interfaces/request.interface.ts";
import { resolveAuthPrincipal } from "@/modules/accounts/infrastructure/auth-snapshot.cache.ts";

async function authenticateToken(token: string) {
  const decoded = jwt.verify(token, process.env.JWT_SECRET as string, { algorithms: ["HS256"], issuer: "online-auction", audience: "online-auction-api" }) as JwtPayload;
  if (typeof decoded.user_id !== "number" || typeof decoded.auth_version !== "number") return null;
  const principal = await resolveAuthPrincipal(decoded.user_id, (userId) => accountRepository.findAuthPrincipalById(userId));
  if (!principal || principal.status === "inactive" || principal.auth_version !== decoded.auth_version) return null;
  return principal;
}

export async function verifyToken(req: AccountRequest, res: Response, next: NextFunction) {
  const token = req.cookies.accessToken;
  if (!token) {
    return res.status(401).json({ message: "Access token is missing" });
  }

  try {
    const account = await authenticateToken(token);
    if (!account) {
      return res.status(401).json({ message: "Invalid access token" });
    }
    req.user = account;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid access token" });
  }
}

export function verifyRole(...allowedRoles: string[]) {
  return (req: AccountRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" });
    }
    if (!allowedRoles.includes(req.user.role)) {
      // Format return message with allowed roles
      return res.status(403).json({
        message: `Access denied. Allowed roles: ${allowedRoles.join(", ")}`,
      });
    }
    next();
  };
}

export async function justDecodeToken(req: Request, _: Response, next: NextFunction) {
  const token = req.cookies.accessToken;
  if (!token) {
    return next();
  }
  try {
    const account = await authenticateToken(token);
    if (account) {
      (req as AccountRequest).user = account;
    }
    next();
  } catch {
    next();
  }
}
