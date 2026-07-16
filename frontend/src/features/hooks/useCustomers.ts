import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { customerApi } from "../api/customer.api";
import { toast } from "../../utils/toast";

// Query keys
export const customerKeys = {
  all: ["customers"] as const,
  lists: () => [...customerKeys.all, "list"] as const,
  list: (params: any) => [...customerKeys.lists(), params] as const,
  searches: () => [...customerKeys.all, "search"] as const,
  search: (params: any) => [...customerKeys.searches(), params] as const,
  filters: () => [...customerKeys.all, "filter"] as const,
  filter: (params: any) => [...customerKeys.filters(), params] as const,
  details: () => [...customerKeys.all, "detail"] as const,
  detail: (id: string) => [...customerKeys.details(), id] as const,
};

// Get all customers with pagination

export function useCustomers(params?: { cursor?: string }) {
  return useQuery({
    queryKey: customerKeys.list(params),
    queryFn: () => customerApi.getAll(params),
    enabled: !!params, // Only fetch when called with params
  });
}

export function useSearchCustomers(params: { q?: string; cursor?: string }) {
  return useQuery({
    queryKey: customerKeys.search(params),
    queryFn: () => customerApi.search(params),
    enabled: !!params.q && params.q.length >= 2,
  });
}

export function useFilterCustomers(
  params: Record<string, string> & { cursor?: string },
) {
  const hasFilters = Object.keys(params).some(
    (k) => k !== "cursor" && params[k],
  );

  return useQuery({
    queryKey: customerKeys.filter(params),
    queryFn: () => customerApi.filter(params),
    enabled: hasFilters,
  });
}

// Get single customer
export function useCustomer(id: string) {
  return useQuery({
    queryKey: customerKeys.detail(id),
    queryFn: () => customerApi.getById(id),
    enabled: !!id,
    select: (data) => data.data,
  });
}

// Create customer
export function useCreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: customerApi.create,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
      toast.success(data.message || "Customer created successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create customer");
    },
  });
}

// Update customer
export function useUpdateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      customerApi.update(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: customerKeys.detail(variables.id),
      });
      toast.success(data.message || "Customer updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update customer");
    },
  });
}

// Delete customer
export function useDeleteCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: customerApi.delete,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
      toast.success(data.message || "Customer deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete customer");
    },
  });
}
