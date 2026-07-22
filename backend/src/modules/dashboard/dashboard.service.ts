import { invoiceRepository } from "../invoice/invoice.repository";
import { paymentRepository } from "../payment/payment.repository";
import { quotationRepository } from "../quotation/quotation.repository";

class DashboardService {
  async getTotalRevenueStats() {
    const now = new Date();

    // ─── Current Periods ──────────────────────
    const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);
    const revenue3m = await invoiceRepository.getTotalRevenue(threeMonthsAgo);

    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);
    const revenue6m = await invoiceRepository.getTotalRevenue(sixMonthsAgo);

    const revenueYearly = await invoiceRepository.getTotalRevenue();

    // ─── Previous Periods ─────────────────────
    const prev3mStart = new Date(now.getFullYear(), now.getMonth() - 6, 1);
    const prev3mEnd = new Date(now.getFullYear(), now.getMonth() - 3, 0);
    const revenuePrev3m = await invoiceRepository.getTotalRevenue(
      prev3mStart,
      prev3mEnd,
    );

    const prev6mStart = new Date(now.getFullYear(), now.getMonth() - 12, 1);
    const prev6mEnd = new Date(now.getFullYear(), now.getMonth() - 6, 0);
    const revenuePrev6m = await invoiceRepository.getTotalRevenue(
      prev6mStart,
      prev6mEnd,
    );

    const prevYearStart = new Date(now.getFullYear() - 2, 0, 1);
    const prevYearEnd = new Date(now.getFullYear() - 1, 11, 31);
    const revenuePrevYear = await invoiceRepository.getTotalRevenue(
      prevYearStart,
      prevYearEnd,
    );

    // ─── Helpers ──────────────────────────────
    const formatChange = (
      current: number,
      previous: number,
      period: string,
    ): string => {
      if (previous === 0) return current > 0 ? "New" : "No data";
      const change = ((current - previous) / previous) * 100;
      const sign = change >= 0 ? "+" : "";
      return `${sign}${change.toFixed(0)}% from last ${period}`;
    };

    // ─── Response ─────────────────────────────
    return {
      "3months": {
        value: revenue3m,
        subtitle: formatChange(revenue3m, revenuePrev3m, "quarter"),
      },
      "6months": {
        value: revenue6m,
        subtitle: formatChange(revenue6m, revenuePrev6m, "half"),
      },
      yearly: {
        value: revenueYearly,
        subtitle: formatChange(revenueYearly, revenuePrevYear, "year"),
      },
    };
  }
  async getOutstandingStats() {
    const now = new Date();

    // ─── Current Periods ──────────────────────
    const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);
    const outstanding3m =
      await invoiceRepository.getOutstandingTotal(threeMonthsAgo);

    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);
    const outstanding6m =
      await invoiceRepository.getOutstandingTotal(sixMonthsAgo);

    const outstandingYearly = await invoiceRepository.getOutstandingTotal();

    // ─── Overdue Counts ───────────────────────
    const overdue3m = await invoiceRepository.getOverdueCount(threeMonthsAgo);
    const overdue6m = await invoiceRepository.getOverdueCount(sixMonthsAgo);
    const overdueYearly = await invoiceRepository.getOverdueCount();

    // ─── Response ─────────────────────────────
    return {
      "3months": {
        value: outstanding3m,
        subtitle: `${overdue3m} invoices overdue`,
      },
      "6months": {
        value: outstanding6m,
        subtitle: `${overdue6m} invoices overdue`,
      },
      yearly: {
        value: outstandingYearly,
        subtitle: `${overdueYearly} invoices overdue`,
      },
    };
  }
  async getTotalInvoicesStats() {
    const now = new Date();

    // ─── Current Periods ──────────────────────
    const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);
    const invoices3m = await invoiceRepository.getTotalCount(threeMonthsAgo);

    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);
    const invoices6m = await invoiceRepository.getTotalCount(sixMonthsAgo);

    const invoicesYearly = await invoiceRepository.getTotalCount();

    // ─── This Month ───────────────────────────
    const thisMonthCount = await invoiceRepository.getCountThisMonth();

    // ─── Response ─────────────────────────────
    return {
      "3months": {
        value: invoices3m,
        subtitle: `${thisMonthCount} created this month`,
      },
      "6months": {
        value: invoices6m,
        subtitle: `${thisMonthCount} created this month`,
      },
      yearly: {
        value: invoicesYearly,
        subtitle: `${thisMonthCount} created this month`,
      },
    };
  }
  async getTotalQuotationsStats() {
    const now = new Date();

    // ─── Current Periods ──────────────────────
    const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);
    const quotations3m =
      await quotationRepository.getTotalCount(threeMonthsAgo);

    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);
    const quotations6m = await quotationRepository.getTotalCount(sixMonthsAgo);

    const quotationsYearly = await quotationRepository.getTotalCount();

    // ─── Approved This Month ──────────────────
    const approvedThisMonth = await quotationRepository.getApprovedCount(
      new Date(now.getFullYear(), now.getMonth(), 1),
      new Date(now.getFullYear(), now.getMonth() + 1, 0),
    );

    // ─── Response ─────────────────────────────
    return {
      "3months": {
        value: quotations3m,
        subtitle: `${approvedThisMonth} approved this month`,
      },
      "6months": {
        value: quotations6m,
        subtitle: `${approvedThisMonth} approved this month`,
      },
      yearly: {
        value: quotationsYearly,
        subtitle: `${approvedThisMonth} approved this month`,
      },
    };
  }

  async getMonthlyRevenueStats() {
    const now = new Date();
    const currentYear = now.getFullYear();

    const months = Array.from({ length: 12 }, (_, i) => {
      const monthStart = new Date(currentYear, i, 1);
      const monthEnd = new Date(currentYear, i + 1, 0);
      const lastYearStart = new Date(currentYear - 1, i, 1);
      const lastYearEnd = new Date(currentYear - 1, i + 1, 0);

      return {
        monthStart,
        monthEnd,
        lastYearStart,
        lastYearEnd,
        monthName: monthStart.toLocaleString("default", { month: "short" }),
      };
    });

    const monthsData = await Promise.all(
      months.map(async (m) => {
        const revenue = await invoiceRepository.getMonthlyRevenue(
          m.monthStart,
          m.monthEnd,
        );
        return { month: m.monthName, revenue };
      }),
    );

    const totalCurrent = monthsData.reduce((s, m) => s + m.revenue, 0);

    // Last year total for comparison
    const lastYearStart = new Date(currentYear - 1, 0, 1);
    const lastYearEnd = new Date(currentYear - 1, 11, 31);
    const totalLastYear = await invoiceRepository.getMonthlyRevenue(
      lastYearStart,
      lastYearEnd,
    );

    const growth =
      totalLastYear > 0
        ? `${((totalCurrent - totalLastYear) / totalLastYear) * 100 >= 0 ? "+" : ""}${(((totalCurrent - totalLastYear) / totalLastYear) * 100).toFixed(1)}%`
        : totalCurrent > 0
          ? "New"
          : "-";

    return {
      total: totalCurrent,
      subtitle: `${growth} from previous year`,
      months: monthsData,
    };
  }
  async getInvoiceStatusStats() {
    const breakdown = await invoiceRepository.getStatusBreakdown();

    const series = breakdown.map((b) => b.count);
    const labels = breakdown.map((b) => b.status);

    return { series, labels };
  }
  async getPaymentMethodStats() {
    const breakdown = await paymentRepository.getMethodBreakdown();

    const labels: Record<string, string> = {
      UPI: "UPI Payments",
      BANK_TRANSFER: "Bank Transfer",
      CREDIT_CARD: "Credit Card",
      CASH: "Cash",
      DEBIT_CARD: "Debit Card",
      OTHER: "Other",
    };

    return breakdown.map((item, index) => ({
      id: index + 1,
      label: labels[item.method] || item.method,
      value: item.total,
      count: item.count,
    }));
  }
}

export const dashboardService = new DashboardService();
