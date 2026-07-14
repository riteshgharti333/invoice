import { AppError } from "../../common/errors/AppError";
import { customerRepository } from "./customer.repository";
import type { CreateCustomerDto, UpdateCustomerDto } from "./customer.types";
import { HTTP_STATUS } from "../../common/constants/httpStatus";
import { generateCode } from "../../common/utils/generateCode";

export class CustomerService {
  async generateCustomerCode(): Promise<string> {
    const count = await customerRepository.count();
    const code = generateCode("CUS", count);
    
    const existingCustomer = await customerRepository.findByCustomerCode(code);
    if (existingCustomer) {
      return generateCode("CUS", count + 1);
    }
    
    return code;
  }

  async getAllCustomers() {
    return customerRepository.findMany();
  }

  async getCustomerById(id: string) {
    const customer = await customerRepository.findById(id);

    if (!customer) {
      throw new AppError({
        statusCode: HTTP_STATUS.NOT_FOUND,
        message: "Customer not found",
      });
    }

    return customer;
  }

  async createCustomer(data: CreateCustomerDto) {
    if (data.email) {
      const existingCustomer = await customerRepository.findByEmail(data.email);
      if (existingCustomer) {
        throw new AppError({
          statusCode: HTTP_STATUS.CONFLICT,
          message: "Customer with this email already exists",
        });
      }
    }

    const existingPhone = await customerRepository.findByPhone(data.phone);
    if (existingPhone) {
      throw new AppError({
        statusCode: HTTP_STATUS.CONFLICT,
        message: "Customer with this phone number already exists",
      });
    }

    const customerCode = await this.generateCustomerCode();

    return customerRepository.create({
      ...data,
      customerCode,
    });
  }

  async updateCustomer(id: string, data: UpdateCustomerDto) {
    await this.getCustomerById(id);

    if (data.email) {
      const existingCustomer = await customerRepository.findByEmail(data.email);
      if (existingCustomer && existingCustomer.id !== id) {
        throw new AppError({
          statusCode: HTTP_STATUS.CONFLICT,
          message: "Customer with this email already exists",
        });
      }
    }

    if (data.phone) {
      const existingCustomer = await customerRepository.findByPhone(data.phone);
      if (existingCustomer && existingCustomer.id !== id) {
        throw new AppError({
          statusCode: HTTP_STATUS.CONFLICT,
          message: "Customer with this phone number already exists",
        });
      }
    }

    return customerRepository.update(id, data);
  }

  async deleteCustomer(id: string) {
    await this.getCustomerById(id);
    await customerRepository.delete(id);
  }
}

export const customerService = new CustomerService();