export interface InvoiceItemDto {
  serviceId: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  taxRate?: number;
  discount?: number;
}

export interface CreateInvoiceDto {
  customerId: string;
  quotationId?: string;
  issueDate?: string;
  dueDate?: string;
  discount?: number;
  tax?: number;
  notes?: string;
  termsConditions?: string;
  items: InvoiceItemDto[];
}

export interface UpdateInvoiceDto {
  customerId?: string;
  quotationId?: string;
  issueDate?: string;
  dueDate?: string;
  discount?: number;
  tax?: number;
  notes?: string;
  termsConditions?: string;
  status?: "DRAFT" | "SENT" | "PARTIALLY_PAID" | "PAID" | "OVERDUE" | "CANCELLED";
  items?: InvoiceItemDto[];
}