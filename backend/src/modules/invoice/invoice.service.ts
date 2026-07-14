import { AppError } from "../../common/errors/AppError";
import { invoiceRepository } from "./invoice.repository";
import type { CreateInvoiceDto, UpdateInvoiceDto } from "./invoice.types";
import { HTTP_STATUS } from "../../common/constants/httpStatus";
import { generateCode } from "../../common/utils/generateCode";
import { FinancialCalculations } from "../../common/calculations/financial-calculations";


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

  async getAllInvoices() {
    return invoiceRepository.findMany();
  }

  async getInvoiceById(id: string) {
    const invoice = await invoiceRepository.findById(id);

    if (!invoice) {
      throw new AppError({
        statusCode: HTTP_STATUS.NOT_FOUND,
        message: "Invoice not found",
      });
    }

    return invoice;
  }

  async createInvoice(data: CreateInvoiceDto, userId?: string) {
    if (!data.items || data.items.length === 0) {
      throw new AppError({
        statusCode: HTTP_STATUS.BAD_REQUEST,
        message: "At least one item is required",
      });
    }

    const invoiceNumber = await this.generateInvoiceNumber();
    const { subtotal, discount, tax, total } = FinancialCalculations.calculateTotals(
      data.items,
      data.discount,
      data.tax
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

    return invoiceRepository.create({
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
  }

  async updateInvoice(id: string, data: UpdateInvoiceDto) {
    await this.getInvoiceById(id);

    let calculations = {};
    let items = undefined;

    if (data.items) {
      const { subtotal, discount, tax, total } = FinancialCalculations.calculateTotals(
        data.items,
        data.discount,
        data.tax
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

    return invoiceRepository.update(id, {
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
  }

  async deleteInvoice(id: string) {
    await this.getInvoiceById(id);
    await invoiceRepository.delete(id);
  }

  async updateStatus(id: string, status: string) {
    await this.getInvoiceById(id);
    return invoiceRepository.update(id, { status });
  }
}

export const invoiceService = new InvoiceService();