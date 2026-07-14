import { afterAll } from 'vitest';
import { cleanTestData, prisma } from './test-utils';

afterAll(async () => {
  await cleanTestData();
  await prisma.$disconnect();
});