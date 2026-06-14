const { PrismaClient } = require('./generated/prisma');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Enabling realtime for ConversationParticipant...');
    await prisma.$executeRawUnsafe(`ALTER PUBLICATION supabase_realtime ADD TABLE "ConversationParticipant";`);
    console.log('Successfully enabled realtime for ConversationParticipant!');
  } catch (error) {
    console.error('Error (might already be enabled):', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
