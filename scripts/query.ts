import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const lesson = await prisma.lesson.findFirst({ where: { title: "Course Introduction & Learning Setup" } });
  console.log(lesson);
}
main();
