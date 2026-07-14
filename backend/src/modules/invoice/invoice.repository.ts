import { prisma } from "../../database/client";

export class InvoiceRepository {
  async findMany() {
    return prisma.invoice.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        customer: true,
        quotation: true,
        items: {
          include: {
            service: true,
          },
        },
        payments: true,
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
    return prisma.invoice.findUnique({
      where: { id },
      include: {
        customer: true,
        quotation: true,
        items: {
          include: {
            service: true,
          },
        },
        payments: true,
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

  async findByInvoiceNumber(invoiceNumber: string) {
    return prisma.invoice.findUnique({
      where: { invoiceNumber },
    });
  }

  async create(data: {
    invoiceNumber: string;
    customerId: string;
    quotationId?: string;
    issueDate?: Date;
    dueDate?: Date;
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
    return prisma.invoice.create({
      data: {
        invoiceNumber: data.invoiceNumber,
        customerId: data.customerId,
        quotationId: data.quotationId,
        issueDate: data.issueDate,
        dueDate: data.dueDate,
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
        quotation: true,
        items: {
          include: {
            service: true,
          },
        },
        payments: true,
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

  async update(id: string, data: {
    customerId?: string;
    quotationId?: string;
    issueDate?: Date;
    dueDate?: Date;
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
  }) {
    if (data.items) {
      await prisma.invoiceItem.deleteMany({
        where: { invoiceId: id },
      });
    }

    return prisma.invoice.update({
      where: { id },
      data: {
        customerId: data.customerId,
        quotationId: data.quotationId,
        issueDate: data.issueDate,
        dueDate: data.dueDate,
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
        quotation: true,
        items: {
          include: {
            service: true,
          },
        },
        payments: true,
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
    return prisma.invoice.delete({
      where: { id },
    });
  }

  async count() {
    return prisma.invoice.count();
  }
}

export const invoiceRepository = new InvoiceRepository();