const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.lesson.updateMany({
    where: {
      type: 'YOUTUBE'
    },
    data: {
      // "Me at the zoo" is 19 seconds long. The perfect test video.
      youtubeVideoId: 'jNQXAC9IVRw'
    }
  });
  console.log("Updated all YouTube lessons to a 19-second test video.");
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
