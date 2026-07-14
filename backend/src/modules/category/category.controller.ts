import type { Request, Response } from "express";
import { asyncHandler } from "../../common/utils/asyncHandler";
import { apiResponse } from "../../common/utils/apiResponse";
import { categoryService } from "./category.service";
import { HTTP_STATUS } from "../../common/constants/httpStatus";

class CategoryController {
  getAllCategories = asyncHandler(async (_req: Request, res: Response) => {
    const categories = await categoryService.getAllCategories();

    return apiResponse({
      res,
      message: "Categories fetched successfully",
      data: categories,
    });
  });

  getCategoryById = asyncHandler(async (req: Request, res: Response) => {
    const categoryId = req.params.id as string;
    const category = await categoryService.getCategoryById(categoryId);

    return apiResponse({
      res,
      message: "Category fetched successfully",
      data: category,
    });
  });

  createCategory = asyncHandler(async (req: Request, res: Response) => {
    const categoryData = req.body;
    const category = await categoryService.createCategory(categoryData);

    return apiResponse({
      res,
      statusCode: HTTP_STATUS.CREATED,
      message: "Category created successfully",
      data: category,
    });
  });

  updateCategory = asyncHandler(async (req: Request, res: Response) => {
    const categoryId = req.params.id as string;
    const updateData = req.body;
    const category = await categoryService.updateCategory(categoryId, updateData);

    return apiResponse({
      res,
      message: "Category updated successfully",
      data: category,
    });
  });

  deleteCategory = asyncHandler(async (req: Request, res: Response) => {
    const categoryId = req.params.id as string;
    await categoryService.deleteCategory(categoryId);

    return apiResponse({
      res,
      message: "Category deleted successfully",
      data: null,
    });
  });
}

export const categoryController = new CategoryController();