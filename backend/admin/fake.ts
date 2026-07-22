import { PrismaClient } from "@prisma/client";
import { generateCode } from "../src/common/utils/generateCode";

const prisma = new PrismaClient();

async function generatePaymentNumber(): Promise<string> {
  const count = await prisma.payment.count();
  const code = generateCode("PAY", count);

  const existingPayment = await prisma.payment.findUnique({
    where: { paymentNumber: code }
  });
  
  if (existingPayment) {
    return generateCode("PAY", count + 1);
  }

  return code;
}

async function generateTransactionNumber(): Promise<string> {
  const count = await prisma.payment.count();
  const code = generateCode("TXN", count);

  const existingPayment = await prisma.payment.findFirst({
    where: { transactionNumber: code }
  });
  
  if (existingPayment) {
    return generateCode("TXN", count + 1);
  }

  return code;
}

async function main() {
  console.log("🚀 Starting to insert payments...\n");

  try {
    // Fetch ALL invoices except DRAFT and CANCELLED
    const invoices = await prisma.invoice.findMany({
      where: {
        status: {
          in: ["PAID", "PARTIALLY_PAID", "SENT", "OVERDUE"]
        }
      },
      select: {
        id: true,
        invoiceNumber: true,
        total: true,
        status: true,
        issueDate: true,
        payments: {
          select: { amount: true, status: true }
        }
      }
    });

    if (invoices.length === 0) {
      console.log("❌ No invoices found!");
      return;
    }

    console.log(`📁 Found ${invoices.length} invoices\n`);

    const paymentMethods = ["CASH", "BANK_TRANSFER", "UPI", "CREDIT_CARD", "DEBIT_CARD", "PAYPAL", "OTHER"];
    const paymentStatuses = ["COMPLETED", "PENDING", "FAILED"];
    
    let success = 0;
    let failed = 0;
    let totalPayments = 0;

    for (const invoice of invoices) {
      try {
        const invoiceTotal = Number(invoice.total);
        
        // Calculate existing completed payments
        const existingPaid = invoice.payments
          .filter(p => p.status === "COMPLETED")
          .reduce((sum, p) => sum + Number(p.amount), 0);
        const remainingAmount = invoiceTotal - existingPaid;

        if (remainingAmount <= 0) continue;

        if (invoice.status === "PAID") {
          // Full payment - COMPLETED
          const paymentDate = new Date(invoice.issueDate);
          paymentDate.setDate(paymentDate.getDate() + Math.floor(Math.random() * 15) + 1);

          await prisma.payment.create({
            data: {
              paymentNumber: await generatePaymentNumber(),
              invoiceId: invoice.id,
              amount: remainingAmount,
              paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
              status: "COMPLETED",
              paymentDate,
              transactionNumber: await generateTransactionNumber(),
            }
          });

          totalPayments++;
          success++;

        } else if (invoice.status === "PARTIALLY_PAID") {
          // Partial payment (30-70% of remaining) - COMPLETED
          const partialAmount = Math.floor(remainingAmount * (Math.random() * 0.4 + 0.3));
          const paymentDate = new Date(invoice.issueDate);
          paymentDate.setDate(paymentDate.getDate() + Math.floor(Math.random() * 20) + 5);

          await prisma.payment.create({
            data: {
              paymentNumber: await generatePaymentNumber(),
              invoiceId: invoice.id,
              amount: partialAmount,
              paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
              status: "COMPLETED",
              paymentDate,
              transactionNumber: await generateTransactionNumber(),
            }
          });

          totalPayments++;
          success++;

        } else if (invoice.status === "SENT" || invoice.status === "OVERDUE") {
          // Random payment status for unpaid invoices
          const randomStatus = paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)];
          const paymentDate = new Date();
          paymentDate.setDate(paymentDate.getDate() - Math.floor(Math.random() * 10));

          const amount = randomStatus === "COMPLETED" 
            ? Math.floor(remainingAmount * (Math.random() * 0.5 + 0.1)) 
            : Math.floor(remainingAmount * (Math.random() * 0.3 + 0.1));

          await prisma.payment.create({
            data: {
              paymentNumber: await generatePaymentNumber(),
              invoiceId: invoice.id,
              amount,
              paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
              status: randomStatus,
              paymentDate,
              transactionNumber: randomStatus === "COMPLETED" ? await generateTransactionNumber() : null,
            }
          });

          totalPayments++;
          success++;
        }

        if (totalPayments % 50 === 0) {
          console.log(`✅ Created ${totalPayments} payments...`);
        }

      } catch (error: any) {
        failed++;
        console.log(`❌ Error for ${invoice.invoiceNumber}:`, error.message);
      }
    }

    console.log(`\n✨ Done! ${totalPayments} payments created, ${failed} failed`);

  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);