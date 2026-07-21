import axiosInstance from "../../utils/axios";
import type {
  CreateCustomerDto,
  UpdateCustomerDto,
  Customer,
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

export const customerApi = {
  getAll: (params?: { cursor?: string; limit?: string }) =>
    axiosInstance
      .get<ApiResponse<PaginatedResponse<Customer>>>("/customer", { params })
      .then((res) => {
        return res.data;
      }),

  getById: (id: string) =>
    axiosInstance
      .get<ApiResponse<Customer>>(`/customer/${id}`)
      .then((res) => res.data),

  search: (params: { q?: string; cursor?: string; limit?: string }) =>
    axiosInstance
      .get<
        ApiResponse<PaginatedResponse<Customer>>
      >("/customer/search", { params })
      .then((res) => res.data),

  filter: (params: Record<string, string>) =>
    axiosInstance
      .get<
        ApiResponse<PaginatedResponse<Customer>>
      >("/customer/filter", { params })
      .then((res) => res.data),

  create: (data: CreateCustomerDto) =>
    axiosInstance
      .post<ApiResponse<Customer>>("/customer", data)
      .then((res) => res.data),

  update: (id: string, data: UpdateCustomerDto) =>
    axiosInstance
      .put<ApiResponse<Customer>>(`/customer/${id}`, data)
      .then((res) => res.data),

  delete: (id: string) =>
    axiosInstance
      .delete<ApiResponse<null>>(`/customer/${id}`)
      .then((res) => res.data),
};
