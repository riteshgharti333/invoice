import type { Request, Response } from "express";
import { asyncHandler } from "../../common/utils/asyncHandler";
import { apiResponse } from "../../common/utils/apiResponse";
import { serviceService } from "./service.service";
import { HTTP_STATUS } from "../../common/constants/httpStatus";

class ServiceController {
  getAllServices = asyncHandler(async (_req: Request, res: Response) => {
    const services = await serviceService.getAllServices(_req.body);

    return apiResponse({
      res,
      message: "Services fetched successfully",
      data: services,
    });
  });

  getServiceById = asyncHandler(async (req: Request, res: Response) => {
    const serviceId = req.params.id as string;
    const service = await serviceService.getServiceById(serviceId);

    return apiResponse({
      res,
      message: "Service fetched successfully",
      data: service,
    });
  });

  createService = asyncHandler(async (req: Request, res: Response) => {
    const serviceData = req.body;
    const service = await serviceService.createService(serviceData);

    return apiResponse({
      res,
      statusCode: HTTP_STATUS.CREATED,
      message: "Service created successfully",
      data: service,
    });
  });

  updateService = asyncHandler(async (req: Request, res: Response) => {
    const serviceId = req.params.id as string;
    const updateData = req.body;
    const service = await serviceService.updateService(serviceId, updateData);

    return apiResponse({
      res,
      message: "Service updated successfully",
      data: service,
    });
  });

  deleteService = asyncHandler(async (req: Request, res: Response) => {
    const serviceId = req.params.id as string;
    await serviceService.deleteService(serviceId);

    return apiResponse({
      res,
      message: "Service deleted successfully",
      data: null,
    });
  });
  searchServices = asyncHandler(async (req: Request, res: Response) => {
  const services = await serviceService.searchServices(req.query);

  return apiResponse({
    res,
    message: "Services found successfully",
    data: services,
  });
});


filterServices = asyncHandler(async (req: Request, res: Response) => {
  const services = await serviceService.filterServices(req.query);

  return apiResponse({
    res,
    message: "Services filtered successfully",
    data: services,
  });
});
}

export const serviceController = new ServiceController();