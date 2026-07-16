import axiosInstance from "../../utils/axios";
import type {
  Category,
  CreateCategoryDto,
  UpdateCategoryDto,
} from "@invoice/shared/types";

interface PaginatedResponse<T> {
  data: T[];
  nextCursor: string | null;
  hasMore: boolean;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const categoryApi = {
  getAll: (params?: { cursor?: string; limit?: string }) =>
    axiosInstance
      .get<ApiResponse<Category[]>>("/category", { params })
      .then((res) => res.data),

  getById: (id: string) =>
    axiosInstance
      .get<ApiResponse<Category>>(`/category/${id}`)
      .then((res) => res.data),

  search: (params: { q?: string; cursor?: string; limit?: string }) =>
    axiosInstance
      .get<
        ApiResponse<PaginatedResponse<Category>>
      >("/category/search", { params })
      .then((res) => res.data),

  filter: (params: Record<string, string>) =>
    axiosInstance
      .get<
        ApiResponse<PaginatedResponse<Category>>
      >("/category/filter", { params })
      .then((res) => res.data),

  create: (data: CreateCategoryDto) =>
    axiosInstance
      .post<ApiResponse<Category>>("/category", data)
      .then((res) => res.data),

  update: (id: string, data: UpdateCategoryDto) =>
    axiosInstance
      .put<ApiResponse<Category>>(`/category/${id}`, data)
      .then((res) => res.data),

  delete: (id: string) =>
    axiosInstance
      .delete<ApiResponse<null>>(`/category/${id}`)
      .then((res) => res.data),
};
