export interface DashboardStats {
  totalRevenue: {
    "3months": { value: number; subtitle: string };
    "6months": { value: number; subtitle: string };
    yearly: { value: number; subtitle: string };
  };
  outstanding: {
    "3months": { value: number; subtitle: string };
    "6months": { value: number; subtitle: string };
    yearly: { value: number; subtitle: string };
  };
  totalInvoices: {
    "3months": { value: number; subtitle: string };
    "6months": { value: number; subtitle: string };
    yearly: { value: number; subtitle: string };
  };
  totalQuotations: {
    "3months": { value: number; subtitle: string };
    "6months": { value: number; subtitle: string };
    yearly: { value: number; subtitle: string };
  };
}

export interface DashboardResponse {
  stats: DashboardStats;
  monthlyRevenue: Array<{ month: string; revenue: number }>;
  statusBreakdown: Array<{ status: string; count: number }>;
  recentInvoices: Array<{
    id: string;
    invoiceNumber: string;
    customer: string;
    total: number;
    status: string;
  }>;
  recentCustomers: Array<{
    id: string;
    name: string;
    email: string;
    invoices: number;
  }>;
  recentQuotations: Array<{
    id: string;
    quotationNumber: string;
    customer: string;
    total: number;
    status: string;
  }>;
}