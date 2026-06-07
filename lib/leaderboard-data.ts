import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";

export type LeaderboardEntry = {
  id: string;
  name: string;
  avatarUrl: string | null;
  score: number;
  certificates: number;
  courses: number;
  quizzes: number;
  streaks: number;
  rank: number;
  badges: any[];
};

export const getLeaderboardRankings = unstable_cache(
  async (): Promise<LeaderboardEntry[]> => {
    const users = await prisma.user.findMany({
      where: { active: true, role: { in: ["EMPLOYEE", "INTERN"] } },
      select: {
        id: true,
        name: true,
        avatarUrl: true,
        _count: {
          select: {
            certificates: { where: { status: "GENERATED" } },
            enrollments: { where: { progressPercent: 100 } },
            quizAttempts: { where: { status: "PASSED" } },
            loginStreaks: true,
          },
        },
        badges: {
          include: { badge: true },
          orderBy: { awardedAt: "desc" }
        }
      },
    });

    const rankings: LeaderboardEntry[] = users.map((user) => {
      const certs = user._count.certificates;
      const courses = user._count.enrollments;
      const quizzes = user._count.quizAttempts;
      const streaks = user._count.loginStreaks;
      
      // Calculate total score based on the point system
      const score = certs * 100 + courses * 50 + quizzes * 20 + streaks * 1;

      return {
        id: user.id,
        name: user.name,
        avatarUrl: user.avatarUrl,
        score,
        certificates: certs,
        courses,
        quizzes,
        streaks,
        rank: 0, // Assigned below
        badges: user.badges,
      };
    });

    // Sort by score descending
    rankings.sort((a, b) => b.score - a.score);

    // Assign dense ranks (ties get the same rank, next person gets rank + 1 relative to index)
    let currentRank = 1;
    for (let i = 0; i < rankings.length; i++) {
      if (i > 0 && rankings[i].score < rankings[i - 1].score) {
        currentRank = i + 1;
      }
      rankings[i].rank = currentRank;
    }

    return rankings;
  },
  ["global-leaderboard"],
  { revalidate: 3600 } // Cache for 1 hour to prevent DB load
);
