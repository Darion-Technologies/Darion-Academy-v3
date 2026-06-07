import { prisma } from "./prisma";
import { BadgeType } from "@/generated/prisma";
import { getLeaderboardRankings } from "./leaderboard-data";

export const DEFAULT_BADGES = [
  {
    name: "Employee of the Week",
    description: "Awarded to the top performer of the week across all internal metrics.",
    type: BadgeType.WEEKLY_STAR,
    iconUrl: "/badges/weekly-star.svg",
    color: "#FBBF24", // Amber 400
  },
  {
    name: "Employee of the Month",
    description: "Awarded to the most outstanding employee of the month.",
    type: BadgeType.MONTHLY_HERO,
    iconUrl: "/badges/monthly-hero.svg",
    color: "#3B82F6", // Blue 500
  },
  {
    name: "Employee of the Year",
    description: "The pinnacle of corporate excellence. Awarded annually.",
    type: BadgeType.YEARLY_CHAMPION,
    iconUrl: "/badges/yearly-champion.svg",
    color: "#8B5CF6", // Violet 500
  },
];

export async function ensureDefaultBadges() {
  for (const badge of DEFAULT_BADGES) {
    await prisma.badge.upsert({
      where: { id: badge.type }, // We don't have a unique constraint on type, so let's check by type
      update: {},
      create: badge, // Wait, upsert needs a unique where. Let's do findFirst + create
    });
  }
}

export async function bootstrapBadges() {
  for (const defaultBadge of DEFAULT_BADGES) {
    const existing = await prisma.badge.findFirst({
      where: { type: defaultBadge.type },
    });
    if (!existing) {
      await prisma.badge.create({ data: defaultBadge });
    }
  }
}

/**
 * Gets all badges earned by a specific user.
 */
export async function getUserBadges(userId: string) {
  return prisma.userBadge.findMany({
    where: { userId },
    include: { badge: true },
    orderBy: { awardedAt: "desc" },
  });
}

/**
 * Calculates the top employee for a given timeframe and awards the badge.
 * This is currently based on the LMS leaderboard, but will scale to task/attendance API later.
 */
export async function awardPeriodicBadge(type: BadgeType, period: string) {
  await bootstrapBadges();

  const badge = await prisma.badge.findFirst({ where: { type } });
  if (!badge) throw new Error("Badge type not found");

  // Prevent duplicate awards for the same period
  const existingAward = await prisma.userBadge.findFirst({
    where: { badgeId: badge.id, period },
  });
  
  if (existingAward) {
    return { success: false, message: "Badge already awarded for this period", award: existingAward };
  }

  // 1. Fetch current metrics
  // In the future, this will merge Data from LMS + Attendance Portal + Jira/Tasks
  const rankings = await getLeaderboardRankings();
  const topPerformer = rankings[0];

  if (!topPerformer) {
    return { success: false, message: "No eligible users found" };
  }

  // 2. Award the badge
  const userBadge = await prisma.userBadge.create({
    data: {
      userId: topPerformer.id,
      badgeId: badge.id,
      period,
      metadata: {
        score: topPerformer.score,
        certificates: topPerformer.certificates,
        courses: topPerformer.courses,
        streaks: topPerformer.streaks,
        source: "LMS Leaderboard Snapshot",
      },
    },
  });

  // 3. Notify the user
  await prisma.notification.create({
    data: {
      userId: topPerformer.id,
      type: "GENERAL",
      title: `Congratulations! You are the ${badge.name}!`,
      message: `Your exceptional performance during ${period} has earned you a new badge.`,
      href: "/settings",
    },
  });

  return { success: true, award: userBadge, user: topPerformer };
}
