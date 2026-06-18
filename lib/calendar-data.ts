import { cache as reactCache } from "react";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

export type CalendarEvent = {
  id: string;
  title: string;
  date: Date;
  type: "assignment" | "quiz" | "course_start" | "personal";
  courseName: string;
  courseSlug: string;
  status: "pending" | "completed" | "overdue";
  link: string;
};

export type CalendarData = {
  events: CalendarEvent[];
  heatmapDays: string[]; // YYYY-MM-DD
};

export const getCalendarData = reactCache(async (userId: string): Promise<CalendarData> => {
  return unstable_cache(async () => {
    // 1. Fetch Heatmap Streaks (last 365 days)
    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - 1);
    
    const streaks = await prisma.loginStreak.findMany({
      where: { userId, date: { gte: startDate } },
      select: { date: true },
    });

    const heatmapDays = streaks.map(s => s.date.toISOString().split("T")[0]);

    // 2. Fetch Enrollments & Deadlines
    const enrollments = await prisma.enrollment.findMany({
      where: { learnerId: userId },
      include: {
        course: {
          include: {
            modules: {
              include: {
                lessons: {
                  include: { 
                    assignment: true, 
                    quiz: true 
                  },
                },
              },
            },
          },
        },
      },
    });

    const progressRecords = await prisma.progress.findMany({
      where: { userId, completed: true },
      select: { lessonId: true },
    });
    const completedLessonIds = new Set(progressRecords.map(p => p.lessonId));

    const submissions = await prisma.submission.findMany({
      where: { learnerId: userId },
      select: { assignmentId: true, status: true },
    });
    const submissionMap = new Map(submissions.map(s => [s.assignmentId, s.status]));

    const quizAttempts = await prisma.quizAttempt.findMany({
      where: { userId },
      select: { quizId: true, status: true },
    });
    const quizMap = new Map(quizAttempts.map(q => [q.quizId, q.status]));

    const events: CalendarEvent[] = [];
    const now = new Date();

    for (const enrollment of enrollments) {
      const course = enrollment.course;
      
      // Course Start Event
      events.push({
        id: `start-${enrollment.id}`,
        title: `${course.title} Started`,
        date: enrollment.assignedAt,
        type: "course_start",
        courseName: course.title,
        courseSlug: course.slug,
        status: "completed",
        link: `/courses/${course.slug}`,
      });

      for (const mod of course.modules) {
        for (const lesson of mod.lessons) {
          // Assignment Deadlines
          if (lesson.assignment && lesson.assignment.dueDays) {
            const dueDate = new Date(enrollment.assignedAt);
            dueDate.setDate(dueDate.getDate() + lesson.assignment.dueDays);
            
            const subStatus = submissionMap.get(lesson.assignment.id);
            const isCompleted = subStatus === "APPROVED" || subStatus === "SUBMITTED";
            const isOverdue = !isCompleted && dueDate < now;

            events.push({
              id: `assignment-${lesson.assignment.id}`,
              title: lesson.title,
              date: dueDate,
              type: "assignment",
              courseName: course.title,
              courseSlug: course.slug,
              status: isCompleted ? "completed" : isOverdue ? "overdue" : "pending",
              link: `/courses/${course.slug}/${mod.id}/${lesson.id}`,
            });
          }

          // Quiz unlock or suggest dates (simulate due date 7 days after assigned)
          if (lesson.quiz) {
             const dueDate = new Date(enrollment.assignedAt);
             dueDate.setDate(dueDate.getDate() + 14); // default 2 weeks for quizzes
             
             const qStatus = quizMap.get(lesson.quiz.id);
             const isCompleted = qStatus === "PASSED";
             const isOverdue = !isCompleted && dueDate < now;

             events.push({
              id: `quiz-${lesson.quiz.id}`,
              title: lesson.title,
              date: dueDate,
              type: "quiz",
              courseName: course.title,
              courseSlug: course.slug,
              status: isCompleted ? "completed" : isOverdue ? "overdue" : "pending",
              link: `/courses/${course.slug}/${mod.id}/${lesson.id}`,
            });
          }
        }
      }
    }

    // 3. Fetch Personal Events
    const personalEvents = await prisma.personalEvent.findMany({
      where: { userId },
    });

    for (const pe of personalEvents) {
      events.push({
        id: `personal-${pe.id}`,
        title: pe.title,
        date: pe.date,
        type: "personal",
        courseName: pe.description || "Personal Event",
        courseSlug: "personal", // generic slug
        status: "pending",
        link: "#", // No specific link for personal events yet
      });
    }

    return {
      events: events.sort((a, b) => a.date.getTime() - b.date.getTime()),
      heatmapDays,
    };
  }, [`calendar-data-${userId}`], { tags: [`calendar-${userId}`], revalidate: 300 })();
});
