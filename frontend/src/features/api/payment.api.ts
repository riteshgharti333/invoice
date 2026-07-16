// src/features/api/payment.api.ts
import axiosInstance from '../../utils/axios';
import type { Payment, CreatePaymentDto, UpdatePaymentDto } from '@invoice/shared/types';

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

export const paymentApi = {
  getAll: (params?: { cursor?: string; limit?: string }) =>
    axiosInstance
      .get<ApiResponse<PaginatedResponse<Payment>>>('/payment', { params })
      .then((res) => res.data),

  getById: (id: string) =>
    axiosInstance
      .get<ApiResponse<Payment>>(`/payment/${id}`)
      .then((res) => res.data),

  getByInvoiceId: (invoiceId: string) =>
    axiosInstance
      .get<ApiResponse<Payment[]>>(`/payment/invoice/${invoiceId}`)
      .then((res) => res.data),

  search: (params: { q?: string; cursor?: string; limit?: string }) =>
    axiosInstance
      .get<ApiResponse<PaginatedResponse<Payment>>>('/payment/search', { params })
      .then((res) => res.data),

  filter: (params: Record<string, string>) =>
    axiosInstance
      .get<ApiResponse<PaginatedResponse<Payment>>>('/payment/filter', { params })
      .then((res) => res.data),

  create: (data: CreatePaymentDto) =>
    axiosInstance
      .post<ApiResponse<Payment>>('/payment', data)
      .then((res) => res.data),

  update: (id: string, data: UpdatePaymentDto) =>
    axiosInstance
      .put<ApiResponse<Payment>>(`/payment/${id}`, data)
      .then((res) => res.data),

  delete: (id: string) =>
    axiosInstance
      .delete<ApiResponse<null>>(`/payment/${id}`)
      .then((res) => res.data),

  updateStatus: (id: string, status: string) =>
    axiosInstance
      .patch<ApiResponse<Payment>>(`/payment/${id}/status`, { status })
      .then((res) => res.data),
};