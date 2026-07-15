import { AppError } from "../../common/errors/AppError";
import { HTTP_STATUS } from "../../common/constants/httpStatus";
import { categoryRepository } from "./category.repository";
import { CreateCategoryDto, UpdateCategoryDto } from "./category.types";
import { Category } from "@prisma/client";
import { Pagination } from "../../common/utils/pagination";
import { prisma } from "../../database/client";
import { Search } from "../../common/utils/search";
import { Filter } from "../../common/utils/filter";

export class CategoryService {
  async getAllCategories(query: { cursor?: string; limit?: string }) {
    return Pagination.paginate<Category>(
      (args) => prisma.category.findMany(args),
      {
        cursor: query.cursor,
        limit: query.limit ? parseInt(query.limit) : undefined,
      },
    );
  }

  async getCategoryById(id: string) {
    const category = await categoryRepository.findById(id);

    if (!category) {
      throw new AppError({
        statusCode: HTTP_STATUS.NOT_FOUND,
        message: "Category not found",
      });
    }

    return category;
  }

  async createCategory(data: CreateCategoryDto) {
    const existingCategory = await categoryRepository.findByName(data.name);
    if (existingCategory) {
      throw new AppError({
        statusCode: HTTP_STATUS.CONFLICT,
        message: "Category with this name already exists",
      });
    }

    return categoryRepository.create(data);
  }

  async updateCategory(id: string, data: UpdateCategoryDto) {
    await this.getCategoryById(id);

    if (data.name) {
      const existingCategory = await categoryRepository.findByName(data.name);
      if (existingCategory && existingCategory.id !== id) {
        throw new AppError({
          statusCode: HTTP_STATUS.CONFLICT,
          message: "Category with this name already exists",
        });
      }
    }

    return categoryRepository.update(id, data);
  }

  async deleteCategory(id: string) {
    await this.getCategoryById(id);
    await categoryRepository.delete(id);
  }

  async searchCategories(query: {
    q?: string;
    cursor?: string;
    limit?: string;
  }) {
    return Search.search<Category>((args) => categoryRepository.search(args), {
      searchTerm: query.q || "",
      containsFields: ["name"],
      cursor: query.cursor,
      limit: query.limit,
    });
  }
  async filterCategories(query: {
  createdAtFrom?: string;
  createdAtTo?: string;
  cursor?: string;
  limit?: string;
}) {
  return Filter.filter<Category>(
    (args) => categoryRepository.filter(args),
    {
      filters: {
        createdAtFrom: query.createdAtFrom,
        createdAtTo: query.createdAtTo,
      },
      cursor: query.cursor,
      limit: query.limit,
    }
  );
}
}

export const categoryService = new CategoryService();
