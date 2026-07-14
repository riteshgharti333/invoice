export const validInvoice = {
  body: {
    customerId: 'cust123',
    items: [{ serviceId: 'svc123', quantity: 1, unitPrice: 5000 }],
  },
};

export const validInvoiceAllFields = {
  body: {
    customerId: 'cust123',
    quotationId: 'quot123',
    issueDate: '2024-01-01',
    dueDate: '2024-02-01',
    discount: 10,
    tax: 18,
    notes: 'Test invoice',
    termsConditions: 'Test terms',
    items: [{
      serviceId: 'svc123',
      description: 'Service desc',
      quantity: 2,
      unitPrice: 5000,
      taxRate: 18,
      discount: 5,
    }],
  },
};

export const invalidInvoices = {
  missingCustomerId: { body: { items: [{ serviceId: 'svc123', quantity: 1, unitPrice: 5000 }] } },
  emptyItems: { body: { customerId: 'cust123', items: [] } },
  missingItems: { body: { customerId: 'cust123' } },
  missingBody: {},
  missingServiceId: { body: { customerId: 'cust123', items: [{ quantity: 1, unitPrice: 5000 }] } },
  zeroQuantity: { body: { customerId: 'cust123', items: [{ serviceId: 'svc123', quantity: 0, unitPrice: 5000 }] } },
  negativeUnitPrice: { body: { customerId: 'cust123', items: [{ serviceId: 'svc123', quantity: 1, unitPrice: -100 }] } },
  negativeDiscount: { body: { customerId: 'cust123', discount: -5, items: [{ serviceId: 'svc123', quantity: 1, unitPrice: 5000 }] } },
  overMaxDiscount: { body: { customerId: 'cust123', discount: 101, items: [{ serviceId: 'svc123', quantity: 1, unitPrice: 5000 }] } },
  negativeTax: { body: { customerId: 'cust123', tax: -5, items: [{ serviceId: 'svc123', quantity: 1, unitPrice: 5000 }] } },
  overMaxTax: { body: { customerId: 'cust123', tax: 101, items: [{ serviceId: 'svc123', quantity: 1, unitPrice: 5000 }] } },
  longNotes: { body: { customerId: 'cust123', notes: 'A'.repeat(1001), items: [{ serviceId: 'svc123', quantity: 1, unitPrice: 5000 }] } },
  longTerms: { body: { customerId: 'cust123', termsConditions: 'A'.repeat(2001), items: [{ serviceId: 'svc123', quantity: 1, unitPrice: 5000 }] } },
  itemNegativeTaxRate: { body: { customerId: 'cust123', items: [{ serviceId: 'svc123', quantity: 1, unitPrice: 5000, taxRate: -1 }] } },
  itemOverMaxTaxRate: { body: { customerId: 'cust123', items: [{ serviceId: 'svc123', quantity: 1, unitPrice: 5000, taxRate: 101 }] } },
  itemNegativeDiscount: { body: { customerId: 'cust123', items: [{ serviceId: 'svc123', quantity: 1, unitPrice: 5000, discount: -5 }] } },
  itemOverMaxDiscount: { body: { customerId: 'cust123', items: [{ serviceId: 'svc123', quantity: 1, unitPrice: 5000, discount: 101 }] } },
};

export const boundaryInvoices = {
  discountMin: { body: { customerId: 'cust123', discount: 0, items: [{ serviceId: 'svc123', quantity: 1, unitPrice: 5000 }] } },
  discountMax: { body: { customerId: 'cust123', discount: 100, items: [{ serviceId: 'svc123', quantity: 1, unitPrice: 5000 }] } },
  taxMin: { body: { customerId: 'cust123', tax: 0, items: [{ serviceId: 'svc123', quantity: 1, unitPrice: 5000 }] } },
  taxMax: { body: { customerId: 'cust123', tax: 100, items: [{ serviceId: 'svc123', quantity: 1, unitPrice: 5000 }] } },
  notesMax: { body: { customerId: 'cust123', notes: 'A'.repeat(1000), items: [{ serviceId: 'svc123', quantity: 1, unitPrice: 5000 }] } },
  termsMax: { body: { customerId: 'cust123', termsConditions: 'A'.repeat(2000), items: [{ serviceId: 'svc123', quantity: 1, unitPrice: 5000 }] } },
};

export const updateInvoices = {
  partial: { body: { notes: 'Updated' } },
  emptyBody: { body: {} },
  statusUpdate: { body: { status: 'SENT' } },
  invalidStatus: { body: { status: 'INVALID' } },
  nullableFields: { body: { quotationId: null, dueDate: null, notes: null, termsConditions: null } },
};

export const updateStatus = {
  validDraft: { body: { status: 'DRAFT' } },
  validSent: { body: { status: 'SENT' } },
  validPartiallyPaid: { body: { status: 'PARTIALLY_PAID' } },
  validPaid: { body: { status: 'PAID' } },
  validOverdue: { body: { status: 'OVERDUE' } },
  validCancelled: { body: { status: 'CANCELLED' } },
  invalidStatus: { body: { status: 'INVALID' } },
  missingStatus: { body: {} },
};