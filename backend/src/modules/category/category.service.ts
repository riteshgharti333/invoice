import { AppError } from "../../common/errors/AppError";
import { HTTP_STATUS } from "../../common/constants/httpStatus";
import { categoryRepository } from "./category.repository";
import { CreateCategoryDto, UpdateCategoryDto } from "./category.types";

export class CategoryService {
  async getAllCategories() {
    return categoryRepository.findMany();
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
}

export const categoryService = new CategoryService();