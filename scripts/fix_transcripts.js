const { PrismaClient } = require('./generated/prisma/index.js');
const prisma = new PrismaClient();

async function main() {
  await prisma.youTubeShort.updateMany({
    data: { transcript: null }
  });
  console.log("Cleared all transcripts");
}

main().catch(console.error).finally(() => prisma.$disconnect());
