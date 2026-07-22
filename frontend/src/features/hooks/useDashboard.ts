import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "../api/dashboard.api";

// Query keys
export const dashboardKeys = {
  all: ["dashboard"] as const,
  stats: () => [...dashboardKeys.all, "stats"] as const,
  revenue: () => [...dashboardKeys.all, "revenue"] as const,
  invoiceStatus: () => [...dashboardKeys.all, "invoice-status"] as const,
  paymentMethods: () => [...dashboardKeys.all, "payment-methods"] as const,
};

// Full dashboard stats
export function useDashboardStats() {
  return useQuery({
    queryKey: dashboardKeys.stats(),
    queryFn: dashboardApi.getStats,
  });
}

// Revenue (stats + monthly chart)
export function useDashboardRevenue() {
  return useQuery({
    queryKey: dashboardKeys.revenue(),
    queryFn: dashboardApi.getRevenue,
  });
}

// Invoice status breakdown
export function useDashboardInvoiceStatus() {
  return useQuery({
    queryKey: dashboardKeys.invoiceStatus(),
    queryFn: dashboardApi.getInvoiceStatus,
  });
}

// Payment methods breakdown
export function useDashboardPaymentMethods() {
  return useQuery({
    queryKey: dashboardKeys.paymentMethods(),
    queryFn: dashboardApi.getPaymentMethods,
  });
}
