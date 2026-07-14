export const validCustomer = {
  name: 'John Doe',
  email: 'john@example.com',
  phone: '9876543210',
  address: '123 Street, City',
};

export const invalidCustomers = {
  emptyName: { name: '', email: 'john@example.com', phone: '9876543210' },
  invalidEmail: { name: 'John', email: 'not-email', phone: '9876543210' },
  missingPhone: { name: 'John', email: 'john@example.com' },
};

export const updateCustomerData = {
  name: 'John Updated',
  phone: '1234567890',
};