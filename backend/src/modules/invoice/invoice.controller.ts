import type { Request, Response } from "express";
import { asyncHandler } from "../../common/utils/asyncHandler";
import { apiResponse } from "../../common/utils/apiResponse";
import { invoiceService } from "./invoice.service";
import { HTTP_STATUS } from "../../common/constants/httpStatus";

class InvoiceController {
  getAllInvoices = asyncHandler(async (_req: Request, res: Response) => {
    const invoices = await invoiceService.getAllInvoices();

    return apiResponse({
      res,
      message: "Invoices fetched successfully",
      data: invoices,
    });
  });

  getInvoiceById = asyncHandler(async (req: Request, res: Response) => {
    const invoiceId = req.params.id as string;
    const invoice = await invoiceService.getInvoiceById(invoiceId);

    return apiResponse({
      res,
      message: "Invoice fetched successfully",
      data: invoice,
    });
  });

  createInvoice = asyncHandler(async (req: Request, res: Response) => {
    const invoiceData = req.body;
    const userId = (req as any).user?.id;
    const invoice = await invoiceService.createInvoice(invoiceData, userId);

    return apiResponse({
      res,
      statusCode: HTTP_STATUS.CREATED,
      message: "Invoice created successfully",
      data: invoice,
    });
  });

  updateInvoice = asyncHandler(async (req: Request, res: Response) => {
    const invoiceId = req.params.id as string;
    const updateData = req.body;
    const invoice = await invoiceService.updateInvoice(invoiceId, updateData);

    return apiResponse({
      res,
      message: "Invoice updated successfully",
      data: invoice,
    });
  });

  deleteInvoice = asyncHandler(async (req: Request, res: Response) => {
    const invoiceId = req.params.id as string;
    await invoiceService.deleteInvoice(invoiceId);

    return apiResponse({
      res,
      message: "Invoice deleted successfully",
      data: null,
    });
  });

  updateInvoiceStatus = asyncHandler(async (req: Request, res: Response) => {
    const invoiceId = req.params.id as string;
    const { status } = req.body;
    const invoice = await invoiceService.updateStatus(invoiceId, status);

    return apiResponse({
      res,
      message: "Invoice status updated successfully",
      data: invoice,
    });
  });
}

export const invoiceController = new InvoiceController();