import type { InvoiceItem } from "../../frontend/src/types/invoice";

export interface Customer {
  id: string;
  customerCode: string;
  name: string;
  email: string | null;
  phone: string;
  address: string | null;
  gstNumber: string | null;
  notes: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    quotations: number;
    invoices: number;
  };
}

export interface CreateCustomerDto {
  name: string;
  email?: string;
  phone: string;
  address?: string;
  gstNumber?: string;
  notes?: string;
}

export interface UpdateCustomerDto {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  gstNumber?: string;
  notes?: string;
  isActive?: boolean;
}

export interface Service {
  id: string;
  serviceCode: string;
  name: string;
  description?: string;
  categoryId?: string;
  category?: {
    id: string;
    name: string;
  };
  unit: string;
  price: number;
  taxRate: number;
  createdAt: string;
  updatedAt: string;
  _count?: {
    quotationItems: number;
    invoiceItems: number;
  };
}

export interface CreateServiceDto {
  name: string;
  description?: string;
  categoryId?: string;
  unit?: string;
  price: number;
  taxRate?: number;
}

export interface UpdateServiceDto {
  name?: string;
  description?: string;
  categoryId?: string;
  unit?: string;
  price?: number;
  taxRate?: number;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    services: number;
  };
}

export interface CreateCategoryDto {
  name: string;
  description?: string;
}

export interface UpdateCategoryDto {
  name?: string;
  description?: string;
}

// Invoice

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customer?: {
    id: string;
    name: string;
    email?: string;
    phone: string;
  };
  quotationId?: string;
  quotation?: {
    id: string;
    quotationNumber: string;
  };
  issueDate: string;
  dueDate?: string;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  status:
    | "DRAFT"
    | "SENT"
    | "PARTIALLY_PAID"
    | "PAID"
    | "OVERDUE"
    | "CANCELLED";
  notes?: string;
  termsConditions?: string;
  items?: InvoiceItem[];
  payments?: Payment[];
  totalPaid?: number;
  remainingBalance?: number;
  isFromQuotation: Boolean;
  createdAt: string;
  updatedAt: string;
}

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
  status?:
    | "DRAFT"
    | "SENT"
    | "PARTIALLY_PAID"
    | "PAID"
    | "OVERDUE"
    | "CANCELLED";
  items?: InvoiceItemDto[];
}

// Payment

export interface CreatePaymentDto {
  invoiceId: string;
  amount: number;
  paymentMethod:
    | "CASH"
    | "BANK_TRANSFER"
    | "UPI"
    | "CREDIT_CARD"
    | "DEBIT_CARD"
    | "PAYPAL"
    | "OTHER";
  paymentDate?: string;
  transactionNumber?: string;
  notes?: string;
}

export interface UpdatePaymentDto {
  amount?: number;
  paymentMethod?:
    | "CASH"
    | "BANK_TRANSFER"
    | "UPI"
    | "CREDIT_CARD"
    | "DEBIT_CARD"
    | "PAYPAL"
    | "OTHER";
  paymentDate?: string;
  transactionNumber?: string;
  notes?: string;
  status?: "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";
}

export interface Payment {
  id: string;
  paymentNumber: string;
  invoiceId: string;
  invoice?: {
    id: string;
    invoiceNumber: string;
    customer?: {
      id: string;
      name: string;
      email?: string;
      phone: string;
    };
  };
  amount: number;
  paymentMethod: string;
  paymentDate: string;
  transactionNumber?: string;
  notes?: string;
  status: "COMPLETED" | "PENDING" | "FAILED" | "REFUNDED";
  createdAt: string;
  updatedAt: string;
}

export interface Quotation {
  id: string;
  quotationNumber: string;
  customerId: string;
  customer?: {
    id: string;
    name: string;
    email?: string;
    phone: string;
  };
  issueDate: string;
  expiryDate?: string;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  status: "DRAFT" | "SENT" | "APPROVED" | "REJECTED" | "EXPIRED";
  notes?: string;
  termsConditions?: string;
  items?: QuotationItemDto[];
  createdAt: string;
  updatedAt: string;
}

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

export interface Payment {
  id: string;
  paymentNumber: string;
  invoiceId: string;
  invoice?: {
    id: string;
    invoiceNumber: string;
    customer?: {
      id: string;
      name: string;
      email?: string;
      phone: string;
    };
  };
  amount: number;
  paymentMethod: string;
  paymentDate: string;
  transactionNumber?: string;
  notes?: string;
  status: "COMPLETED" | "PENDING" | "FAILED" | "REFUNDED";
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentDto {
  invoiceId: string;
  amount: number;
  paymentMethod:
    | "CASH"
    | "BANK_TRANSFER"
    | "UPI"
    | "CREDIT_CARD"
    | "DEBIT_CARD"
    | "PAYPAL"
    | "OTHER";
  paymentDate?: string;
  transactionNumber?: string;
  notes?: string;
}

export interface UpdatePaymentDto {
  amount?: number;
  paymentMethod?:
    | "CASH"
    | "BANK_TRANSFER"
    | "UPI"
    | "CREDIT_CARD"
    | "DEBIT_CARD"
    | "PAYPAL"
    | "OTHER";
  paymentDate?: string;
  transactionNumber?: string;
  notes?: string;
  status?: "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";
}
