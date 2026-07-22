import { prisma } from "../../database/client";

export class QuotationRepository {
  async findMany() {
    return prisma.quotation.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        customer: true,
        items: {
          include: {
            service: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });
  }

  async findById(id: string) {
    return prisma.quotation.findUnique({
      where: { id },
      include: {
        customer: true,
        items: {
          include: {
            service: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });
  }

  async findByQuotationNumber(quotationNumber: string) {
    return prisma.quotation.findUnique({
      where: { quotationNumber },
    });
  }

  async create(data: {
    quotationNumber: string;
    customerId: string;
    issueDate?: Date;
    expiryDate?: Date;
    subtotal: number;
    discount: number;
    tax: number;
    total: number;
    status: string;
    notes?: string;
    termsConditions?: string;
    createdById?: string;
    items: {
      serviceId: string;
      description?: string;
      quantity: number;
      unitPrice: number;
      taxRate: number;
      discount: number;
      total: number;
    }[];
  }) {
    return prisma.quotation.create({
      data: {
        quotationNumber: data.quotationNumber,
        customerId: data.customerId,
        issueDate: data.issueDate,
        expiryDate: data.expiryDate,
        subtotal: data.subtotal,
        discount: data.discount,
        tax: data.tax,
        total: data.total,
        status: data.status as any,
        notes: data.notes,
        termsConditions: data.termsConditions,
        createdById: data.createdById,
        items: {
          create: data.items,
        },
      },
      include: {
        customer: true,
        items: {
          include: {
            service: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });
  }

  async update(
    id: string,
    data: {
      customerId?: string;
      issueDate?: Date;
      expiryDate?: Date;
      subtotal?: number;
      discount?: number;
      tax?: number;
      total?: number;
      status?: string;
      notes?: string;
      termsConditions?: string;
      items?: {
        serviceId: string;
        description?: string;
        quantity: number;
        unitPrice: number;
        taxRate: number;
        discount: number;
        total: number;
      }[];
    },
  ) {
    // If items provided, delete old items and create new ones
    if (data.items) {
      await prisma.quotationItem.deleteMany({
        where: { quotationId: id },
      });
    }

    return prisma.quotation.update({
      where: { id },
      data: {
        customerId: data.customerId,
        issueDate: data.issueDate,
        expiryDate: data.expiryDate,
        subtotal: data.subtotal,
        discount: data.discount,
        tax: data.tax,
        total: data.total,
        status: data.status as any,
        notes: data.notes,
        termsConditions: data.termsConditions,
        ...(data.items && {
          items: {
            create: data.items,
          },
        }),
      },
      include: {
        customer: true,
        items: {
          include: {
            service: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });
  }

  async delete(id: string) {
    return prisma.quotation.delete({
      where: { id },
    });
  }

  async count() {
    return prisma.quotation.count();
  }

  async search(args: any) {
    return prisma.quotation.findMany({
      ...args,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        items: true,
        _count: {
          select: {
            invoices: true,
          },
        },
      },
    });
  }

  async filter(args: any) {
    return prisma.quotation.findMany({
      ...args,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        items: true,
        _count: {
          select: {
            invoices: true,
          },
        },
      },
    });
  }
  async getTotalCount(startDate?: Date, endDate?: Date) {
    const where: any = {};

    if (startDate || endDate) {
      where.issueDate = {};
      if (startDate) where.issueDate.gte = startDate;
      if (endDate) where.issueDate.lte = endDate;
    }

    return prisma.quotation.count({ where });
  }

  async getCountThisMonth() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    return prisma.quotation.count({
      where: {
        issueDate: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
    });
  }

  async getApprovedCount(startDate?: Date, endDate?: Date) {
    const where: any = {
      status: "APPROVED",
    };

    if (startDate || endDate) {
      where.issueDate = {};
      if (startDate) where.issueDate.gte = startDate;
      if (endDate) where.issueDate.lte = endDate;
    }

    return prisma.quotation.count({ where });
  }
}

export const quotationRepository = new QuotationRepository();
