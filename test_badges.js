const { awardPeriodicBadge } = require('./lib/badges');
const { BadgeType } = require('./generated/prisma');

async function test() {
  const result = await awardPeriodicBadge(BadgeType.WEEKLY_STAR, "2026-W23");
  console.log(result);
}
test().catch(console.error);
