import type { NextFunction, Request, Response } from "express";

import { AppError } from "../errors/AppError";
import { verifyToken } from "../utils/cookie";
import { HTTP_STATUS } from "../constants/httpStatus";
import { MESSAGES } from "../constants/messages";

export const authMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  // 1. Check cookie first
  let token = req.cookies?.["invoice-token"];

  // 2. Fallback to Authorization header
  if (!token) {
    const authHeader = req.headers.authorization;

    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }
  }

  // 3. No token found
  if (!token) {
    return next(
      new AppError({
        statusCode: HTTP_STATUS.UNAUTHORIZED,
        message: MESSAGES.AUTHENTICATION_REQUIRED,
      }),
    );
  }

  // 4. Verify token
  try {
    const payload = verifyToken(token);

    req.user = {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    };

    next();
  } catch {
    next(
      new AppError({
        statusCode: HTTP_STATUS.UNAUTHORIZED,
        message: MESSAGES.INVALID_OR_EXPIRED_TOKEN,
      }),
    );
  }
};
