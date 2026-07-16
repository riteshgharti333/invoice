
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { CreatePaymentDto, UpdatePaymentDto } from '@invoice/shared/types';
import { paymentApi } from '../api/payment.api';
import { toast } from '../../utils/toast';
import { invoiceKeys } from './useInvoices';

export const paymentKeys = {
  all: ['payments'] as const,
  lists: () => [...paymentKeys.all, 'list'] as const,
  list: (params?: any) => [...paymentKeys.lists(), params] as const,
  searches: () => [...paymentKeys.all, 'search'] as const,
  search: (params?: any) => [...paymentKeys.searches(), params] as const,
  filters: () => [...paymentKeys.all, 'filter'] as const,
  filter: (params?: any) => [...paymentKeys.filters(), params] as const,
  details: () => [...paymentKeys.all, 'detail'] as const,
  detail: (id: string) => [...paymentKeys.details(), id] as const,
  byInvoice: (invoiceId: string) => [...paymentKeys.all, 'invoice', invoiceId] as const,
};

export function usePayments(params?: { cursor?: string }) {
  return useQuery({
    queryKey: paymentKeys.list(params),
    queryFn: () => paymentApi.getAll(params),
    enabled: !!params,
  });
}

export function usePayment(id: string) {
  return useQuery({
    queryKey: paymentKeys.detail(id),
    queryFn: () => paymentApi.getById(id),
    enabled: !!id,
  });
}

export function usePaymentsByInvoice(invoiceId: string) {
  return useQuery({
    queryKey: paymentKeys.byInvoice(invoiceId),
    queryFn: () => paymentApi.getByInvoiceId(invoiceId),
    enabled: !!invoiceId,
  });
}

export function useSearchPayments(params: { q?: string; cursor?: string }) {
  return useQuery({
    queryKey: paymentKeys.search(params),
    queryFn: () => paymentApi.search(params),
    enabled: !!params.q && params.q.length >= 2,
  });
}

export function useFilterPayments(params: Record<string, string> & { cursor?: string }) {
  const hasFilters = Object.keys(params).some(k => k !== 'cursor' && params[k]);
  return useQuery({
    queryKey: paymentKeys.filter(params),
    queryFn: () => paymentApi.filter(params),
    enabled: hasFilters,
  });
}

export function useCreatePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePaymentDto) => paymentApi.create(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: invoiceKeys.lists() }); // Also refresh invoices
      toast.success(data.message || 'Payment recorded successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to record payment');
    },
  });
}

export function useUpdatePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePaymentDto }) => paymentApi.update(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: paymentKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: invoiceKeys.lists() }); // Refresh invoices
      toast.success(data.message || 'Payment updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update payment');
    },
  });
}

export function useDeletePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: paymentApi.delete,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: invoiceKeys.lists() }); // Refresh invoices
      toast.success(data.message || 'Payment deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete payment');
    },
  });
}

export function useUpdatePaymentStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => paymentApi.updateStatus(id, status),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: paymentKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: invoiceKeys.lists() });
      toast.success(data.message || 'Payment status updated');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update status');
    },
  });
}