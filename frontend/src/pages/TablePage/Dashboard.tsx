import { useAuthStore } from "../../store/authStore";
import {
  useDashboardRevenue,
  useDashboardInvoiceStatus,
  useDashboardPaymentMethods,
  useDashboardStats,
} from "../../features/hooks/useDashboard";
import { useInvoices } from "../../features/hooks/useInvoices";
import { useCustomers } from "../../features/hooks/useCustomers";
import { useQuotations } from "../../features/hooks/useQuotations";
import Revenue from "../../components/DBComponent/Revenue";
import { Stat } from "../../components/DBComponent/Stat";
import InvoiceDashboard from "../../components/DBComponent/InvoiceDashboard";
import type { Customer, Invoice, Quotation } from "@invoice/shared/types";
import QuotationCustomer from "../../components/DBComponent/QuotationCustomer";
import InvoiceStatusChart from "../../components/DBComponent/InvoiceStatusChart";
import PaymentMethods from "../../components/DBComponent/PaymentMethods";

export default function Dashboard() {
  const { user } = useAuthStore();
  const firstName = user?.name?.split(" ")[0] || "there";

  // Stat cards
  const { data: statsData, isLoading: statsLoading } = useDashboardStats();

  // Revenue chart
  const { data: revenueData, isLoading: revenueLoading } =
    useDashboardRevenue();

  // Invoice status & Payment methods
  const { data: invoiceStatusData, isLoading: invoiceStatusLoading } =
    useDashboardInvoiceStatus();
  const { data: paymentMethodsData, isLoading: paymentMethodsLoading } =
    useDashboardPaymentMethods();

  // List data for recent items
  const { data: invoicesData } = useInvoices({ cursor: "" });
  const { data: customersData } = useCustomers({ cursor: "" });
  const { data: quotationsData } = useQuotations({ cursor: "" });

  const recentInvoices =
    (invoicesData?.data as unknown as Invoice[])?.slice(0, 4) || [];
  const recentCustomers =
    (customersData?.data as unknown as Customer[])?.slice(0, 5) || [];
  const recentQuotations =
    (quotationsData?.data as unknown as Quotation[])?.slice(0, 5) || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
        <p className="text-text-muted text-sm mt-1">
          Welcome back, {firstName} 👋
        </p>
      </div>

      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-2 space-y-5">
          <Stat columns={2} data={statsData?.data} isLoading={statsLoading} />
        </div>
        <div className="col-span-1">
          <InvoiceDashboard invoices={recentInvoices} />
        </div>
      </div>

      <Revenue data={revenueData?.data} isLoading={revenueLoading} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <InvoiceStatusChart
          data={invoiceStatusData?.data}
          isLoading={invoiceStatusLoading}
        />
        <PaymentMethods
          data={paymentMethodsData?.data}
          isLoading={paymentMethodsLoading}
        />
      </div>

      <QuotationCustomer
        quotations={recentQuotations}
        customers={recentCustomers}
      />
    </div>
  );
}
