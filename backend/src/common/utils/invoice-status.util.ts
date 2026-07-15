export class InvoiceStatusUtil {
  static determineStatus(params: {
    currentStatus: string;
    dueDate: Date | null;
    totalPaid: number;
    invoiceTotal: number;
  }): string | null {
    const { currentStatus, dueDate, totalPaid, invoiceTotal } = params;

    // Don't change if already PAID or CANCELLED
    if (['PAID', 'CANCELLED'].includes(currentStatus)) {
      return null;
    }

    // Fully paid - always PAID
    if (totalPaid >= invoiceTotal) {
      return 'PAID';
    }

    // Partially paid
    if (totalPaid > 0) {
      // Check if overdue
      if (dueDate && new Date() > dueDate && currentStatus !== 'OVERDUE') {
        return 'OVERDUE';
      }
      return 'PARTIALLY_PAID';
    }

    // No payment, check overdue
    if (dueDate && new Date() > dueDate && currentStatus !== 'OVERDUE') {
      return 'OVERDUE';
    }

    return null; 
  }
}