export interface CalcItem {
  quantity: number;
  unitPrice: number;
  taxRate: number;
  discount: number;
}

export interface Totals {
  subtotal: number;
  totalTax: number;
  totalDiscount: number;
  grandTotal: number;
}

export function calcItemTotal(item: CalcItem): number {
  const qty = item.quantity || 0;
  const price = item.unitPrice || 0;
  const taxRate = item.taxRate || 0;
  const discount = item.discount || 0;

  const baseAmount = qty * price;
  const taxAmount = (baseAmount * taxRate) / 100;
  const discountAmount = (baseAmount * discount) / 100;

  return baseAmount + taxAmount - discountAmount;
}

export function calcTotals(items: CalcItem[]): Totals {
  const subtotal = items.reduce((sum, item) => sum + (item.quantity || 0) * (item.unitPrice || 0), 0);
  const totalTax = items.reduce((sum, item) => sum + ((item.quantity || 0) * (item.unitPrice || 0) * (item.taxRate || 0)) / 100, 0);
  const totalDiscount = items.reduce((sum, item) => sum + ((item.quantity || 0) * (item.unitPrice || 0) * (item.discount || 0)) / 100, 0);
  const grandTotal = subtotal + totalTax - totalDiscount;

  return { subtotal, totalTax, totalDiscount, grandTotal };
}

export function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
}

export function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}