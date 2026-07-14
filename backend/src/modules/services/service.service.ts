import { AppError } from "../../common/errors/AppError";
import { serviceRepository } from "./service.repository";
import type { CreateServiceDto, UpdateServiceDto } from "./service.types";
import { HTTP_STATUS } from "../../common/constants/httpStatus";
import { generateCode } from "../../common/utils/generateCode";

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

  async getAllServices() {
    return serviceRepository.findMany();
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
}

export const serviceService = new ServiceService();