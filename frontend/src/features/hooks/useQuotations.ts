import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  CreateQuotationDto,
  UpdateQuotationDto,
} from "@invoice/shared/types";
import { quotationApi } from "../api/quotation.api";
import { toast } from "../../utils/toast";

export const quotationKeys = {
  all: ["quotations"] as const,
  lists: () => [...quotationKeys.all, "list"] as const,
  list: (params?: any) => [...quotationKeys.lists(), params] as const,
  searches: () => [...quotationKeys.all, "search"] as const,
  search: (params?: any) => [...quotationKeys.searches(), params] as const,
  filters: () => [...quotationKeys.all, "filter"] as const,
  filter: (params?: any) => [...quotationKeys.filters(), params] as const,
  details: () => [...quotationKeys.all, "detail"] as const,
  detail: (id: string) => [...quotationKeys.details(), id] as const,
};

export function useQuotations(params?: { cursor?: string }) {
  return useQuery({
    queryKey: quotationKeys.list(params),
    queryFn: () => quotationApi.getAll(params),
    enabled: !!params,
  });
}

export function useQuotation(id: string) {
  return useQuery({
    queryKey: quotationKeys.detail(id),
    queryFn: () => quotationApi.getById(id),
    enabled: !!id,
  });
}

export function useSearchQuotations(params: {
  q?: string;
  cursor?: string;
  status?: string;
}) {
  return useQuery({
    queryKey: quotationKeys.search(params),
    queryFn: () => quotationApi.search(params),
    enabled: !!params.q && params.q.length >= 2,
  });
}

export function useFilterQuotations(
  params: Record<string, string> & { cursor?: string },
) {
  const hasFilters = Object.keys(params).some(
    (k) => k !== "cursor" && params[k],
  );
  return useQuery({
    queryKey: quotationKeys.filter(params),
    queryFn: () => quotationApi.filter(params),
    enabled: hasFilters,
  });
}

export function useCreateQuotation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateQuotationDto) => quotationApi.create(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: quotationKeys.lists() });
      toast.success(data.message || "Quotation created successfully");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to create quotation",
      );
    },
  });
}

export function useUpdateQuotation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateQuotationDto }) =>
      quotationApi.update(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: quotationKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: quotationKeys.detail(variables.id),
      });
      toast.success(data.message || "Quotation updated successfully");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to update quotation",
      );
    },
  });
}

export function useDeleteQuotation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: quotationApi.delete,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: quotationKeys.lists() });
      toast.success(data.message || "Quotation deleted successfully");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to delete quotation",
      );
    },
  });
}

export function useUpdateQuotationStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      quotationApi.updateStatus(id, status),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: quotationKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: quotationKeys.detail(variables.id),
      });
      toast.success(data.message || "Status updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update status");
    },
  });
}
