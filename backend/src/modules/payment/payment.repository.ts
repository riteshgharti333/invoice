import { prisma } from "../../database/client";

export class PaymentRepository {
  async findMany() {
    return prisma.payment.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        invoice: {
          include: {
            customer: true,
          },
        },
      },
    });
  }

  async findById(id: string) {
    return prisma.payment.findUnique({
      where: { id },
      include: {
        invoice: {
          include: {
            customer: true,
          },
        },
      },
    });
  }

  async findByPaymentNumber(paymentNumber: string) {
    return prisma.payment.findUnique({
      where: { paymentNumber },
    });
  }

  async findByInvoiceId(invoiceId: string) {
    return prisma.payment.findMany({
      where: { invoiceId },
      orderBy: { paymentDate: "desc" },
    });
  }

  async create(data: {
    paymentNumber: string;
    invoiceId: string;
    amount: number;
    paymentMethod: string;
    paymentDate?: Date;
    transactionNumber?: string;
    notes?: string;
    status: string;
  }) {
    return prisma.payment.create({
      data: {
        paymentNumber: data.paymentNumber,
        invoiceId: data.invoiceId,
        amount: data.amount,
        paymentMethod: data.paymentMethod as any,
        paymentDate: data.paymentDate,
        transactionNumber: data.transactionNumber,
        notes: data.notes,
        status: data.status as any,
      },
      include: {
        invoice: {
          include: {
            customer: true,
          },
        },
      },
    });
  }

  async update(id: string, data: {
    amount?: number;
    paymentMethod?: string;
    paymentDate?: Date;
    transactionNumber?: string;
    notes?: string;
    status?: string;
  }) {
    return prisma.payment.update({
      where: { id },
      data: {
        ...(data.amount !== undefined && { amount: data.amount }),
        ...(data.paymentMethod && { paymentMethod: data.paymentMethod as any }),
        ...(data.paymentDate && { paymentDate: data.paymentDate }),
        ...(data.transactionNumber !== undefined && { transactionNumber: data.transactionNumber }),
        ...(data.notes !== undefined && { notes: data.notes }),
        ...(data.status && { status: data.status as any }),
      },
      include: {
        invoice: {
          include: {
            customer: true,
          },
        },
      },
    });
  }

  async delete(id: string) {
    return prisma.payment.delete({
      where: { id },
    });
  }

  async count() {
    return prisma.payment.count();
  }

  async getTotalPaidForInvoice(invoiceId: string) {
    const result = await prisma.payment.aggregate({
      where: {
        invoiceId,
        status: "COMPLETED",
      },
      _sum: {
        amount: true,
      },
    });
    return result._sum.amount || 0;
  }



  async search(args: any) {
  return prisma.payment.findMany({
    ...args,
    include: {
      invoice: {
        select: {
          id: true,
          invoiceNumber: true,
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
        },
      },
    },
  });
}

async filter(args: any) {
  return prisma.payment.findMany({
    ...args,
    include: {
      invoice: {
        select: {
          id: true,
          invoiceNumber: true,
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
        },
      },
    },
  });
}
}



export const paymentRepository = new PaymentRepository();