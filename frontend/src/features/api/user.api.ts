import axiosInstance from "../../utils/axios";
import type {
  CreateUserDto,
  UpdateUserDto,
  User,
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

export const userApi = {
  getAll: (params?: { cursor?: string; limit?: string }) =>
    axiosInstance
      .get<ApiResponse<PaginatedResponse<User>>>("/users", { params })
      .then((res) => res.data),

  getById: (id: string) =>
    axiosInstance
      .get<ApiResponse<User>>(`/users/${id}`)
      .then((res) => res.data),

  create: (data: CreateUserDto) =>
    axiosInstance
      .post<ApiResponse<User>>("/users", data)
      .then((res) => res.data),

  update: (id: string, data: UpdateUserDto) =>
    axiosInstance
      .patch<ApiResponse<User>>(`/users/${id}`, data)
      .then((res) => res.data),

  delete: (id: string) =>
    axiosInstance
      .delete<ApiResponse<null>>(`/users/${id}`)
      .then((res) => res.data),
};