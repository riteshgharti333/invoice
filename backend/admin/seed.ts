import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const firstNames = [
  'Aarav', 'Vihaan', 'Ananya', 'Reyansh', 'Diya',
  'Kabir', 'Sai', 'Arjun', 'Ishaan', 'Rudra',
  'Myra', 'Advik', 'Prisha', 'Aryan', 'Navya',
  'Dev', 'Ira', 'Shaurya', 'Kiara', 'Atharv',
  'Riya', 'Karan', 'Sneha', 'Rohit', 'Priya',
  'Vikram', 'Meera', 'Rahul', 'Anjali', 'Suresh',
];

const lastNames = [
  'Sharma', 'Patel', 'Singh', 'Kumar', 'Gupta',
  'Verma', 'Reddy', 'Nair', 'Joshi', 'Das',
  'Chopra', 'Kapoor', 'Agarwal', 'Saxena', 'Srivastava',
  'Menon', 'Iyer', 'Bose', 'Sen', 'Chauhan',
  'Yadav', 'Thakur', 'Pandey', 'Mishra', 'Tiwari',
  'Dubey', 'Rawat', 'Bhatt', 'Trivedi', 'Desai',
];

const cities = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai',
  'Kolkata', 'Pune', 'Jaipur', 'Ahmedabad', 'Lucknow',
  'Indore', 'Bhopal', 'Ludhiana', 'Patna', 'Vadodara',
  'Thane', 'Agra', 'Nashik', 'Faridabad', 'Meerut',
  'Rajkot', 'Varanasi', 'Srinagar', 'Amritsar', 'Ranchi',
  'Raipur', 'Jodhpur', 'Guwahati', 'Dehradun', 'Shimla',
];

const stateCodes = ['06', '07', '09', '23', '24', '27', '29', '33', '36'];

const notesList = [
  'Premium customer',
  'VIP client',
  'Regular client',
  'New customer',
  'Bulk orders',
  'Government client',
  'Export client',
  'Startup',
  'Corporate',
  'Long term contract',
];

function generatePhone(index: number): string {
  const prefixes = ['98765', '87654', '76543', '65432', '54321', '98760', '87650', '76540', '65430', '54320'];
  const prefix = prefixes[index % prefixes.length];
  const suffix = String(index * 12345).slice(-5).padStart(5, '0');
  return `+91 ${prefix} ${suffix}`;
}

function generateGST(index: number): string | null {
  if (index % 3 === 0) return null; // Every 3rd customer has no GST
  const stateCode = stateCodes[index % stateCodes.length];
  const pan = 'AABCT' + String(index).padStart(4, '0');
  const z = 'C1Z' + ((index % 9) + 1);
  return `${stateCode}${pan}${z}`;
}

async function main() {
  console.log('Seeding 30 customers...');

  // Delete existing customers
  await prisma.customer.deleteMany();
  console.log('Cleared existing customers');

  const customers = Array.from({ length: 30 }, (_, i) => {
    const firstName = firstNames[i];
    const lastName = lastNames[i];
    const name = `${firstName} ${lastName}`;
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i + 1}@example.com`;
    const code = `CUST-${String(i + 1).padStart(4, '0')}`;
    const isActive = !((i + 1) % 5 === 0); // Every 5th is inactive
    const hasNotes = i < notesList.length;
    const issueDay = (i * 8) + 1;

    return {
      customerCode: code,
      name,
      email,
      phone: generatePhone(i + 1),
      address: `${Math.floor(Math.random() * 999) + 1}, ${cities[i]}`,
      gstNumber: generateGST(i + 1),
      notes: hasNotes ? notesList[i] : null,
      isActive,
      createdAt: new Date(2024, Math.floor(i / 3), (i * 5) % 28 + 1),
      updatedAt: new Date(2024, 9, (i % 28) + 1),
    };
  });

  // Insert all customers
  for (const customer of customers) {
    await prisma.customer.create({
      data: customer,
    });
  }

  console.log(`Seeded ${customers.length} customers successfully`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });