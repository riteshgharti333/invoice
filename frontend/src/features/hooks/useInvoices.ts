import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { CreateInvoiceDto, UpdateInvoiceDto } from '@invoice/shared/types';
import { invoiceApi } from '../api/invoice.api';
import { toast } from '../../utils/toast';

export const invoiceKeys = {
  all: ['invoices'] as const,
  lists: () => [...invoiceKeys.all, 'list'] as const,
  list: (params?: any) => [...invoiceKeys.lists(), params] as const,
  searches: () => [...invoiceKeys.all, 'search'] as const,
  search: (params?: any) => [...invoiceKeys.searches(), params] as const,
  filters: () => [...invoiceKeys.all, 'filter'] as const,
  filter: (params?: any) => [...invoiceKeys.filters(), params] as const,
  details: () => [...invoiceKeys.all, 'detail'] as const,
  detail: (id: string) => [...invoiceKeys.details(), id] as const,
};

export function useInvoices(params?: { cursor?: string }) {
  return useQuery({
    queryKey: invoiceKeys.list(params),
    queryFn: () => invoiceApi.getAll(params),
    enabled: !!params,
  });
}

export function useInvoice(id: string) {
  return useQuery({
    queryKey: invoiceKeys.detail(id),
    queryFn: () => invoiceApi.getById(id),
    enabled: !!id,
  });
}

export function useSearchInvoices(params: { q?: string; cursor?: string }) {
  return useQuery({
    queryKey: invoiceKeys.search(params),
    queryFn: () => invoiceApi.search(params),
    enabled: !!params.q && params.q.length >= 2,
  });
}

export function useFilterInvoices(params: Record<string, string> & { cursor?: string }) {
  const hasFilters = Object.keys(params).some(k => k !== 'cursor' && params[k]);
  return useQuery({
    queryKey: invoiceKeys.filter(params),
    queryFn: () => invoiceApi.filter(params),
    enabled: hasFilters,
  });
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateInvoiceDto) => invoiceApi.create(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.lists() });
      toast.success(data.message || 'Invoice created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create invoice');
    },
  });
}

export function useUpdateInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateInvoiceDto }) => invoiceApi.update(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.lists() });
      queryClient.invalidateQueries({ queryKey: invoiceKeys.detail(variables.id) });
      toast.success(data.message || 'Invoice updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update invoice');
    },
  });
}

export function useDeleteInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: invoiceApi.delete,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.lists() });
      toast.success(data.message || 'Invoice deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete invoice');
    },
  });
}

export function useUpdateInvoiceStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => invoiceApi.updateStatus(id, status),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.lists() });
      queryClient.invalidateQueries({ queryKey: invoiceKeys.detail(variables.id) });
      toast.success(data.message || 'Status updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update status');
    },
  });
}