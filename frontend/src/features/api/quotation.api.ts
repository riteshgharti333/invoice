import axiosInstance from '../../utils/axios';
import type { Quotation, CreateQuotationDto, UpdateQuotationDto } from '@invoice/shared/types';

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

export const quotationApi = {
  getAll: (params?: { cursor?: string; limit?: string }) =>
    axiosInstance
      .get<ApiResponse<PaginatedResponse<Quotation>>>('/quotation', { params })
      .then((res) => res.data),

  getById: (id: string) =>
    axiosInstance
      .get<ApiResponse<Quotation>>(`/quotation/${id}`)
      .then((res) => res.data),

  search: (params: { q?: string; cursor?: string; limit?: string }) =>
    axiosInstance
      .get<ApiResponse<PaginatedResponse<Quotation>>>('/quotation/search', { params })
      .then((res) => res.data),

  filter: (params: Record<string, string>) =>
    axiosInstance
      .get<ApiResponse<PaginatedResponse<Quotation>>>('/quotation/filter', { params })
      .then((res) => res.data),

  create: (data: CreateQuotationDto) =>
    axiosInstance
      .post<ApiResponse<Quotation>>('/quotation', data)
      .then((res) => res.data),

  update: (id: string, data: UpdateQuotationDto) =>
    axiosInstance
      .put<ApiResponse<Quotation>>(`/quotation/${id}`, data)
      .then((res) => res.data),

  delete: (id: string) =>
    axiosInstance
      .delete<ApiResponse<null>>(`/quotation/${id}`)
      .then((res) => res.data),

  updateStatus: (id: string, status: string) =>
    axiosInstance
      .patch<ApiResponse<Quotation>>(`/quotation/${id}/status`, { status })
      .then((res) => res.data),
};