import { prisma } from "../../database/client";

export class ServiceRepository {
  async findMany() {
    return prisma.service.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        category: true,
      },
    });
  }

  async findById(id: string) {
    return prisma.service.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });
  }

  async findByServiceCode(serviceCode: string) {
    return prisma.service.findUnique({
      where: { serviceCode },
    });
  }

  async findByName(name: string) {
    return prisma.service.findFirst({
      where: { name },
    });
  }

  async create(data: {
    serviceCode: string;
    name: string;
    description?: string;
    categoryId?: string;
    unit?: string;
    price: number;
    taxRate?: number;
  }) {
    return prisma.service.create({
      data,
      include: {
        category: true,
      },
    });
  }

  async update(id: string, data: {
    name?: string;
    description?: string;
    categoryId?: string;
    unit?: string;
    price?: number;
    taxRate?: number;
  }) {
    return prisma.service.update({
      where: { id },
      data,
      include: {
        category: true,
      },
    });
  }

  async delete(id: string) {
    return prisma.service.delete({
      where: { id },
    });
  }

  async count() {
    return prisma.service.count();
  }

  async search(args: any) {
  return prisma.service.findMany({
    ...args,
    include: {
      category: true,
      _count: {
        select: {
          quotationItems: true,
          invoiceItems: true,
        },
      },
    },
  });
  
}

async filter(args: any) {
  return prisma.service.findMany({
    ...args,
    include: {
      category: {
        select: {
          id: true,
          name: true,
        },
      },
      _count: {
        select: {
          quotationItems: true,
          invoiceItems: true,
        },
      },
    },
  });
}
}

export const serviceRepository = new ServiceRepository();