import { cache as reactCache } from "react";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import type { EnrollmentStatus, AttemptStatus } from "@/generated/prisma";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type DashboardEnrollment = {
  id: string;
  status: EnrollmentStatus;
  progressPercent: number;
  courseId: string;
  courseTitle: string;
  courseSlug: string;
  courseCategory: string;
  hasThumbnail: boolean;
  totalModules: number;
  completedModules: number;
  totalLessons: number;
  completedLessons: number;
  currentModuleTitle: string | null;
  nextPendingModuleTitle: string | null;
  nextPendingLessonId: string | null;
  quizStatus: "none" | "pending" | "passed" | "failed";
  assignmentStatus: "none" | "pending" | "submitted" | "approved" | "needs_correction";
  certificateStatus: "not_eligible" | "eligible" | "generated";
  certificateId: string | null;
};

export type PendingAction = {
  id: string;
  type: "module" | "quiz" | "assignment";
  title: string;
  courseName: string;
  courseSlug: string;
  lessonId?: string;
  quizId?: string;
  assignmentId?: string;
  status: string;
  priority: "high" | "medium" | "low";
  dueDate?: Date;
};

export type TopDashboardData = {
  user: { id: string; name: string; email: string; employeeId: string | null; department: string | null };
  enrollments: DashboardEnrollment[];
  pendingActions: PendingAction[];
  stats: {
    totalCourses: number;
    completedModules: number;
    totalModules: number;
    pendingAssignments: number;
    avgQuizScore: number;
    certificatesEarned: number;
    currentStreak: number;
    videoPlayedSeconds: number;
  };
  activeCourse: DashboardEnrollment | null;
};

/* ------------------------------------------------------------------ */
/* Data fetcher (cached per request)                                    */
/* ------------------------------------------------------------------ */

