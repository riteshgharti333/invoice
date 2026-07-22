import { PrismaClient } from "@prisma/client";
import { generateCode } from "../src/common/utils/generateCode";
import { invoiceStatusSchema } from "@invoice/shared";

const prisma = new PrismaClient();

const CUSTOMER_ID = "cmrnbuhh7000156tylnou05pf";
const SERVICE_ID = "cmrnpziy400022v7nhhnx7g47";

async function generateInvoiceNumber(): Promise<string> {
  const count = await prisma.invoice.count();
  const code = generateCode("INV", count);

  const existingInvoice = await prisma.invoice.findUnique({
    where: { invoiceNumber: code }
  });
  
  if (existingInvoice) {
    return generateCode("INV", count + 1);
  }

  return code;
}

async function main() {
  console.log("🚀 Starting to insert invoices...\n");

  let success = 0;
  let failed = 0;

  // Get valid statuses from schema
  const statuses = invoiceStatusSchema.options;

  for (let i = 0; i < 200; i++) {
    try {
      // Date calculation
      const startDate = new Date(2025, 6, 1);
      const endDate = new Date(2026, 6, 31);
      const totalDays = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const daysToAdd = Math.floor((i / 200) * totalDays);
      const issueDate = new Date(startDate);
      issueDate.setDate(issueDate.getDate() + daysToAdd);
      
      const dueDate = new Date(issueDate);
      dueDate.setDate(dueDate.getDate() + 30);

      const quantity = Math.floor(Math.random() * 3) + 1;
      const unitPrice = 5000;
      const itemTotal = unitPrice * quantity;
      const invoiceNumber = await generateInvoiceNumber();
      const status = statuses[Math.floor(Math.random() * statuses.length)];

      // Direct Prisma insert
      await prisma.invoice.create({
        data: {
          invoiceNumber,
          customerId: CUSTOMER_ID,
          issueDate,
          dueDate,
          status,
          subtotal: itemTotal,
          discount: 0,
          tax: 0,
          total: itemTotal,
          isFromQuotation: false,
          items: {
            create: {
              serviceId: SERVICE_ID,
              quantity,
              unitPrice,
              taxRate: 0,
              discount: 0,
              total: itemTotal,
            }
          }
        }
      });

      success++;
      console.log(`✅ ${success}/200: ${invoiceNumber} | ${status} | ${issueDate.toISOString().split('T')[0]}`);

    } catch (error: any) {
      failed++;
      console.log(`❌ Error:`, error.message);
    }
  }

  console.log(`\n✨ Done! ${success} inserted, ${failed} failed`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());


  ////////////////////////////



  import { PrismaClient } from "@prisma/client";
import { generateCode } from "../src/common/utils/generateCode";

const prisma = new PrismaClient();

async function generateCustomerCode(): Promise<string> {
  const count = await prisma.customer.count();
  const code = generateCode("CUST", count);

  const existingCustomer = await prisma.customer.findUnique({
    where: { customerCode: code },
  });

  if (existingCustomer) {
    return generateCode("CUS", count + 1);
  }

  return code;
}

// Indian names for realistic data
const firstNames = [
  "Aarav",
  "Vivaan",
  "Aditya",
  "Vihaan",
  "Arjun",
  "Sai",
  "Reyansh",
  "Ayaan",
  "Krishna",
  "Ishaan",
  "Shaurya",
  "Atharv",
  "Advik",
  "Parth",
  "Rohan",
  "Karan",
  "Priya",
  "Ananya",
  "Diya",
  "Saanvi",
  "Aadhya",
  "Kiara",
  "Myra",
  "Anika",
  "Riya",
  "Zara",
  "Inaya",
  "Pari",
  "Aarohi",
  "Navya",
  "Ishita",
  "Shanaya",
  "Rahul",
  "Amit",
  "Vikram",
  "Rajesh",
  "Suresh",
  "Deepak",
  "Sanjay",
  "Nitin",
  "Neha",
  "Pooja",
  "Kavita",
  "Shweta",
  "Anjali",
  "Meera",
  "Divya",
  "Radhika",
];

const lastNames = [
  "Sharma",
  "Patel",
  "Singh",
  "Kumar",
  "Verma",
  "Gupta",
  "Reddy",
  "Joshi",
  "Mehta",
  "Shah",
  "Nair",
  "Menon",
  "Rao",
  "Das",
  "Malhotra",
  "Kapoor",
  "Chopra",
  "Bhatia",
  "Saxena",
  "Srivastava",
  "Thakur",
  "Yadav",
  "Jain",
  "Agarwal",
];

const cities = [
  "Mumbai",
  "Delhi",
  "Bangalore",
  "Hyderabad",
  "Chennai",
  "Kolkata",
  "Pune",
  "Ahmedabad",
  "Jaipur",
  "Lucknow",
  "Surat",
  "Indore",
  "Nagpur",
];

const streets = [
  "MG Road",
  "Brigade Road",
  "Park Street",
  "Linking Road",
  "FC Road",
  "Commercial Street",
  "Residency Road",
  "Church Street",
  "Marine Drive",
];

function generatePhone(): string {
  const prefixes = ["9", "8", "7", "6"];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  let phone = "+91 " + prefix;
  for (let i = 0; i < 9; i++) {
    phone += Math.floor(Math.random() * 10);
  }
  return phone;
}

function generateGST(): string {
  const stateCode = ["27", "29", "24", "33", "09", "07"][
    Math.floor(Math.random() * 6)
  ];
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let gst = stateCode;
  for (let i = 0; i < 10; i++) {
    gst += chars[Math.floor(Math.random() * chars.length)];
  }
  gst += Math.floor(Math.random() * 10);
  gst += chars[Math.floor(Math.random() * chars.length)];
  return gst;
}

async function main() {
  console.log("🚀 Starting to insert customers...\n");

  let success = 0;
  let failed = 0;

  for (let i = 0; i < 200; i++) {
    try {
      const firstName =
        firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const name = `${firstName} ${lastName}`;
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${Math.floor(Math.random() * 100)}@example.com`;
      const phone = generatePhone();
      const customerCode = await generateCustomerCode();
      const city = cities[Math.floor(Math.random() * cities.length)];
      const street = streets[Math.floor(Math.random() * streets.length)];
      const address = `${Math.floor(Math.random() * 200) + 1}, ${street}, ${city} - ${Math.floor(Math.random() * 900000) + 100000}`;
      const gstNumber = Math.random() > 0.3 ? generateGST() : undefined; // 70% have GST

      await prisma.customer.create({
        data: {
          customerCode,
          name,
          email,
          phone,
          address,
          gstNumber,
          notes: Math.random() > 0.7 ? "Preferred customer" : undefined,
        },
      });

      success++;

      if (success % 50 === 0) {
        console.log(`✅ Inserted ${success}/200 customers`);
      }
    } catch (error: any) {
      failed++;
      console.log(`❌ Error at customer ${i + 1}:`, error.message);
    }
  }

  console.log(`\n✨ Done! ${success} inserted, ${failed} failed`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());


  ///////////////////////////

  import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const categories = [
  { name: "Full-Service Digital Agency", description: "End-to-end digital solutions covering strategy, design, development, and marketing" },
  { name: "Creative/Branding Agency", description: "Brand identity, logo design, visual branding, and creative direction services" },
  { name: "UI/UX Design Agency", description: "User interface and user experience design for web and mobile applications" },
  { name: "Development Agency", description: "Custom software, web, and mobile application development services" },
  { name: "SEO Agency", description: "Search engine optimization, keyword research, and organic traffic growth" },
  { name: "PPC/Media Buying Agency", description: "Paid advertising campaigns across Google, Facebook, LinkedIn, and other platforms" },
  { name: "Social Media Agency", description: "Social media management, content creation, and community engagement" },
  { name: "Content Marketing Agency", description: "Content strategy, blog writing, video production, and content distribution" },
  { name: "Analytics/Data Agency", description: "Data analysis, reporting, conversion tracking, and business intelligence" },
  { name: "E-commerce Agency", description: "Online store development, product management, and e-commerce optimization" },
  { name: "Healthcare Digital Agency", description: "Specialized digital solutions for healthcare and medical industries" },
  { name: "Fintech Digital Agency", description: "Digital solutions for financial technology, banking, and insurance sectors" },
  { name: "Real Estate Digital Agency", description: "Property listing platforms, virtual tours, and real estate marketing" },
  { name: "SaaS Digital Agency", description: "Software-as-a-Service product design, development, and growth strategies" },
  { name: "Enterprise Digital Agency", description: "Large-scale digital transformation and enterprise-level solutions" },
  { name: "Startup-Focused Agency", description: "MVP development, growth hacking, and startup-focused digital services" },
  { name: "Project-Based Agency", description: "Fixed-scope projects with defined deliverables and timelines" },
  { name: "Retainer-Based Agency", description: "Ongoing monthly retainer services for continuous digital support" },
  { name: "Shopify/Shopify Plus Agency", description: "Specialized Shopify store development, customization, and optimization" },
  { name: "WordPress/WooCommerce Agency", description: "WordPress website development and WooCommerce e-commerce solutions" },
];

async function main() {
  console.log("🚀 Starting to insert categories...\n");

  let success = 0;
  let failed = 0;

  for (const category of categories) {
    try {
      await prisma.category.create({
        data: {
          name: category.name,
          description: category.description,
        }
      });

      success++;
      console.log(`✅ Created: ${category.name}`);

    } catch (error: any) {
      failed++;
      console.log(`❌ Failed: ${category.name} - ${error.message}`);
    }
  }

  console.log(`\n✨ Done! ${success} inserted, ${failed} failed`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());


  ////////////////////////



  import { PrismaClient } from "@prisma/client";
import { generateCode } from "../src/common/utils/generateCode";

const prisma = new PrismaClient({
  log: ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

async function generateServiceCode(): Promise<string> {
  const count = await prisma.service.count();
  const code = generateCode("SRV", count);

  const existingService = await prisma.service.findUnique({
    where: { serviceCode: code }
  });
  
  if (existingService) {
    return generateCode("SRV", count + 1);
  }

  return code;
}

async function main() {
  console.log("🚀 Starting to insert services...\n");

  try {
    // First, fetch all existing categories from DB
    const categories = await prisma.category.findMany();
    
    if (categories.length === 0) {
      console.log("❌ No categories found! Please create categories first.");
      return;
    }

    console.log(`📁 Found ${categories.length} categories in database\n`);

    // Create a map: category name -> category id
    const categoryMap = new Map(categories.map(cat => [cat.name, cat.id]));

    // Services data
    const servicesData = [
      { name: "Complete Digital Strategy", categoryName: "Full-Service Digital Agency", price: 150000, unit: "Project" },
      { name: "Digital Transformation Consulting", categoryName: "Full-Service Digital Agency", price: 200000, unit: "Project" },
      { name: "Logo Design Package", categoryName: "Creative/Branding Agency", price: 25000, unit: "Project" },
      { name: "Brand Identity Kit", categoryName: "Creative/Branding Agency", price: 50000, unit: "Project" },
      { name: "Website UI/UX Design", categoryName: "UI/UX Design Agency", price: 60000, unit: "Project" },
      { name: "Mobile App UI/UX Design", categoryName: "UI/UX Design Agency", price: 80000, unit: "Project" },
      { name: "Custom Web Development", categoryName: "Development Agency", price: 100000, unit: "Project" },
      { name: "Mobile App Development", categoryName: "Development Agency", price: 120000, unit: "Project" },
      { name: "SEO Audit & Strategy", categoryName: "SEO Agency", price: 20000, unit: "Project" },
      { name: "Monthly SEO Package", categoryName: "SEO Agency", price: 15000, unit: "Month" },
      { name: "Google Ads Management", categoryName: "PPC/Media Buying Agency", price: 20000, unit: "Month" },
      { name: "Social Media Management", categoryName: "Social Media Agency", price: 12000, unit: "Month" },
      { name: "Blog Writing Package", categoryName: "Content Marketing Agency", price: 8000, unit: "Month" },
      { name: "Video Content Production", categoryName: "Content Marketing Agency", price: 25000, unit: "Project" },
      { name: "Google Analytics Setup", categoryName: "Analytics/Data Agency", price: 10000, unit: "Project" },
      { name: "Shopify Store Setup", categoryName: "E-commerce Agency", price: 40000, unit: "Project" },
      { name: "Healthcare Website", categoryName: "Healthcare Digital Agency", price: 120000, unit: "Project" },
      { name: "Fintech App Development", categoryName: "Fintech Digital Agency", price: 150000, unit: "Project" },
      { name: "WordPress Website", categoryName: "WordPress/WooCommerce Agency", price: 35000, unit: "Project" },
      { name: "SaaS Product Design", categoryName: "SaaS Digital Agency", price: 90000, unit: "Project" },
    ];

    let success = 0;
    let skipped = 0;
    let failed = 0;

    for (const service of servicesData) {
      const categoryId = categoryMap.get(service.categoryName);
      
      if (!categoryId) {
        console.log(`⚠️  Category not found: ${service.categoryName}`);
        skipped++;
        continue;
      }

      const serviceCode = await generateServiceCode();

      await prisma.service.create({
        data: {
          serviceCode,
          name: service.name,
          categoryId: categoryId,
          unit: service.unit,
          price: service.price,
          taxRate: [0, 5, 12, 18][Math.floor(Math.random() * 4)],
        }
      });

      success++;
      console.log(`✅ ${serviceCode}: ${service.name}`);
    }

    console.log(`\n✨ Done! ${success} inserted, ${skipped} skipped, ${failed} failed`);

  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);


/////////////////////


import { PrismaClient } from "@prisma/client";
import { generateCode } from "../src/common/utils/generateCode";
import { invoiceStatusSchema } from "@invoice/shared";

const prisma = new PrismaClient();

async function generateInvoiceNumber(): Promise<string> {
  const count = await prisma.invoice.count();
  const code = generateCode("INV", count);

  const existingInvoice = await prisma.invoice.findUnique({
    where: { invoiceNumber: code }
  });
  
  if (existingInvoice) {
    return generateCode("INV", count + 1);
  }

  return code;
}

async function main() {
  console.log("🚀 Starting to insert invoices...\n");

  // Fetch all customers and services
  const customers = await prisma.customer.findMany({
    select: { id: true, name: true }
  });
  
  const services = await prisma.service.findMany({
    select: { id: true, name: true, price: true }
  });

  if (customers.length === 0) {
    console.log("❌ No customers found!");
    return;
  }

  if (services.length === 0) {
    console.log("❌ No services found!");
    return;
  }

  console.log(`📁 Found ${customers.length} customers`);
  console.log(`📁 Found ${services.length} services\n`);

  let success = 0;
  let failed = 0;
  const totalInvoices = 1000;

  const statuses = invoiceStatusSchema.options;

  for (let i = 0; i < totalInvoices; i++) {
    try {
      // Linear date calculation: July 2025 to July 2026
      const startDate = new Date(2025, 6, 1);
      const endDate = new Date(2026, 6, 31);
      const totalDays = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const daysToAdd = Math.floor((i / totalInvoices) * totalDays);
      const issueDate = new Date(startDate);
      issueDate.setDate(issueDate.getDate() + daysToAdd);
      
      const dueDate = new Date(issueDate);
      dueDate.setDate(dueDate.getDate() + 30);

      // Random customer and service
      const customer = customers[Math.floor(Math.random() * customers.length)];
      const service = services[Math.floor(Math.random() * services.length)];
      
      const quantity = Math.floor(Math.random() * 3) + 1;
      const unitPrice = Number(service.price);
      const itemTotal = unitPrice * quantity;
      const taxRate = [0, 5, 12, 18][Math.floor(Math.random() * 4)];
      const taxAmount = (itemTotal * taxRate) / 100;
      const total = itemTotal + taxAmount;
      
      const invoiceNumber = await generateInvoiceNumber();
      const status = statuses[Math.floor(Math.random() * statuses.length)];

      await prisma.invoice.create({
        data: {
          invoiceNumber,
          customerId: customer.id,
          issueDate,
          dueDate,
          status,
          subtotal: itemTotal,
          discount: 0,
          tax: taxRate,
          total: total,
          isFromQuotation: false,
          items: {
            create: {
              serviceId: service.id,
              quantity,
              unitPrice,
              taxRate,
              discount: 0,
              total: itemTotal,
            }
          }
        }
      });

      success++;

      if (success % 100 === 0) {
        console.log(`✅ ${success}/${totalInvoices} invoices inserted...`);
      }

    } catch (error: any) {
      failed++;
      console.log(`❌ Error at ${i + 1}:`, error.message);
    }
  }

  console.log(`\n✨ Done! ${success} inserted, ${failed} failed`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());


  //////////////////////



  import { PrismaClient } from "@prisma/client";
import { generateCode } from "../src/common/utils/generateCode";

const prisma = new PrismaClient();

async function generateQuotationNumber(): Promise<string> {
  const count = await prisma.quotation.count();
  const code = generateCode("QUO", count);

  const existingQuotation = await prisma.quotation.findUnique({
    where: { quotationNumber: code }
  });
  
  if (existingQuotation) {
    return generateCode("QUO", count + 1);
  }

  return code;
}

async function main() {
  console.log("🚀 Starting to insert quotations...\n");

  // Fetch all customers and services
  const customers = await prisma.customer.findMany({
    select: { id: true, name: true }
  });
  
  const services = await prisma.service.findMany({
    select: { id: true, name: true, price: true }
  });

  if (customers.length === 0) {
    console.log("❌ No customers found!");
    return;
  }

  if (services.length === 0) {
    console.log("❌ No services found!");
    return;
  }

  console.log(`📁 Found ${customers.length} customers`);
  console.log(`📁 Found ${services.length} services\n`);

  let success = 0;
  let failed = 0;
  const totalQuotations = 500;

  const statuses = ["DRAFT", "SENT", "APPROVED", "REJECTED", "EXPIRED"];

  for (let i = 0; i < totalQuotations; i++) {
    try {
      // Linear date calculation: July 2025 to July 2026
      const startDate = new Date(2025, 6, 1);
      const endDate = new Date(2026, 6, 31);
      const totalDays = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const daysToAdd = Math.floor((i / totalQuotations) * totalDays);
      const issueDate = new Date(startDate);
      issueDate.setDate(issueDate.getDate() + daysToAdd);
      
      // Expiry date: 30-90 days after issue
      const expiryDate = new Date(issueDate);
      expiryDate.setDate(expiryDate.getDate() + Math.floor(Math.random() * 60) + 30);

      // Random customer and 1-3 services
      const customer = customers[Math.floor(Math.random() * customers.length)];
      const itemCount = Math.floor(Math.random() * 3) + 1;
      
      let subtotal = 0;
      const items = [];

      for (let j = 0; j < itemCount; j++) {
        const service = services[Math.floor(Math.random() * services.length)];
        const quantity = Math.floor(Math.random() * 3) + 1;
        const unitPrice = Number(service.price);
        const itemTotal = unitPrice * quantity;
        
        items.push({
          serviceId: service.id,
          quantity,
          unitPrice,
          taxRate: 0,
          discount: 0,
          total: itemTotal,
        });

        subtotal += itemTotal;
      }

      const taxRate = [0, 5, 12, 18][Math.floor(Math.random() * 4)];
      const discount = Math.random() < 0.2 ? Math.floor(Math.random() * 10) : 0;
      const discountAmount = (subtotal * discount) / 100;
      const afterDiscount = subtotal - discountAmount;
      const taxAmount = (afterDiscount * taxRate) / 100;
      const total = afterDiscount + taxAmount;
      
      const quotationNumber = await generateQuotationNumber();
      const status = statuses[Math.floor(Math.random() * statuses.length)];

      await prisma.quotation.create({
        data: {
          quotationNumber,
          customerId: customer.id,
          issueDate,
          expiryDate,
          status: status as any,
          subtotal,
          discount,
          tax: taxRate,
          total,
          items: {
            create: items,
          }
        }
      });

      success++;

      if (success % 100 === 0) {
        console.log(`✅ ${success}/${totalQuotations} quotations inserted...`);
      }

    } catch (error: any) {
      failed++;
      console.log(`❌ Error at ${i + 1}:`, error.message);
    }
  }

  console.log(`\n✨ Done! ${success} inserted, ${failed} failed`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());