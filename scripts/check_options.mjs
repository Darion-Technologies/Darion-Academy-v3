import { PrismaClient } from './generated/prisma/index.js';
const prisma = new PrismaClient({ log: ['query'] });
async function main() {
  const q = await prisma.question.findFirst({ where: { type: 'MULTIPLE_CHOICE' } });
  console.log("===RESULT===");
  console.log(q.options);
  console.log("TYPE:", typeof q.options);
  console.log("===END===");
}
main().finally(() => prisma.$disconnect());