export const getTopDashboardData = reactCache(async (userId: string): Promise<TopDashboardData> => {
  return unstable_cache(async () => {
  const [user, enrollmentsRaw, progressRecords, submissions, quizAttempts, certificates, streaks, videoProgress] = await Promise.all([
    prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { id: true, name: true, email: true, employeeId: true, department: true },
    }),
    prisma.enrollment.findMany({
      where: { learnerId: userId },
      include: {
        course: {
          include: {
            modules: {
              include: {
                lessons: {
                  include: { assignment: { select: { id: true, dueDays: true } }, quiz: { select: { id: true } } },
                  orderBy: { order: "asc" },
                },
              },
              orderBy: { order: "asc" },
            },
          },
        },
      },
      orderBy: { assignedAt: "desc" },
    }),
    prisma.progress.findMany({
      where: { userId, completed: true },
      select: { lessonId: true },
    }),
    prisma.submission.findMany({
      where: { learnerId: userId },
      select: { assignmentId: true, status: true },
    }),
    prisma.quizAttempt.findMany({
      where: { userId },
      select: { quizId: true, status: true, score: true, submittedAt: true },
      orderBy: { submittedAt: "desc" },
    }),
    prisma.certificate.findMany({
      where: { userId },
      select: { id: true, enrollmentId: true, status: true },
    }),
    // Week-only streaks - used by StreakWidget
    prisma.loginStreak.findMany({
      where: { userId, date: { gte: getStartOfWeek() } },
      select: { date: true },
      orderBy: { date: "asc" },
    }),
    prisma.videoProgress.aggregate({
      where: { userId },
      _sum: { maxTimestamp: true },
    }),
  ]);

  const completedLessonIds = new Set(progressRecords.map((p) => p.lessonId));
  const submissionMap = new Map(submissions.map((s) => [s.assignmentId, s.status]));
  const quizMap = new Map<string, { status: AttemptStatus; score: number }>();
  for (const a of quizAttempts) {
    if (!quizMap.has(a.quizId) || a.status === "PASSED") {
      quizMap.set(a.quizId, { status: a.status, score: a.score });
    }
  }
  const certMap = new Map(certificates.map((c) => [c.enrollmentId, c]));

  const pendingActions: PendingAction[] = [];
  let totalCompletedModules = 0;
  let totalModulesCount = 0;
  const totalQuizScores: number[] = [];

  const enrollments: DashboardEnrollment[] = enrollmentsRaw.map((enrollment) => {
    const course = enrollment.course;
    const allLessons = course.modules.flatMap((m) => m.lessons);
    const isLessonDone = (l: any) => {
      if (l.quiz) return quizMap.get(l.quiz.id)?.status === "PASSED";
      if (l.assignment) return submissionMap.get(l.assignment.id) === "APPROVED";
      return completedLessonIds.has(l.id);
    };

    const completedLessons = allLessons.filter(isLessonDone);

    // Module completion tracking
    let completedModules = 0;
    let currentModuleTitle: string | null = null;
    let nextPendingModuleTitle: string | null = null;
    let nextPendingLessonId: string | null = null;

    for (const mod of course.modules) {
      const modLessons = mod.lessons;
      const modCompleted = modLessons.every(isLessonDone);
      if (modCompleted) {
        completedModules++;
      } else {
        if (!currentModuleTitle) currentModuleTitle = mod.title;
        if (!nextPendingModuleTitle) nextPendingModuleTitle = mod.title;
        // Find first incomplete lesson in this module
        if (!nextPendingLessonId) {
          const pendingLesson = modLessons.find((l) => !isLessonDone(l));
          if (pendingLesson) nextPendingLessonId = pendingLesson.id;
        }
      }
    }

    totalCompletedModules += completedModules;
    totalModulesCount += course.modules.length;

    // Quiz status for this course
    const courseQuizIds = allLessons.flatMap((l) => (l.quiz ? [l.quiz.id] : []));
    let quizStatus: DashboardEnrollment["quizStatus"] = "none";
    if (courseQuizIds.length > 0) {
      const results = courseQuizIds.map((qId) => quizMap.get(qId));
      if (results.some((r) => r?.status === "PASSED")) {
        quizStatus = "passed";
      } else if (results.some((r) => r?.status === "FAILED")) {
        quizStatus = "failed";
      } else {
        quizStatus = "pending";
      }
    }

    // Quiz scores for avg calculation
    for (const qId of courseQuizIds) {
      const r = quizMap.get(qId);
      if (r) totalQuizScores.push(r.score);
    }

    // Assignment status for this course
    const courseAssignmentIds = allLessons.flatMap((l) => (l.assignment ? [l.assignment.id] : []));
    let assignmentStatus: DashboardEnrollment["assignmentStatus"] = "none";
    if (courseAssignmentIds.length > 0) {
      const statuses = courseAssignmentIds.map((aId) => submissionMap.get(aId));
      if (statuses.every((s) => s === "APPROVED")) {
        assignmentStatus = "approved";
      } else if (statuses.some((s) => s === "NEEDS_CORRECTION")) {
        assignmentStatus = "needs_correction";
      } else if (statuses.some((s) => s === "SUBMITTED")) {
        assignmentStatus = "submitted";
      } else {
        assignmentStatus = "pending";
      }
    }

    // Certificate status
    const cert = certMap.get(enrollment.id);
    let certificateStatus: DashboardEnrollment["certificateStatus"] = "not_eligible";
    let certificateId: string | null = null;
    if (cert) {
      certificateId = cert.id;
      certificateStatus = cert.status === "GENERATED" ? "generated" : "eligible";
    }

    // Build pending actions for this course
    for (const mod of course.modules) {
      const modCompleted = mod.lessons.every(isLessonDone);
      if (!modCompleted && enrollment.status !== "COMPLETED") {
        const firstPending = mod.lessons.find((l) => !isLessonDone(l));
        if (firstPending) {
          // Check if it has a quiz or assignment
          if (firstPending.quiz) {
            const qResult = quizMap.get(firstPending.quiz.id);
            if (!qResult || qResult.status !== "PASSED") {
              pendingActions.push({
                id: `quiz-${firstPending.quiz.id}`,
                type: "quiz",
                title: firstPending.title,
                courseName: course.title,
                courseSlug: course.slug,
                quizId: firstPending.quiz.id,
                status: qResult?.status === "FAILED" ? "Retake needed" : "Not attempted",
                priority: qResult?.status === "FAILED" ? "high" : "medium",
              });
            }
          } else if (firstPending.assignment) {
            const subStatus = submissionMap.get(firstPending.assignment.id);
            if (subStatus !== "APPROVED") {
              let dueDate: Date | undefined;
              if (firstPending.assignment.dueDays) {
                dueDate = new Date(enrollment.assignedAt);
                dueDate.setDate(dueDate.getDate() + firstPending.assignment.dueDays);
              }
              pendingActions.push({
                id: `assignment-${firstPending.assignment.id}`,
                type: "assignment",
                title: firstPending.title,
                courseName: course.title,
                courseSlug: course.slug,
                lessonId: firstPending.id,
                assignmentId: firstPending.assignment.id,
                status: subStatus === "SUBMITTED" ? "Waiting for approval" : subStatus === "NEEDS_CORRECTION" ? "Rework needed" : "Not submitted",
                priority: subStatus === "NEEDS_CORRECTION" ? "high" : subStatus === "SUBMITTED" ? "low" : "medium",
                dueDate,
              });
            }
          } else {
            pendingActions.push({
              id: `module-${firstPending.id}`,
              type: "module",
              title: firstPending.title,
              courseName: course.title,
              courseSlug: course.slug,
              lessonId: firstPending.id,
              status: "Incomplete",
              priority: "medium",
            });
          }
        }
      }
    }

    return {
      id: enrollment.id,
      status: enrollment.status,
      progressPercent: enrollment.progressPercent,
      courseId: course.id,
      courseTitle: course.title,
      courseSlug: course.slug,
      courseCategory: course.category,
      hasThumbnail: Boolean(course.thumbnailUrl),
      totalModules: course.modules.length,
      completedModules,
      totalLessons: allLessons.length,
      completedLessons: completedLessons.length,
      currentModuleTitle,
      nextPendingModuleTitle,
      nextPendingLessonId,
      quizStatus,
      assignmentStatus,
      certificateStatus,
      certificateId,
    };
  });

  // Sort pending actions by priority
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  pendingActions.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  // Find the active course (most recent in-progress enrollment)
  const activeCourse = enrollments.find((e) => e.status === "IN_PROGRESS" && e.progressPercent > 0 && e.progressPercent < 100) ?? enrollments.find((e) => e.status === "ASSIGNED") ?? null;

  const streakDays = streaks.map((s) => s.date);
  const currentStreak = calculateCurrentStreak(userId, streakDays);

  return {
    user,
    enrollments,
    pendingActions,
    stats: {
      totalCourses: enrollments.length,
      completedModules: totalCompletedModules,
      totalModules: totalModulesCount,
      pendingAssignments: pendingActions.filter((a) => a.type === "assignment").length,
      avgQuizScore: totalQuizScores.length > 0 ? Math.round(totalQuizScores.reduce((s, v) => s + v, 0) / totalQuizScores.length) : 0,
      certificatesEarned: certificates.filter((c) => c.status === "GENERATED").length,
      currentStreak,
      videoPlayedSeconds: videoProgress._sum.maxTimestamp || 0,
    },
    activeCourse,
  };
  }, [`dashboard-data-${userId}`], { tags: [`dashboard-${userId}`], revalidate: 300 })();
});

