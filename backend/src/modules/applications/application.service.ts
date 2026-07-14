import { AppError } from "../../common/errors/AppError";
import { applicationRepository } from "./application.repository";
import type { CreateApplicationDto } from "./application.types";
import { HTTP_STATUS } from "../../common/constants/httpStatus";
import { MESSAGES } from "../../common/constants/messages";

export class ApplicationService {
  async getAllApplications() {
    return applicationRepository.findMany();
  }

  async getApplicationById(id: string) {
    const application = await applicationRepository.findById(id);

    if (!application) {
      throw new AppError({
        statusCode: HTTP_STATUS.NOT_FOUND,
        message: "Application not found",
      });
    }

    return application;
  }

  async createApplication(data: CreateApplicationDto) {
    return applicationRepository.create(data);
  }

  async deleteApplication(id: string) {
    await this.getApplicationById(id);
    await applicationRepository.delete(id);
  }
}

export const applicationService = new ApplicationService();