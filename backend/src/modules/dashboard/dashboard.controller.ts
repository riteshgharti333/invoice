import type { Request, Response } from "express";
import { asyncHandler } from "../../common/utils/asyncHandler";
import { apiResponse } from "../../common/utils/apiResponse";
import { dashboardService } from "./dashboard.service";

class DashboardController {
  getDashboard = asyncHandler(async (_req: Request, res: Response) => {
    const [totalRevenue, outstanding, totalInvoices, totalQuotations] =
      await Promise.all([
        dashboardService.getTotalRevenueStats(),
        dashboardService.getOutstandingStats(),
        dashboardService.getTotalInvoicesStats(),
        dashboardService.getTotalQuotationsStats(),
      ]);

    return apiResponse({
      res,
      message: "Dashboard fetched successfully",
      data: {
        totalRevenue,
        outstanding,
        totalInvoices,
        totalQuotations,
      },
    });
  });

  getRevenue = asyncHandler(async (_req: Request, res: Response) => {
    const monthlyRevenue = await dashboardService.getMonthlyRevenueStats();

    return apiResponse({
      res,
      message: "Revenue fetched successfully",
      data: monthlyRevenue,
    });
  });

  getInvoiceStatus = asyncHandler(async (_req: Request, res: Response) => {
    const data = await dashboardService.getInvoiceStatusStats();

    return apiResponse({
      res,
      message: "Invoice status fetched successfully",
      data,
    });
  });
  getPaymentMethods = asyncHandler(async (_req: Request, res: Response) => {
    const data = await dashboardService.getPaymentMethodStats();

    return apiResponse({
      res,
      message: "Payment methods fetched successfully",
      data,
    });
  });
}

export const dashboardController = new DashboardController();
