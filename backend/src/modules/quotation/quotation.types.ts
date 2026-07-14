export interface QuotationItemDto {
  serviceId: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  taxRate?: number;
  discount?: number;
}

export interface CreateQuotationDto {
  customerId: string;
  issueDate?: string;
  expiryDate?: string;
  discount?: number;
  tax?: number;
  notes?: string;
  termsConditions?: string;
  items: QuotationItemDto[];
}

export interface UpdateQuotationDto {
  customerId?: string;
  issueDate?: string;
  expiryDate?: string;
  discount?: number;
  tax?: number;
  notes?: string;
  termsConditions?: string;
  status?: "DRAFT" | "SENT" | "APPROVED" | "REJECTED" | "EXPIRED";
  items?: QuotationItemDto[];
}