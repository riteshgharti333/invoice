import jwt, { type Secret, type SignOptions } from "jsonwebtoken";
import type { Response } from "express";
import { env } from "../../config/env";

interface JwtPayload {
  userId: string;
  email: string;
  role: "ADMIN" | "USER";
}

const JWT_SECRET: Secret = env.JWT_SECRET;

const JWT_OPTIONS: SignOptions = {
  expiresIn: (env.JWT_EXPIRES_IN as SignOptions["expiresIn"]) || "7d",
};

export function generateToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, JWT_OPTIONS);
}

export function setTokenCookie(res: Response, token: string): void {
  res.cookie("twipra-token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 120 * 24 * 60 * 60 * 1000,
    path: "/",
  });
}

export function clearTokenCookie(res: Response): void {
  res.cookie("twipra-token", "", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 0,
    path: "/",
  });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}