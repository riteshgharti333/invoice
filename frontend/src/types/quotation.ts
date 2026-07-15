export type QuotationStatus = 'DRAFT' | 'SENT' | 'APPROVED' | 'REJECTED' | 'EXPIRED';

export interface QuotationItem {
  id: string;
  quotationId: string;
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

export interface Quotation {
  id: string;
  quotationNumber: string;
  customerId: string;
  customer?: {
    id: string;
    name: string;
    email?: string;
  };
  issueDate: string;
  expiryDate?: string | null;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  status: QuotationStatus;
  notes?: string | null;
  termsConditions?: string | null;
  items?: QuotationItem[];
  createdById?: string | null;
  createdAt: string;
  updatedAt: string;
}