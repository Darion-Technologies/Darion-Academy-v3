const { PrismaClient } = require('./generated/prisma/index.js');
const prisma = new PrismaClient();

async function main() {
  const shorts = await prisma.youTubeShort.findMany();
  if (shorts.length > 0) {
    const targetShort = shorts[0];
    const transcript = `In this short, we look at a classic JavaScript interview question regarding closures and the \`var\` keyword in loops.

When you run this code:

\`\`\`javascript
for (var i = 0; i < 3; i++) {
  setTimeout(() => {
    console.log(i);
  }, 100);
}
\`\`\`

You might expect it to log \`0, 1, 2\`. However, because \`var\` is function-scoped (or globally scoped here) and not block-scoped, by the time the \`setTimeout\` callbacks execute 100 milliseconds later, the loop has already completed and the value of \`i\` is \`3\`. 

Therefore, it logs \`3, 3, 3\` to the console! 

To fix this and get the expected \`0, 1, 2\`, you can simply change \`var\` to \`let\` which is block-scoped:

\`\`\`javascript
for (let i = 0; i < 3; i++) {
  setTimeout(() => {
    console.log(i);
  }, 100);
}
\`\`\`
`;
    await prisma.youTubeShort.updateMany({
      data: { transcript }
    });
    console.log("Updated all shorts with a sample transcript!");
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
