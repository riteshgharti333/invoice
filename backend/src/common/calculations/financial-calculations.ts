// Create a common interface for items
export interface BillItem {
  quantity: number;
  unitPrice: number;
  discount?: number;
  taxRate?: number;
}

export class FinancialCalculations {
  // Calculate total for a single item including discounts and taxes
  // Formula: (quantity * unitPrice) - discount + tax
  static calculateItemTotal(item: BillItem): number {
    // Calculate base total
    const itemTotal = item.quantity * item.unitPrice;
    // Apply item-level discount
    const discountAmount = (itemTotal * (item.discount || 0)) / 100;
    // Apply tax on discounted amount
    const taxAmount = ((itemTotal - discountAmount) * (item.taxRate || 0)) / 100;
    // Return final item total
    return itemTotal - discountAmount + taxAmount;
  }

  // Calculate subtotal for all items before discounts and taxes
  // Sum of (quantity * unitPrice) for all items
  static calculateSubtotal(items: BillItem[]): number {
    return items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  }

  // Calculate total item-level discounts
  // Sum of individual item discounts
  static calculateItemDiscounts(items: BillItem[]): number {
    return items.reduce((sum, item) => {
      const itemTotal = item.quantity * item.unitPrice;
      return sum + (itemTotal * (item.discount || 0)) / 100;
    }, 0);
  }

  // Calculate global discount amount on subtotal
  static calculateGlobalDiscount(subtotal: number, discountPercentage: number): number {
    return (subtotal * discountPercentage) / 100;
  }

  // Calculate tax amount on discounted total
  static calculateTax(afterDiscount: number, taxPercentage: number): number {
    return (afterDiscount * taxPercentage) / 100;
  }

  // Calculate all totals for a bill (quotation/invoice)
  static calculateTotals(
    items: BillItem[],
    discount: number = 0,
    tax: number = 0,
  ): {
    subtotal: number;
    discount: number;
    tax: number;
    total: number;
  } {
    // Calculate subtotal
    const subtotal = this.calculateSubtotal(items);
    // Calculate item-level discounts
    const itemDiscounts = this.calculateItemDiscounts(items);
    // Calculate global discount
    const globalDiscount = this.calculateGlobalDiscount(subtotal, discount);
    // Total discount = item discounts + global discount
    const totalDiscount = itemDiscounts + globalDiscount;
    // Apply discounts
    const afterDiscount = subtotal - totalDiscount;
    // Apply tax
    const taxAmount = this.calculateTax(afterDiscount, tax);
    // Final total
    const total = afterDiscount + taxAmount;

    return {
      subtotal,
      discount: totalDiscount,
      tax: taxAmount,
      total,
    };
  }

  // Format monetary values with proper rounding
  static roundToDecimals(value: number, decimals: number = 2): number {
    return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
  }

  // Calculate profit margin percentage
  static calculateProfitMargin(costPrice: number, sellingPrice: number): number {
    if (sellingPrice === 0) return 0;
    return ((sellingPrice - costPrice) / sellingPrice) * 100;
  }
}