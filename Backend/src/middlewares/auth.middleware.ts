import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import * as AccountsModel from "@/modules/accounts/accounts.model.ts";
import { AccountRequest } from "../interfaces/request.interface.ts";

export async function verifyToken(
  req: AccountRequest,
  res: Response,
  next: NextFunction
) {
  const token = req.cookies.accessToken;
  if (!token) {
    return res.status(401).json({ message: "Access token is missing" });
  }

  const decoded = jwt.verify(
    token,
    process.env.JWT_SECRET as string
  ) as JwtPayload;
  const account = await AccountsModel.findAccountById(decoded?.user_id);

  if (!account) {
    return res.status(403).json({ message: "Invalid access token" });
  }

  req.user = account;
  next();
}

export function verifyRole(...allowedRoles: string[]) {
  return (req: AccountRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" });
    }
    if (!allowedRoles.includes(req.user.role)) {
      // Format return message with allowed roles
      return res
        .status(403)
        .json({
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
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JwtPayload;
    const account = await AccountsModel.findAccountById(decoded?.user_id);
    if (account) {
      (req as AccountRequest).user = account;
    }
    next();
  }
  catch (e) {
    next();
  }
}
 
