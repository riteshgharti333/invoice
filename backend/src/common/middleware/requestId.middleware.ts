import type { NextFunction, Request, Response } from "express";
import { randomUUID } from "crypto";

declare module "express-serve-static-core" {
  interface Request {
    requestId?: string;
  }
}

export const requestIdMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const requestId = randomUUID();

  req.requestId = requestId;
  res.setHeader("X-Request-Id", requestId);

  next();
};