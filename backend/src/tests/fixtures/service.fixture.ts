export const validService = {
  body: {
    name: 'Web Development',
    price: 5000,
  },
};

export const validServiceAllFields = {
  body: {
    name: 'Web Development',
    price: 5000,
    description: 'Full stack development',
    categoryId: 'cat123',
    unit: 'Project',
    taxRate: 18,
  },
};

export const invalidServices = {
  missingName: { body: { price: 5000 } },
  shortName: { body: { name: 'A', price: 5000 } },
  longName: { body: { name: 'A'.repeat(201), price: 5000 } },
  missingPrice: { body: { name: 'Web Development' } },
  zeroPrice: { body: { name: 'Web Development', price: 0 } },
  negativePrice: { body: { name: 'Web Development', price: -100 } },
  negativeTaxRate: { body: { name: 'Web Dev', price: 5000, taxRate: -1 } },
  overMaxTaxRate: { body: { name: 'Web Dev', price: 5000, taxRate: 101 } },
  longDescription: { body: { name: 'Web Dev', price: 5000, description: 'A'.repeat(1001) } },
  longUnit: { body: { name: 'Web Dev', price: 5000, unit: 'A'.repeat(51) } },
  missingBody: {},
};

export const boundaryServices = {
  nameMin: { body: { name: 'AB', price: 5000 } },
  nameMax: { body: { name: 'A'.repeat(200), price: 5000 } },
  priceDecimal: { body: { name: 'Web Dev', price: 99.99 } },
  taxRateMin: { body: { name: 'Web Dev', price: 5000, taxRate: 0 } },
  taxRateMax: { body: { name: 'Web Dev', price: 5000, taxRate: 100 } },
};

export const updateServices = {
  partialName: { body: { name: 'Updated Service' } },
  emptyBody: { body: {} },
  nullableDescription: { body: { description: null } },
  nullableCategoryId: { body: { categoryId: null } },
  allFields: {
    body: {
      name: 'Updated Service',
      description: 'Updated desc',
      categoryId: 'cat456',
      unit: 'Day',
      price: 10000,
      taxRate: 5,
    },
  },
  invalidPrice: { body: { price: -50 } },
};