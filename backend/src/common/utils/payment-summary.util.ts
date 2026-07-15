export class PaymentSummaryUtil {
  static calculate(payments: any[], invoiceTotal: number) {
    const totalPaid = payments
      .filter(p => p.status === 'COMPLETED')
      .reduce((sum, p) => sum + Number(p.amount), 0);

    return {
      totalPaid,
      remainingBalance: invoiceTotal - totalPaid
    };
  }
}