import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const question = await prisma.question.findFirst({
    where: { type: 'MULTIPLE_CHOICE' }
  });
  console.log('Options:', question?.options);
  console.log('Type of options:', typeof question?.options);
}

main().catch(console.error).finally(() => prisma.$disconnect());
