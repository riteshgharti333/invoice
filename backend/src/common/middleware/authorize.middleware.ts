import type { NextFunction, Request, Response } from "express";

import { AppError } from "../errors/AppError";
import { HTTP_STATUS } from "../constants/httpStatus";

type UserRole = "ADMIN" | "USER";

export const authorize =
  (...allowedRoles: UserRole[]) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    const user = req.user;

    if (!user) {
      return next(
        new AppError({
          statusCode: HTTP_STATUS.UNAUTHORIZED,
          message: "Authentication required",
        })
      );
    }

    // This assumes you'll later add `role` to req.user.
    const role = (user as typeof user & { role?: UserRole }).role;

    if (!role || !allowedRoles.includes(role)) {
      return next(
        new AppError({
          statusCode: HTTP_STATUS.FORBIDDEN,
          message: "You do not have permission to perform this action",
        })
      );
    }

    next();
  };