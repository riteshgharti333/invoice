export type InvoiceStatus = 'DRAFT' | 'SENT' | 'PARTIALLY_PAID' | 'PAID' | 'OVERDUE' | 'CANCELLED';

export interface InvoiceItem {
  id: string;
  invoiceId: string;
  serviceId: string;
  service?: {
    id: string;
    name: string;
  };
  description?: string | null;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  discount: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customer?: {
    id: string;
    name: string;
    email?: string;
  };
  quotationId?: string | null;
  issueDate: string;
  dueDate?: string | null;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  status: InvoiceStatus;
  notes?: string | null;
  termsConditions?: string | null;
  items?: InvoiceItem[];
  createdAt: string;
  updatedAt: string;
}