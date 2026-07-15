import type { Request, Response } from "express";
import { asyncHandler } from "../../common/utils/asyncHandler";
import { apiResponse } from "../../common/utils/apiResponse";
import { customerService } from "./customer.service";
import { HTTP_STATUS } from "../../common/constants/httpStatus";

class CustomerController {
  getAllCustomers = asyncHandler(async (_req: Request, res: Response) => {
    const customers = await customerService.getAllCustomers(_req.query);

    return apiResponse({
      res,
      message: "Customers fetched successfully",
      data: customers,
    });
  });

  getCustomerById = asyncHandler(async (req: Request, res: Response) => {
    const customerId = req.params.id as string;
    const customer = await customerService.getCustomerById(customerId);

    return apiResponse({
      res,
      message: "Customer fetched successfully",
      data: customer,
    });
  });

  createCustomer = asyncHandler(async (req: Request, res: Response) => {
    const customerData = req.body;
    const customer = await customerService.createCustomer(customerData);

    return apiResponse({
      res,
      statusCode: HTTP_STATUS.CREATED,
      message: "Customer created successfully",
      data: customer,
    });
  });

  updateCustomer = asyncHandler(async (req: Request, res: Response) => {
    const customerId = req.params.id as string;
    const updateData = req.body;
    const customer = await customerService.updateCustomer(
      customerId,
      updateData,
    );

    return apiResponse({
      res,
      message: "Customer updated successfully",
      data: customer,
    });
  });

  deleteCustomer = asyncHandler(async (req: Request, res: Response) => {
    const customerId = req.params.id as string;
    await customerService.deleteCustomer(customerId);

    return apiResponse({
      res,
      message: "Customer deleted successfully",
      data: null,
    });
  });

  searchCustomers = asyncHandler(async (req: Request, res: Response) => {
    const customers = await customerService.searchCustomers(req.query);

    return apiResponse({
      res,
      message: "Customers found successfully",
      data: customers,
    });
  });
  filterCustomers = asyncHandler(async (req: Request, res: Response) => {
  const customers = await customerService.filterCustomers(req.query);

  return apiResponse({
    res,
    message: "Customers filtered successfully",
    data: customers,
  });
});
}

export const customerController = new CustomerController();
