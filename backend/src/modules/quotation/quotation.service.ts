import { AppError } from "../../common/errors/AppError";
import { quotationRepository } from "./quotation.repository";
import { invoiceRepository } from "../invoice/invoice.repository";
import type { CreateQuotationDto, UpdateQuotationDto } from "./quotation.types";
import { HTTP_STATUS } from "../../common/constants/httpStatus";
import { generateCode } from "../../common/utils/generateCode";
import { FinancialCalculations } from "../../common/calculations/financial-calculations";
import { Pagination } from "../../common/utils/pagination";
import { Quotation, QuotationStatus } from "@prisma/client";
import { prisma } from "../../database/client";
import { Search } from "../../common/utils/search";
import { Filter } from "../../common/utils/filter";

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

  private async autoUpdateExpiredQuotations() {
    const quotations = await prisma.quotation.findMany({
      where: {
        status: { notIn: ["APPROVED", "REJECTED", "EXPIRED"] },
        expiryDate: { lt: new Date() },
      },
    });

    for (const quotation of quotations) {
      await quotationRepository.update(quotation.id, { status: "EXPIRED" });
    }
  }

  async getAllQuotations(query: { cursor?: string; limit?: string }) {
    await this.autoUpdateExpiredQuotations();

    const result = await Pagination.paginate<Quotation>(
      (args) =>
        prisma.quotation.findMany({
          ...args,
          include: {
            customer: {
              select: {
                name: true,
              },
            },
          },
        }),
      {
        cursor: query.cursor,
        limit: query.limit ? parseInt(query.limit) : undefined,
      },
    );

    return {
      ...result,
      data: result.data.map((quotation: any) => ({
        ...quotation,
      })),
    };
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

  async deleteQuotation(id: string) {
    await this.getQuotationById(id);
    await quotationRepository.delete(id);
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

  async updateStatus(id: string, status: string) {
    const quotation = await this.getQuotationById(id);

    // Update the status
    const updated = await quotationRepository.update(id, { status });

    // If approved, auto-create invoice
    if (status === "APPROVED") {
      const invoiceData = {
        invoiceNumber: generateCode("INV", await invoiceRepository.count()),
        customerId: quotation.customerId,
        quotationId: quotation.id,
        issueDate: new Date(),
        dueDate:
          quotation.expiryDate ||
          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now if no expiry
        subtotal: Number(quotation.subtotal),
        discount: Number(quotation.discount),
        tax: Number(quotation.tax),
        total: Number(quotation.total),
        notes: quotation.notes ?? undefined,
        termsConditions: quotation.termsConditions ?? undefined,
        status: "DRAFT",
        isFromQuotation: true,
        items: quotation.items?.map((item) => ({
          serviceId: item.serviceId,
          description: item.description ?? undefined,
          quantity: item.quantity,
          unitPrice: Number(item.unitPrice),
          taxRate: Number(item.taxRate),
          discount: Number(item.discount),
          total: Number(item.total),
        })),
      };

      // Create invoice - you need invoiceRepository or invoiceService injected
      await invoiceRepository.create(invoiceData);
    }

    return updated;
  }

  async searchQuotations(query: {
    q?: string;
    cursor?: string;
    limit?: string;
    status?: string;
  }) {
    return Search.search<Quotation>(
      (args) => quotationRepository.search(args),
      {
        searchTerm: query.q || "",
        exactFields: ["quotationNumber"],
        nestedFields: {
          customer: ["name", "phone"],
        },
        ...(query.status && {
          filters: {
            status: query.status,
          },
        }),
        cursor: query.cursor,
        limit: query.limit,
      },
    );
  }

  async filterQuotations(query: {
    status?: string;
    issueDateFrom?: string;
    issueDateTo?: string;
    totalFrom?: string;
    totalTo?: string;
    cursor?: string;
    limit?: string;
  }) {
    return Filter.filter<Quotation>(
      (args) => quotationRepository.filter(args),
      {
        filters: {
          status: query.status
            ? (query.status.toUpperCase() as QuotationStatus)
            : undefined,
          issueDateFrom: query.issueDateFrom,
          issueDateTo: query.issueDateTo,
          totalFrom: query.totalFrom,
          totalTo: query.totalTo,
        },
        cursor: query.cursor,
        limit: query.limit,
      },
    );
  }
}

export const quotationService = new QuotationService();
