import { cache as reactCache } from "react";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

export type RadarDataPoint = {
  subject: string;
  A: number; // completed modules/courses
  fullMark: number;
};

export type MonthlyActivityPoint = {
  name: string;
  completed: number;
};

export type WeeklyActivityPoint = {
  day: string;
  completed: number;
};

export type HeatmapPoint = {
  date: string;
  count: number;
};

export type CourseModuleProgress = {
  id: string;
  title: string;
  completed: boolean;
  order: number;
};

export type CourseProgressDetail = {
  id: string;
  courseId: string;
  slug: string;
  title: string;
  status: string;
  progressPercent: number;
  modules: CourseModuleProgress[];
};

export type ProgressAnalyticsData = {
  radarData: RadarDataPoint[];
  monthlyData: MonthlyActivityPoint[];
  weeklyData: WeeklyActivityPoint[];
  heatmapData: HeatmapPoint[];
  detailedCourses: CourseProgressDetail[];
  stats: {
    totalHours: number;
    avgScore: number;
    certificates: number;
    lessonsCompleted: number;
    coursesEnrolled: number;
    learningStreak: number;
  };
};

export const getProgressData = reactCache(async (userId: string): Promise<ProgressAnalyticsData> => {
  return unstable_cache(async () => {
    const [enrollments, progressRecords, quizAttempts, certificates, videoProgress] = await Promise.all([
      prisma.enrollment.findMany({
        where: { learnerId: userId },
        include: {
          course: {
            include: {
              modules: {
                include: { lessons: { include: { assignment: true, quiz: true } } },
                orderBy: { order: "asc" },
              },
            },
          },
        },
      }),
      prisma.progress.findMany({
        where: { userId, completed: true },
        select: { lessonId: true, completedAt: true },
      }),
      prisma.quizAttempt.findMany({
        where: { userId, status: "PASSED" },
        select: { score: true },
      }),
      prisma.certificate.count({
        where: { userId, status: "GENERATED" },
      }),
      prisma.videoProgress.aggregate({
        where: { userId },
        _sum: { maxTimestamp: true },
      }),
    ]);

    const completedLessonIds = new Set(progressRecords.map(p => p.lessonId));

    // 1. Calculate Radar Data (Skills Matrix by Category)
    const categoryStats: Record<string, { completed: number; total: number }> = {};
    const detailedCourses: CourseProgressDetail[] = [];

    for (const enrollment of enrollments) {
      const course = enrollment.course;
      const cat = course.category || "General";
      
      if (!categoryStats[cat]) {
        categoryStats[cat] = { completed: 0, total: 0 };
      }

      const courseModules: CourseModuleProgress[] = [];

      for (const mod of course.modules) {
        categoryStats[cat].total++;
        
        const isModCompleted = mod.lessons.every(l => {
           // For simplicity in this deep view, checking standard progress is sufficient,
           // though real completions would check quizzes/assignments if strictly enforced.
           return completedLessonIds.has(l.id);
        });

        if (isModCompleted) {
          categoryStats[cat].completed++;
        }

        courseModules.push({
          id: mod.id,
          title: mod.title,
          completed: isModCompleted,
          order: mod.order,
        });
      }

      detailedCourses.push({
        id: enrollment.id,
        courseId: course.id,
        slug: course.slug,
        title: course.title,
        status: enrollment.status,
        progressPercent: enrollment.progressPercent,
        modules: courseModules,
      });
    }

    const radarData: RadarDataPoint[] = Object.entries(categoryStats).map(([subject, stats]) => ({
      subject,
      A: stats.completed,
      fullMark: stats.total > 0 ? stats.total : 1, // avoid 0
    }));

    // 2. Calculate Monthly Activity (last 6 months based on completed lessons)
    const monthlyData: MonthlyActivityPoint[] = [];
    const now = new Date();
    // Reset now to start of day for accurate streak/daily tracking
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = d.toLocaleString('default', { month: 'short' });
      monthlyData.push({ name: monthName, completed: 0 });
    }

    // Weekly activity (last 7 days)
    const weeklyData: WeeklyActivityPoint[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      weeklyData.push({ day: d.toLocaleString('default', { weekday: 'short' }), completed: 0 });
    }

    // Heatmap data (last 90 days)
    const heatmapDataMap: Record<string, number> = {};
    for (let i = 89; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      heatmapDataMap[d.toISOString().split('T')[0]] = 0;
    }

    const dailyActivityMap: Record<string, number> = {};

    for (const p of progressRecords) {
      if (p.completedAt) {
        const d = new Date(p.completedAt);
        const diffMonths = (now.getFullYear() - d.getFullYear()) * 12 + now.getMonth() - d.getMonth();
        if (diffMonths >= 0 && diffMonths < 6) {
           monthlyData[5 - diffMonths].completed++;
        }

        // Daily stuff
        const pDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
        const dateStr = pDate.toISOString().split('T')[0];
        
        // Heatmap
        if (heatmapDataMap[dateStr] !== undefined) {
          heatmapDataMap[dateStr]++;
        }

        // Weekly
        const diffDays = Math.floor((today.getTime() - pDate.getTime()) / (1000 * 3600 * 24));
        if (diffDays >= 0 && diffDays < 7) {
          weeklyData[6 - diffDays].completed++;
        }

        // Streak map
        dailyActivityMap[dateStr] = (dailyActivityMap[dateStr] || 0) + 1;
      }
    }

    const heatmapData: HeatmapPoint[] = Object.entries(heatmapDataMap).map(([date, count]) => ({ date, count }));

    // Calculate Streak
    let learningStreak = 0;
    let checkDate = new Date(today);
    // Start by checking today, if no activity today, check yesterday. If neither, streak is 0.
    const todayStr = checkDate.toISOString().split('T')[0];
    checkDate.setDate(checkDate.getDate() - 1);
    const yesterdayStr = checkDate.toISOString().split('T')[0];

    if (dailyActivityMap[todayStr] || dailyActivityMap[yesterdayStr]) {
      let currentCheck = dailyActivityMap[todayStr] ? new Date(today) : new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
      while (true) {
        const str = currentCheck.toISOString().split('T')[0];
        if (dailyActivityMap[str]) {
          learningStreak++;
          currentCheck.setDate(currentCheck.getDate() - 1);
        } else {
          break;
        }
      }
    }

    // 3. Stats
    const totalHours = Math.round((videoProgress._sum.maxTimestamp || 0) / 3600);
    const avgScore = quizAttempts.length > 0 
      ? Math.round(quizAttempts.reduce((acc, curr) => acc + curr.score, 0) / quizAttempts.length)
      : 0;
    const lessonsCompleted = progressRecords.length;
    const coursesEnrolled = enrollments.length;

    return {
      radarData,
      monthlyData,
      weeklyData,
      heatmapData,
      detailedCourses,
      stats: {
        totalHours,
        avgScore,
        certificates,
        lessonsCompleted,
        coursesEnrolled,
        learningStreak,
      }
    };
  }, [`progress-data-${userId}`], { tags: [`progress-${userId}`], revalidate: 300 })();
});
