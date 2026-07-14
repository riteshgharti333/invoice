export interface CreatePaymentDto {
  invoiceId: string;
  amount: number;
  paymentMethod: "CASH" | "BANK_TRANSFER" | "UPI" | "CREDIT_CARD" | "DEBIT_CARD" | "PAYPAL" | "OTHER";
  paymentDate?: string;
  transactionNumber?: string;
  notes?: string;
}

export interface UpdatePaymentDto {
  amount?: number;
  paymentMethod?: "CASH" | "BANK_TRANSFER" | "UPI" | "CREDIT_CARD" | "DEBIT_CARD" | "PAYPAL" | "OTHER";
  paymentDate?: string;
  transactionNumber?: string;
  notes?: string;
  status?: "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";
}