export interface Service {
  id: string;
  name: string;
  description?: string | null;
  hsnCode?: string | null;
  unitPrice: number;
  taxRate: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}