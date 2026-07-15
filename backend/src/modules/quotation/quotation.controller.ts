import type { Request, Response } from "express";
import { asyncHandler } from "../../common/utils/asyncHandler";
import { apiResponse } from "../../common/utils/apiResponse";
import { quotationService } from "./quotation.service";
import { HTTP_STATUS } from "../../common/constants/httpStatus";

class QuotationController {
  getAllQuotations = asyncHandler(async (_req: Request, res: Response) => {
    const quotations = await quotationService.getAllQuotations(_req.body);

    return apiResponse({
      res,
      message: "Quotations fetched successfully",
      data: quotations,
    });
  });

  getQuotationById = asyncHandler(async (req: Request, res: Response) => {
    const quotationId = req.params.id as string;
    const quotation = await quotationService.getQuotationById(quotationId);

    return apiResponse({
      res,
      message: "Quotation fetched successfully",
      data: quotation,
    });
  });

  createQuotation = asyncHandler(async (req: Request, res: Response) => {
    const quotationData = req.body;
    const userId = (req as any).user?.id;
    const quotation = await quotationService.createQuotation(quotationData, userId);

    return apiResponse({
      res,
      statusCode: HTTP_STATUS.CREATED,
      message: "Quotation created successfully",
      data: quotation,
    });
  });

  updateQuotation = asyncHandler(async (req: Request, res: Response) => {
    const quotationId = req.params.id as string;
    const updateData = req.body;
    const quotation = await quotationService.updateQuotation(quotationId, updateData);

    return apiResponse({
      res,
      message: "Quotation updated successfully",
      data: quotation,
    });
  });

  deleteQuotation = asyncHandler(async (req: Request, res: Response) => {
    const quotationId = req.params.id as string;
    await quotationService.deleteQuotation(quotationId);

    return apiResponse({
      res,
      message: "Quotation deleted successfully",
      data: null,
    });
  });

  updateQuotationStatus = asyncHandler(async (req: Request, res: Response) => {
    const quotationId = req.params.id as string;
    const { status } = req.body;
    const quotation = await quotationService.updateStatus(quotationId, status);

    return apiResponse({
      res,
      message: "Quotation status updated successfully",
      data: quotation,
    });
  });


  searchQuotations = asyncHandler(async (req: Request, res: Response) => {
  const quotations = await quotationService.searchQuotations(req.query);

  return apiResponse({
    res,
    message: "Quotations found successfully",
    data: quotations,
  });
});


filterQuotations = asyncHandler(async (req: Request, res: Response) => {
  const quotations = await quotationService.filterQuotations(req.query);

  return apiResponse({
    res,
    message: "Quotations filtered successfully",
    data: quotations,
  });
});
}

export const quotationController = new QuotationController();