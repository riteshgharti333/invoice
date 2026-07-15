import { AppError } from "../../common/errors/AppError";
import { invoiceRepository } from "./invoice.repository";
import type { CreateInvoiceDto, UpdateInvoiceDto } from "./invoice.types";
import { HTTP_STATUS } from "../../common/constants/httpStatus";
import { generateCode } from "../../common/utils/generateCode";
import { FinancialCalculations } from "../../common/calculations/financial-calculations";
import { Pagination } from "../../common/utils/pagination";
import { Invoice } from "@prisma/client";
import { prisma } from "../../database/client";
import { Search } from "../../common/utils/search";
import { Filter } from "../../common/utils/filter";
import { InvoiceStatusUtil } from "../../common/utils/invoice-status.util";
import { PaymentSummaryUtil } from "../../common/utils/payment-summary.util";

export class InvoiceService {
  async generateInvoiceNumber(): Promise<string> {
    const count = await invoiceRepository.count();
    const code = generateCode("INV", count);

    const existingInvoice = await invoiceRepository.findByInvoiceNumber(code);
    if (existingInvoice) {
      return generateCode("INV", count + 1);
    }

    return code;
  }

  private addPaymentSummary(invoice: any) {
    const summary = PaymentSummaryUtil.calculate(
      invoice.payments || [],
      Number(invoice.total),
    );
    return { ...invoice, ...summary };
  }

  async getAllInvoices(query: { cursor?: string; limit?: string }) {
    await this.autoUpdateOverdueInvoices();

    const result = await Pagination.paginate<Invoice>(
      (args) => prisma.invoice.findMany(args),
      {
        cursor: query.cursor,
        limit: query.limit ? parseInt(query.limit) : undefined,
      },
    );

    // Add payment summary to each invoice
    return {
      ...result,
      data: result.data.map((invoice) => this.addPaymentSummary(invoice)),
    };
  }

  private async autoUpdateOverdueInvoices() {
    const invoices = await prisma.invoice.findMany({
      where: {
        status: { notIn: ["PAID", "CANCELLED", "OVERDUE"] },
        dueDate: { lt: new Date() },
      },
      include: { payments: true },
    });

    for (const invoice of invoices) {
      const totalPaid = invoice.payments
        .filter((p) => p.status === "COMPLETED")
        .reduce((sum, p) => sum + Number(p.amount), 0);

      const newStatus = InvoiceStatusUtil.determineStatus({
        currentStatus: invoice.status,
        dueDate: invoice.dueDate,
        totalPaid,
        invoiceTotal: Number(invoice.total),
      });

      if (newStatus) {
        await invoiceRepository.update(invoice.id, { status: newStatus });
      }
    }
  }

  async getInvoiceById(id: string) {
    const invoice = await invoiceRepository.findById(id);

    if (!invoice) {
      throw new AppError({
        statusCode: HTTP_STATUS.NOT_FOUND,
        message: "Invoice not found",
      });
    }

    return this.addPaymentSummary(invoice);
  }

  async createInvoice(data: CreateInvoiceDto, userId?: string) {
    if (!data.items || data.items.length === 0) {
      throw new AppError({
        statusCode: HTTP_STATUS.BAD_REQUEST,
        message: "At least one item is required",
      });
    }

    const invoiceNumber = await this.generateInvoiceNumber();
    const { subtotal, discount, tax, total } =
      FinancialCalculations.calculateTotals(
        data.items,
        data.discount,
        data.tax,
      );

    const items = data.items.map((item) => ({
      serviceId: item.serviceId,
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      taxRate: item.taxRate || 0,
      discount: item.discount || 0,
      total: FinancialCalculations.calculateItemTotal(item),
    }));

    const invoice = await invoiceRepository.create({
      invoiceNumber,
      customerId: data.customerId,
      quotationId: data.quotationId,
      issueDate: data.issueDate ? new Date(data.issueDate) : new Date(),
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      subtotal,
      discount,
      tax,
      total,
      status: "DRAFT",
      notes: data.notes,
      termsConditions: data.termsConditions,
      createdById: userId,
      items,
    });

    return this.addPaymentSummary(invoice);
  }

  async updateInvoice(id: string, data: UpdateInvoiceDto) {
    await this.getInvoiceById(id);

    let calculations = {};
    let items = undefined;

    if (data.items) {
      const { subtotal, discount, tax, total } =
        FinancialCalculations.calculateTotals(
          data.items,
          data.discount,
          data.tax,
        );

      calculations = { subtotal, discount, tax, total };

      items = data.items.map((item) => ({
        serviceId: item.serviceId,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        taxRate: item.taxRate || 0,
        discount: item.discount || 0,
        total: FinancialCalculations.calculateItemTotal(item),
      }));
    }

    const invoice = await invoiceRepository.update(id, {
      customerId: data.customerId,
      quotationId: data.quotationId,
      issueDate: data.issueDate ? new Date(data.issueDate) : undefined,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      ...calculations,
      status: data.status,
      notes: data.notes,
      termsConditions: data.termsConditions,
      items,
    });

    return this.addPaymentSummary(invoice);
  }

  async deleteInvoice(id: string) {
    await this.getInvoiceById(id);
    await invoiceRepository.delete(id);
  }

  async updateStatus(id: string, status: string) {
    await this.getInvoiceById(id);
    return invoiceRepository.update(id, { status });
  }

  async searchInvoices(query: { q?: string; cursor?: string; limit?: string }) {
    return Search.search<Invoice>((args) => invoiceRepository.search(args), {
      searchTerm: query.q || "",
      exactFields: ["invoiceNumber"],
      nestedFields: {
        customer: ["name", "phone"],
      },
      cursor: query.cursor,
      limit: query.limit,
    });
  }

  async filterInvoices(query: {
    status?: string;
    issueDateFrom?: string;
    issueDateTo?: string;
    totalFrom?: string;
    totalTo?: string;
    cursor?: string;
    limit?: string;
  }) {
    return Filter.filter<Invoice>((args) => invoiceRepository.filter(args), {
      filters: {
        status: query.status,
        issueDateFrom: query.issueDateFrom,
        issueDateTo: query.issueDateTo,
        totalFrom: query.totalFrom,
        totalTo: query.totalTo,
      },
      cursor: query.cursor,
      limit: query.limit,
    });
  }
}

export const invoiceService = new InvoiceService();
