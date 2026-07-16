import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { CreateCategoryDto, UpdateCategoryDto } from '@invoice/shared/types';
import { categoryApi } from '../api/category.api';
import { toast } from '../../utils/toast';

export const categoryKeys = {
  all: ['categories'] as const,
  lists: () => [...categoryKeys.all, 'list'] as const,
  list: (params?: any) => [...categoryKeys.lists(), params] as const,
  searches: () => [...categoryKeys.all, 'search'] as const,
  search: (params?: any) => [...categoryKeys.searches(), params] as const,
  filters: () => [...categoryKeys.all, 'filter'] as const,
  filter: (params?: any) => [...categoryKeys.filters(), params] as const,
  details: () => [...categoryKeys.all, 'detail'] as const,
  detail: (id: string) => [...categoryKeys.details(), id] as const,
};

export function useCategories(params?: { cursor?: string }) {
  return useQuery({
    queryKey: categoryKeys.list(params),
    queryFn: () => categoryApi.getAll(params),
    enabled: !!params,
  });
}

export function useCategory(id: string) {
  return useQuery({
    queryKey: categoryKeys.detail(id),
    queryFn: () => categoryApi.getById(id),
    enabled: !!id,
  });
}

export function useSearchCategories(params: { q?: string; cursor?: string }) {
  return useQuery({
    queryKey: categoryKeys.search(params),
    queryFn: () => categoryApi.search(params),
    enabled: !!params.q && params.q.length >= 2,
  });
}

export function useFilterCategories(params: Record<string, string> & { cursor?: string }) {
  const hasFilters = Object.keys(params).some(k => k !== 'cursor' && params[k]);
  return useQuery({
    queryKey: categoryKeys.filter(params),
    queryFn: () => categoryApi.filter(params),
    enabled: hasFilters,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCategoryDto) => categoryApi.create(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      toast.success(data.message || 'Category created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create category');
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCategoryDto }) => categoryApi.update(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: categoryKeys.detail(variables.id) });
      toast.success(data.message || 'Category updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update category');
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: categoryApi.delete,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      toast.success(data.message || 'Category deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete category');
    },
  });
}