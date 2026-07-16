import type { Request, Response } from "express";
import { asyncHandler } from "../../common/utils/asyncHandler";
import { apiResponse } from "../../common/utils/apiResponse";
import { paymentService } from "./payment.service";
import { HTTP_STATUS } from "../../common/constants/httpStatus";

class PaymentController {
  getAllPayments = asyncHandler(async (_req: Request, res: Response) => {
    const payments = await paymentService.getAllPayments(_req.query);

    return apiResponse({
      res,
      message: "Payments fetched successfully",
      data: payments,
    });
  });

  getPaymentById = asyncHandler(async (req: Request, res: Response) => {
    const paymentId = req.params.id as string;
    const payment = await paymentService.getPaymentById(paymentId);

    return apiResponse({
      res,
      message: "Payment fetched successfully",
      data: payment,
    });
  });

  getPaymentsByInvoice = asyncHandler(async (req: Request, res: Response) => {
    const invoiceId = req.params.invoiceId as string;
    const payments = await paymentService.getPaymentsByInvoiceId(invoiceId);

    return apiResponse({
      res,
      message: "Payments fetched successfully",
      data: payments,
    });
  });

  createPayment = asyncHandler(async (req: Request, res: Response) => {
    const paymentData = req.body;
    const payment = await paymentService.createPayment(paymentData);

    return apiResponse({
      res,
      statusCode: HTTP_STATUS.CREATED,
      message: "Payment recorded successfully",
      data: payment,
    });
  });

  updatePayment = asyncHandler(async (req: Request, res: Response) => {
    const paymentId = req.params.id as string;
    const updateData = req.body;
    const payment = await paymentService.updatePayment(paymentId, updateData);

    return apiResponse({
      res,
      message: "Payment updated successfully",
      data: payment,
    });
  });

  deletePayment = asyncHandler(async (req: Request, res: Response) => {
    const paymentId = req.params.id as string;
    await paymentService.deletePayment(paymentId);

    return apiResponse({
      res,
      message: "Payment deleted successfully",
      data: null,
    });
  });

  updatePaymentStatus = asyncHandler(async (req: Request, res: Response) => {
    const paymentId = req.params.id as string;
    const { status } = req.body;
    const payment = await paymentService.updateStatus(paymentId, status);

    return apiResponse({
      res,
      message: "Payment status updated successfully",
      data: payment,
    });
  });

  searchPayments = asyncHandler(async (req: Request, res: Response) => {
    const payments = await paymentService.searchPayments(req.query);

    return apiResponse({
      res,
      message: "Payments found successfully",
      data: payments,
    });
  });

  filterPayments = asyncHandler(async (req: Request, res: Response) => {
    const payments = await paymentService.filterPayments(req.query);

    return apiResponse({
      res,
      message: "Payments filtered successfully",
      data: payments,
    });
  });
}

export const paymentController = new PaymentController();
