import { AppError } from "../../common/errors/AppError";
import { serviceRepository } from "./service.repository";
import type { CreateServiceDto, UpdateServiceDto } from "./service.types";
import { HTTP_STATUS } from "../../common/constants/httpStatus";
import { generateCode } from "../../common/utils/generateCode";
import { prisma } from "../../database/client";
import { Pagination } from "../../common/utils/pagination";
import { Service } from "@prisma/client";
import { Search } from "../../common/utils/search";
import { Filter } from "../../common/utils/filter";

export class ServiceService {
  async generateServiceCode(): Promise<string> {
    const count = await serviceRepository.count();
    const code = generateCode("SRV", count);

    const existingService = await serviceRepository.findByServiceCode(code);
    if (existingService) {
      return generateCode("SRV", count + 1);
    }

    return code;
  }

  async getAllServices(query: { cursor?: string; limit?: string }) {
    return Pagination.paginate<Service>(
      (args) => prisma.service.findMany(args),
      {
        cursor: query.cursor,
        limit: query.limit ? parseInt(query.limit) : undefined,
      },
    );
  }

  async getServiceById(id: string) {
    const service = await serviceRepository.findById(id);

    if (!service) {
      throw new AppError({
        statusCode: HTTP_STATUS.NOT_FOUND,
        message: "Service not found",
      });
    }

    return service;
  }

  async createService(data: CreateServiceDto) {
    const existingService = await serviceRepository.findByName(data.name);
    if (existingService) {
      throw new AppError({
        statusCode: HTTP_STATUS.CONFLICT,
        message: "Service with this name already exists",
      });
    }

    const serviceCode = await this.generateServiceCode();

    return serviceRepository.create({
      ...data,
      serviceCode,
      unit: data.unit || "Project",
      taxRate: data.taxRate || 0,
    });
  }

  async updateService(id: string, data: UpdateServiceDto) {
    await this.getServiceById(id);

    if (data.name) {
      const existingService = await serviceRepository.findByName(data.name);
      if (existingService && existingService.id !== id) {
        throw new AppError({
          statusCode: HTTP_STATUS.CONFLICT,
          message: "Service with this name already exists",
        });
      }
    }

    return serviceRepository.update(id, data);
  }

  async deleteService(id: string) {
    await this.getServiceById(id);
    await serviceRepository.delete(id);
  }
  async searchServices(query: { q?: string; cursor?: string; limit?: string }) {
    return Search.search<Service>((args) => serviceRepository.search(args), {
      searchTerm: query.q || "",
      exactFields: ["serviceCode"],
      containsFields: ["name"],
      cursor: query.cursor,
      limit: query.limit,
    });
  }
  async filterServices(query: {
    categoryName?: string;
    createdAtFrom?: string;
    createdAtTo?: string;
    cursor?: string;
    limit?: string;
  }) {
    return Filter.filter<Service>((args) => serviceRepository.filter(args), {
      filters: {
        createdAtFrom: query.createdAtFrom,
        createdAtTo: query.createdAtTo,
      },
      nestedFilters: {
        category: {
          nameContains: query.categoryName,
        },
      },
      cursor: query.cursor,
      limit: query.limit,
    });
  }
}

export const serviceService = new ServiceService();
