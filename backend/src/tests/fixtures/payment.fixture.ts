export const validPayment = {
  body: {
    invoiceId: 'inv123',
    amount: 5000,
    paymentMethod: 'BANK_TRANSFER',
  },
};

export const validPaymentAllFields = {
  body: {
    invoiceId: 'inv123',
    amount: 5000,
    paymentMethod: 'UPI',
    paymentDate: '2024-01-01',
    transactionNumber: 'TXN123456',
    notes: 'Payment notes',
  },
};

export const invalidPayments = {
  missingInvoiceId: { body: { amount: 5000, paymentMethod: 'CASH' } },
  missingAmount: { body: { invoiceId: 'inv123', paymentMethod: 'CASH' } },
  missingPaymentMethod: { body: { invoiceId: 'inv123', amount: 5000 } },
  missingBody: {},
  zeroAmount: { body: { invoiceId: 'inv123', amount: 0, paymentMethod: 'CASH' } },
  negativeAmount: { body: { invoiceId: 'inv123', amount: -100, paymentMethod: 'CASH' } },
  invalidPaymentMethod: { body: { invoiceId: 'inv123', amount: 5000, paymentMethod: 'INVALID' } },
  longTransactionNumber: { body: { invoiceId: 'inv123', amount: 5000, paymentMethod: 'CASH', transactionNumber: 'A'.repeat(101) } },
  longNotes: { body: { invoiceId: 'inv123', amount: 5000, paymentMethod: 'CASH', notes: 'A'.repeat(501) } },
};

export const paymentMethods = {
  cash: { body: { invoiceId: 'inv123', amount: 5000, paymentMethod: 'CASH' } },
  bankTransfer: { body: { invoiceId: 'inv123', amount: 5000, paymentMethod: 'BANK_TRANSFER' } },
  upi: { body: { invoiceId: 'inv123', amount: 5000, paymentMethod: 'UPI' } },
  creditCard: { body: { invoiceId: 'inv123', amount: 5000, paymentMethod: 'CREDIT_CARD' } },
  debitCard: { body: { invoiceId: 'inv123', amount: 5000, paymentMethod: 'DEBIT_CARD' } },
  paypal: { body: { invoiceId: 'inv123', amount: 5000, paymentMethod: 'PAYPAL' } },
  other: { body: { invoiceId: 'inv123', amount: 5000, paymentMethod: 'OTHER' } },
};

export const updatePayments = {
  partial: { body: { amount: 6000 } },
  emptyBody: { body: {} },
  statusUpdate: { body: { status: 'COMPLETED' } },
  invalidStatus: { body: { status: 'INVALID' } },
  nullableFields: { body: { transactionNumber: null, notes: null } },
};

export const updateStatus = {
  validPending: { body: { status: 'PENDING' } },
  validCompleted: { body: { status: 'COMPLETED' } },
  validFailed: { body: { status: 'FAILED' } },
  validRefunded: { body: { status: 'REFUNDED' } },
  invalidStatus: { body: { status: 'INVALID' } },
  missingStatus: { body: {} },
};