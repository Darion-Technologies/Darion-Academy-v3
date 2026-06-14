const { PrismaClient } = require('./generated/prisma');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Setting REPLICA IDENTITY FULL for ConversationParticipant...');
    await prisma.$executeRawUnsafe(`ALTER TABLE "ConversationParticipant" REPLICA IDENTITY FULL;`);
    console.log('Successfully set REPLICA IDENTITY FULL!');
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
