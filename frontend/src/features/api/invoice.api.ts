import axiosInstance from '../../utils/axios';
import type { Invoice, CreateInvoiceDto, UpdateInvoiceDto } from '@invoice/shared/types';

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

export const invoiceApi = {
  getAll: (params?: { cursor?: string; limit?: string }) =>
    axiosInstance
      .get<ApiResponse<PaginatedResponse<Invoice>>>('/invoice', { params })
      .then((res) => res.data),

  getById: (id: string) =>
    axiosInstance
      .get<ApiResponse<Invoice>>(`/invoice/${id}`)
      .then((res) => res.data),

  search: (params: { q?: string; cursor?: string; limit?: string }) =>
    axiosInstance
      .get<ApiResponse<PaginatedResponse<Invoice>>>('/invoice/search', { params })
      .then((res) => res.data),

  filter: (params: Record<string, string>) =>
    axiosInstance
      .get<ApiResponse<PaginatedResponse<Invoice>>>('/invoice/filter', { params })
      .then((res) => res.data),

  create: (data: CreateInvoiceDto) =>
    axiosInstance
      .post<ApiResponse<Invoice>>('/invoice', data)
      .then((res) => res.data),

  update: (id: string, data: UpdateInvoiceDto) =>
    axiosInstance
      .put<ApiResponse<Invoice>>(`/invoice/${id}`, data)
      .then((res) => res.data),

  delete: (id: string) =>
    axiosInstance
      .delete<ApiResponse<null>>(`/invoice/${id}`)
      .then((res) => res.data),

  updateStatus: (id: string, status: string) =>
    axiosInstance
      .patch<ApiResponse<Invoice>>(`/invoice/${id}/status`, { status })
      .then((res) => res.data),
};