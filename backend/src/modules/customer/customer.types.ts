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
}