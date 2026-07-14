import { AppError } from "../../common/errors/AppError";
import { quotationRepository } from "./quotation.repository";
import type { CreateQuotationDto, UpdateQuotationDto } from "./quotation.types";
import { HTTP_STATUS } from "../../common/constants/httpStatus";
import { generateCode } from "../../common/utils/generateCode";
import { FinancialCalculations } from "../../common/calculations/financial-calculations";

export class QuotationService {
  async generateQuotationNumber(): Promise<string> {
    const count = await quotationRepository.count();
    const code = generateCode("QUO", count);

    const existingQuotation =
      await quotationRepository.findByQuotationNumber(code);
    if (existingQuotation) {
      return generateCode("QUO", count + 1);
    }

    return code;
  }

  async getAllQuotations() {
    return quotationRepository.findMany();
  }

  async getQuotationById(id: string) {
    const quotation = await quotationRepository.findById(id);

    if (!quotation) {
      throw new AppError({
        statusCode: HTTP_STATUS.NOT_FOUND,
        message: "Quotation not found",
      });
    }

    return quotation;
  }

  async createQuotation(data: CreateQuotationDto, userId?: string) {
    if (!data.items || data.items.length === 0) {
      throw new AppError({
        statusCode: HTTP_STATUS.BAD_REQUEST,
        message: "At least one item is required",
      });
    }

    const quotationNumber = await this.generateQuotationNumber();
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

    return quotationRepository.create({
      quotationNumber,
      customerId: data.customerId,
      issueDate: data.issueDate ? new Date(data.issueDate) : new Date(),
      expiryDate: data.expiryDate ? new Date(data.expiryDate) : undefined,
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

  async updateQuotation(id: string, data: UpdateQuotationDto) {
    await this.getQuotationById(id);

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

    return quotationRepository.update(id, {
      customerId: data.customerId,
      issueDate: data.issueDate ? new Date(data.issueDate) : undefined,
      expiryDate: data.expiryDate ? new Date(data.expiryDate) : undefined,
      ...calculations,
      status: data.status,
      notes: data.notes,
      termsConditions: data.termsConditions,
      items,
    });
  }

  async deleteQuotation(id: string) {
    await this.getQuotationById(id);
    await quotationRepository.delete(id);
  }

  async updateStatus(id: string, status: string) {
    await this.getQuotationById(id);
    return quotationRepository.update(id, { status });
  }
}

export const quotationService = new QuotationService();
