// src/features/api/service.api.ts
import axiosInstance from '../../utils/axios';
import type { Service, CreateServiceDto, UpdateServiceDto } from '@invoice/shared/types';

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

export const serviceApi = {
  getAll: (params?: { cursor?: string; limit?: string }) =>
    axiosInstance
      .get<ApiResponse<PaginatedResponse<Service>>>('/service', { params })
      .then((res) => res.data),

  getById: (id: string) =>
    axiosInstance
      .get<ApiResponse<Service>>(`/service/${id}`)
      .then((res) => res.data),

  search: (params: { q?: string; cursor?: string; limit?: string }) =>
    axiosInstance
      .get<ApiResponse<PaginatedResponse<Service>>>('/service/search', { params })
      .then((res) => res.data),

  filter: (params: Record<string, string>) =>
    axiosInstance
      .get<ApiResponse<PaginatedResponse<Service>>>('/service/filter', { params })
      .then((res) => res.data),

  create: (data: CreateServiceDto) =>
    axiosInstance
      .post<ApiResponse<Service>>('/service', data)
      .then((res) => res.data),

  update: (id: string, data: UpdateServiceDto) =>
    axiosInstance
      .put<ApiResponse<Service>>(`/service/${id}`, data)
      .then((res) => res.data),

  delete: (id: string) =>
    axiosInstance
      .delete<ApiResponse<null>>(`/service/${id}`)
      .then((res) => res.data),
};