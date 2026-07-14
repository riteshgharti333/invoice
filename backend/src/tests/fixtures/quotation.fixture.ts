export const validQuotation = {
  body: {
    customerId: 'cust123',
    items: [
      {
        serviceId: 'svc123',
        quantity: 1,
        unitPrice: 5000,
      },
    ],
  },
};

export const validQuotationAllFields = {
  body: {
    customerId: 'cust123',
    issueDate: '2024-01-01',
    expiryDate: '2024-12-31',
    discount: 10,
    tax: 18,
    notes: 'Test notes',
    termsConditions: 'Test terms',
    items: [
      {
        serviceId: 'svc123',
        description: 'Web development service',
        quantity: 2,
        unitPrice: 5000,
        taxRate: 18,
        discount: 5,
      },
    ],
  },
};

export const invalidQuotations = {
  missingCustomerId: {
    body: {
      items: [{ serviceId: 'svc123', quantity: 1, unitPrice: 5000 }],
    },
  },
  emptyItems: {
    body: {
      customerId: 'cust123',
      items: [],
    },
  },
  missingItems: {
    body: {
      customerId: 'cust123',
    },
  },
  missingBody: {},
  missingServiceId: {
    body: {
      customerId: 'cust123',
      items: [{ quantity: 1, unitPrice: 5000 }],
    },
  },
  zeroQuantity: {
    body: {
      customerId: 'cust123',
      items: [{ serviceId: 'svc123', quantity: 0, unitPrice: 5000 }],
    },
  },
  negativeUnitPrice: {
    body: {
      customerId: 'cust123',
      items: [{ serviceId: 'svc123', quantity: 1, unitPrice: -100 }],
    },
  },
  negativeDiscount: {
    body: {
      customerId: 'cust123',
      discount: -5,
      items: [{ serviceId: 'svc123', quantity: 1, unitPrice: 5000 }],
    },
  },
  overMaxDiscount: {
    body: {
      customerId: 'cust123',
      discount: 101,
      items: [{ serviceId: 'svc123', quantity: 1, unitPrice: 5000 }],
    },
  },
  negativeTax: {
    body: {
      customerId: 'cust123',
      tax: -5,
      items: [{ serviceId: 'svc123', quantity: 1, unitPrice: 5000 }],
    },
  },
  overMaxTax: {
    body: {
      customerId: 'cust123',
      tax: 101,
      items: [{ serviceId: 'svc123', quantity: 1, unitPrice: 5000 }],
    },
  },
  longNotes: {
    body: {
      customerId: 'cust123',
      notes: 'A'.repeat(1001),
      items: [{ serviceId: 'svc123', quantity: 1, unitPrice: 5000 }],
    },
  },
  longTerms: {
    body: {
      customerId: 'cust123',
      termsConditions: 'A'.repeat(2001),
      items: [{ serviceId: 'svc123', quantity: 1, unitPrice: 5000 }],
    },
  },
  itemNegativeTaxRate: {
    body: {
      customerId: 'cust123',
      items: [
        { serviceId: 'svc123', quantity: 1, unitPrice: 5000, taxRate: -1 },
      ],
    },
  },
  itemOverMaxTaxRate: {
    body: {
      customerId: 'cust123',
      items: [
        { serviceId: 'svc123', quantity: 1, unitPrice: 5000, taxRate: 101 },
      ],
    },
  },
  itemNegativeDiscount: {
    body: {
      customerId: 'cust123',
      items: [
        { serviceId: 'svc123', quantity: 1, unitPrice: 5000, discount: -5 },
      ],
    },
  },
  itemOverMaxDiscount: {
    body: {
      customerId: 'cust123',
      items: [
        { serviceId: 'svc123', quantity: 1, unitPrice: 5000, discount: 101 },
      ],
    },
  },
};

export const boundaryQuotations = {
  discountMin: {
    body: {
      customerId: 'cust123',
      discount: 0,
      items: [{ serviceId: 'svc123', quantity: 1, unitPrice: 5000 }],
    },
  },
  discountMax: {
    body: {
      customerId: 'cust123',
      discount: 100,
      items: [{ serviceId: 'svc123', quantity: 1, unitPrice: 5000 }],
    },
  },
  taxMin: {
    body: {
      customerId: 'cust123',
      tax: 0,
      items: [{ serviceId: 'svc123', quantity: 1, unitPrice: 5000 }],
    },
  },
  taxMax: {
    body: {
      customerId: 'cust123',
      tax: 100,
      items: [{ serviceId: 'svc123', quantity: 1, unitPrice: 5000 }],
    },
  },
  notesMax: {
    body: {
      customerId: 'cust123',
      notes: 'A'.repeat(1000),
      items: [{ serviceId: 'svc123', quantity: 1, unitPrice: 5000 }],
    },
  },
  termsMax: {
    body: {
      customerId: 'cust123',
      termsConditions: 'A'.repeat(2000),
      items: [{ serviceId: 'svc123', quantity: 1, unitPrice: 5000 }],
    },
  },
};

export const updateQuotations = {
  partialUpdate: {
    body: {
      notes: 'Updated notes',
    },
  },
  emptyBody: { body: {} },
  statusUpdate: {
    body: { status: 'SENT' },
  },
  invalidStatus: {
    body: { status: 'INVALID' },
  },
  nullableFields: {
    body: {
      expiryDate: null,
      notes: null,
      termsConditions: null,
    },
  },
};

export const updateStatus = {
  validDraft: { body: { status: 'DRAFT' } },
  validSent: { body: { status: 'SENT' } },
  validApproved: { body: { status: 'APPROVED' } },
  validRejected: { body: { status: 'REJECTED' } },
  validExpired: { body: { status: 'EXPIRED' } },
  invalidStatus: { body: { status: 'INVALID' } },
  missingStatus: { body: {} },
};