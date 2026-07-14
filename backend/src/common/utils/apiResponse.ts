import type { Response } from "express";

interface ApiResponseOptions<T> {
  res: Response;
  statusCode?: number;
  message?: string;
  data?: T;
}

export function apiResponse<T>({
  res,
  statusCode = 200,
  message = "Success",
  data,
}: ApiResponseOptions<T>): Response {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}