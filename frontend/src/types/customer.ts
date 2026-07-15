export interface Customer {
  id: string;
  customerCode: string;
  name: string;
  email?: string | null;
  phone: string;
  address?: string | null;
  gstNumber?: string | null;
  notes?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}