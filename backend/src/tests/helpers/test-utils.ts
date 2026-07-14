import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function cleanTestData() {
  await prisma.payment.deleteMany({ where: { notes: { contains: 'TEST_' } } });
  await prisma.invoiceItem.deleteMany({ where: { description: { contains: 'TEST_' } } });
  await prisma.invoice.deleteMany({ where: { notes: { contains: 'TEST_' } } });
  await prisma.quotationItem.deleteMany({ where: { description: { contains: 'TEST_' } } });
  await prisma.quotation.deleteMany({ where: { notes: { contains: 'TEST_' } } });
  
  // Delete ALL remaining quotations/invoices that reference test customers
  await prisma.quotation.deleteMany({
    where: { customer: { notes: { contains: 'TEST_' } } }
  });
  await prisma.invoice.deleteMany({
    where: { customer: { notes: { contains: 'TEST_' } } }
  });
  
  // Now safe to delete
  await prisma.service.deleteMany({ where: { description: { contains: 'TEST_' } } });
  await prisma.customer.deleteMany({ where: { notes: { contains: 'TEST_' } } });
}
export { prisma };