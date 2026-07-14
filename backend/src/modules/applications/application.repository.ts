import { prisma } from "../../database/client";

export class CustomerRepository {
  async findMany() {
    return prisma.customer.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  async findById(id: string) {
    return prisma.customer.findUnique({
      where: { id },
    });
  }

  async findByCustomerCode(customerCode: string) {
    return prisma.customer.findUnique({
      where: { customerCode },
    });
  }

  async findByEmail(email: string) {
    return prisma.customer.findFirst({
      where: { email },
    });
  }

  async findByPhone(phone: string) {
    return prisma.customer.findFirst({
      where: { phone },
    });
  }

  async create(data: {
    customerCode: string;
    name: string;
    email?: string;
    phone: string;
    address?: string;
    gstNumber?: string;
    notes?: string;
  }) {
    return prisma.customer.create({
      data,
    });
  }

  async update(id: string, data: {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
    gstNumber?: string;
    notes?: string;
    isActive?: boolean;
  }) {
    return prisma.customer.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return prisma.customer.delete({
      where: { id },
    });
  }

  async count() {
    return prisma.customer.count();
  }
}

export const customerRepository = new CustomerRepository();