export const getHeatmapData = reactCache(async (userId: string) => {
  return unstable_cache(async () => {
  const heatmapStreaks = await prisma.loginStreak.findMany({
    where: { userId, date: { gte: getStartOfYear() } },
    select: { date: true },
    orderBy: { date: "asc" },
  });
  return { heatmapDays: heatmapStreaks.map((s) => s.date) };
  }, [`heatmap-data-${userId}`], { tags: [`heatmap-${userId}`], revalidate: 3600 })();
});

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function getStartOfWeek(): Date {
  const now = new Date();
  const day = now.getDay(); // 0=Sun
  const diff = day === 0 ? 6 : day - 1; // Mon=0
  const start = new Date(now);
  start.setDate(now.getDate() - diff);
  start.setHours(0, 0, 0, 0);
  return start;
}

function getStartOfYear(): Date {
  const now = new Date();
  const start = new Date(now);
  start.setFullYear(now.getFullYear() - 1);
  start.setHours(0, 0, 0, 0);
  return start;
}

function calculateCurrentStreak(_userId: string, weekDays: Date[]): number {
  if (weekDays.length === 0) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Count consecutive days ending at today or yesterday
  let streak = 0;
  const checkDate = new Date(today);

  // Check if today is logged
  const todayLogged = weekDays.some((d) => new Date(d).toDateString() === today.toDateString());
  if (!todayLogged) {
    checkDate.setDate(checkDate.getDate() - 1);
  }

  for (let i = 0; i < 7; i++) {
    const logged = weekDays.some((d) => new Date(d).toDateString() === checkDate.toDateString());
    if (logged) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}
