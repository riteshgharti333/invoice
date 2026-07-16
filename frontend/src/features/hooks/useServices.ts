import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateServiceDto, UpdateServiceDto } from "@invoice/shared/types";
import { serviceApi } from "../api/service.api";
import { toast } from "../../utils/toast";

export const serviceKeys = {
  all: ["services"] as const,
  lists: () => [...serviceKeys.all, "list"] as const,
  list: (params?: any) => [...serviceKeys.lists(), params] as const,
  searches: () => [...serviceKeys.all, "search"] as const,
  search: (params?: any) => [...serviceKeys.searches(), params] as const,
  filters: () => [...serviceKeys.all, "filter"] as const,
  filter: (params?: any) => [...serviceKeys.filters(), params] as const,
  details: () => [...serviceKeys.all, "detail"] as const,
  detail: (id: string) => [...serviceKeys.details(), id] as const,
};

export function useServices(params?: { cursor?: string }) {
  return useQuery({
    queryKey: serviceKeys.list(params),
    queryFn: () => serviceApi.getAll(params),
    enabled: !!params,
  });
}

export function useService(id: string) {
  return useQuery({
    queryKey: serviceKeys.detail(id),
    queryFn: () => serviceApi.getById(id),
    enabled: !!id,
  });
}

export function useSearchServices(params: { q?: string; cursor?: string }) {
  return useQuery({
    queryKey: serviceKeys.search(params),
    queryFn: () => serviceApi.search(params),
    enabled: !!params.q && params.q.length >= 2,
  });
}

export function useFilterServices(
  params: Record<string, string> & { cursor?: string },
) {
  const hasFilters = Object.keys(params).some(
    (k) => k !== "cursor" && params[k],
  );
  return useQuery({
    queryKey: serviceKeys.filter(params),
    queryFn: () => serviceApi.filter(params),
    enabled: hasFilters,
  });
}

export function useCreateService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateServiceDto) => serviceApi.create(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: serviceKeys.lists() });
      toast.success(data.message || "Service created successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create service");
    },
  });
}

export function useUpdateService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateServiceDto }) =>
      serviceApi.update(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: serviceKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: serviceKeys.detail(variables.id),
      });
      toast.success(data.message || "Service updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update service");
    },
  });
}

export function useDeleteService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: serviceApi.delete,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: serviceKeys.lists() });
      toast.success(data.message || "Service deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete service");
    },
  });
}
