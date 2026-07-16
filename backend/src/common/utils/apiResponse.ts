import type { Response } from "express";

// Create a unique Symbol as a secret marker for paginated responses
export const PAGINATED_RESPONSE_SYMBOL = Symbol('paginated');

interface PaginationMeta {
  nextCursor?: string | null;
  hasMore?: boolean;
  total?: number;
}

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
  
  let responseData: any = data;
  let pagination: PaginationMeta | undefined;

  // Check if data has our special Symbol marker (meaning it's from Pagination class)
  if (data && typeof data === 'object' && !Array.isArray(data) && PAGINATED_RESPONSE_SYMBOL in data) {
    const paginatedData = data as any;
    
    // Extract the actual items array
    responseData = paginatedData.data;
    
    // Extract pagination metadata
    pagination = {
      nextCursor: paginatedData.nextCursor ?? null,
      hasMore: paginatedData.hasMore ?? false,
    };
  }

  const responsePayload: any = {
    success: true,
    message,
    data: responseData,
  };

  // Add pagination info only if it exists
  if (pagination) {
    responsePayload.pagination = pagination;
  }

  return res.status(statusCode).json(responsePayload);
}