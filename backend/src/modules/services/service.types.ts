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