import { AppError } from "../../common/errors/AppError";
import { paymentRepository } from "./payment.repository";
import { invoiceRepository } from "../invoice/invoice.repository";
import type { CreatePaymentDto, UpdatePaymentDto } from "./payment.types";
import { HTTP_STATUS } from "../../common/constants/httpStatus";
import { generateCode } from "../../common/utils/generateCode";
import { Pagination } from "../../common/utils/pagination";
import { Payment } from "@prisma/client";
import { prisma } from "../../database/client";
import { Filter } from "../../common/utils/filter";
import { Search } from "../../common/utils/search";

export class PaymentService {
  async generatePaymentNumber(): Promise<string> {
    const count = await paymentRepository.count();
    const code = generateCode("PAY", count);

    const existingPayment = await paymentRepository.findByPaymentNumber(code);
    if (existingPayment) {
      return generateCode("PAY", count + 1);
    } 

    return code;
  }

  async getAllPayments(query: { cursor?: string; limit?: string }) {
    return Pagination.paginate<Payment>(
      (args) =>
        prisma.payment.findMany({
          ...args,
          include: {
            invoice: {
              select: {
                invoiceNumber: true,
                customer: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        }),
      {
        cursor: query.cursor,
        limit: query.limit ? parseInt(query.limit) : undefined,
      },
    );
  }

  async getPaymentById(id: string) {
    const payment = await paymentRepository.findById(id);

    if (!payment) {
      throw new AppError({
        statusCode: HTTP_STATUS.NOT_FOUND,
        message: "Payment not found",
      });
    }

    return payment;
  }

  async getPaymentsByInvoiceId(invoiceId: string) {
    return paymentRepository.findByInvoiceId(invoiceId);
  }

  async createPayment(data: CreatePaymentDto) {
    // Check if invoice exists
    const invoice = await invoiceRepository.findById(data.invoiceId);
    if (!invoice) {
      throw new AppError({
        statusCode: HTTP_STATUS.NOT_FOUND,
        message: "Invoice not found",
      });
    }

    // Check if payment amount exceeds remaining balance
    const totalPaid = await paymentRepository.getTotalPaidForInvoice(
      data.invoiceId,
    );
    const remainingBalance = Number(invoice.total) - Number(totalPaid);

    if (data.amount > remainingBalance) {
      throw new AppError({
        statusCode: HTTP_STATUS.BAD_REQUEST,
        message: `Payment amount exceeds remaining balance. Remaining: ${remainingBalance}`,
      });
    }

    const paymentNumber = await this.generatePaymentNumber();

    const payment = await paymentRepository.create({
      paymentNumber,
      invoiceId: data.invoiceId,
      amount: data.amount,
      paymentMethod: data.paymentMethod,
      paymentDate: data.paymentDate ? new Date(data.paymentDate) : new Date(),
      transactionNumber: data.transactionNumber,
      notes: data.notes,
      status: "COMPLETED",
    });

    // Update invoice status based on total paid
    const newTotalPaid = Number(totalPaid) + Number(data.amount);
    const invoiceTotal = Number(invoice.total);

    if (newTotalPaid >= invoiceTotal) {
      await invoiceRepository.update(invoice.id, { status: "PAID" });
    } else if (newTotalPaid > 0) {
      await invoiceRepository.update(invoice.id, { status: "PARTIALLY_PAID" });
    }

    return payment;
  }

  async updatePayment(id: string, data: UpdatePaymentDto) {
    const payment = await this.getPaymentById(id);

    // If amount is being updated, check balance
    if (data.amount) {
      const invoice = await invoiceRepository.findById(payment.invoiceId);
      if (invoice) {
        const totalPaid = await paymentRepository.getTotalPaidForInvoice(
          payment.invoiceId,
        );
        const oldAmount = Number(payment.amount);
        const newTotalPaid = Number(totalPaid) - oldAmount + data.amount;
        const remainingBalance =
          Number(invoice.total) - newTotalPaid + data.amount;

        if (data.amount > remainingBalance) {
          throw new AppError({
            statusCode: HTTP_STATUS.BAD_REQUEST,
            message: `Payment amount exceeds remaining balance`,
          });
        }
      }
    }

    const updateData = {
      ...data,
      paymentDate: data.paymentDate ? new Date(data.paymentDate) : undefined,
    };

    return paymentRepository.update(id, updateData);
  }

  async deletePayment(id: string) {
    const payment = await this.getPaymentById(id);

    // Delete the payment
    await paymentRepository.delete(id);

    // Update invoice status after deletion
    const invoice = await invoiceRepository.findById(payment.invoiceId);
    if (invoice) {
      const totalPaid = await paymentRepository.getTotalPaidForInvoice(
        payment.invoiceId,
      );
      const invoiceTotal = Number(invoice.total);
      const totalPaidNumber = Number(totalPaid);

      if (totalPaidNumber >= invoiceTotal) {
        await invoiceRepository.update(invoice.id, { status: "PAID" });
      } else if (totalPaidNumber > 0) {
        await invoiceRepository.update(invoice.id, {
          status: "PARTIALLY_PAID",
        });
      } else {
        await invoiceRepository.update(invoice.id, { status: "SENT" });
      }
    }
  }

  async updateStatus(id: string, status: string) {
    const payment = await this.getPaymentById(id);

    const updatedPayment = await paymentRepository.update(id, { status });

    // If payment is refunded or failed, update invoice status
    if (status === "REFUNDED" || status === "FAILED") {
      const invoice = await invoiceRepository.findById(payment.invoiceId);
      if (invoice) {
        const totalPaid = await paymentRepository.getTotalPaidForInvoice(
          payment.invoiceId,
        );
        const invoiceTotal = Number(invoice.total);
        const totalPaidNumber = Number(totalPaid);

        if (totalPaidNumber >= invoiceTotal) {
          await invoiceRepository.update(invoice.id, { status: "PAID" });
        } else if (totalPaidNumber > 0) {
          await invoiceRepository.update(invoice.id, {
            status: "PARTIALLY_PAID",
          });
        } else {
          await invoiceRepository.update(invoice.id, { status: "SENT" });
        }
      }
    }

    return updatedPayment;
  }

  async searchPayments(query: { q?: string; cursor?: string; limit?: string }) {
    return Search.search<Payment>((args) => paymentRepository.search(args), {
      searchTerm: query.q || "",
      exactFields: ["paymentNumber"],
      nestedFields: {
        invoice: {
          customer: ["name", "phone"],
        },
      },
      cursor: query.cursor,
      limit: query.limit,
    });
  }

  async filterPayments(query: {
    status?: string;
    paymentMethod?: string;
    paymentDateFrom?: string;
    paymentDateTo?: string;
    amountFrom?: string;
    amountTo?: string;
    cursor?: string;
    limit?: string;
  }) {
    return Filter.filter<Payment>((args) => paymentRepository.filter(args), {
      filters: {
        status: query.status,
        paymentMethod: query.paymentMethod,
        paymentDateFrom: query.paymentDateFrom,
        paymentDateTo: query.paymentDateTo,
        amountFrom: query.amountFrom,
        amountTo: query.amountTo,
      },
      cursor: query.cursor,
      limit: query.limit,
    });
  }
}

export const paymentService = new PaymentService();
