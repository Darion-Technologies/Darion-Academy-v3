import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateModuleDeadlines, isDeadlineApproaching } from "@/lib/deadlines";
import { sendPushNotification } from "@/lib/push";

// Vercel cron uses GET
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  
  // Verify cron secret if configured
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    // 1. Fetch active enrollments with their deadlines
    const enrollments = await prisma.enrollment.findMany({
      where: {
        status: { in: ["ASSIGNED", "IN_PROGRESS"] },
        deadlineAt: { not: null }
      },
      include: {
        course: {
          include: {
            modules: {
              include: {
                lessons: {
                  select: { estimatedMinutes: true, id: true }
                }
              },
              orderBy: { order: 'asc' }
            }
          }
        },
        learner: {
          select: { id: true, name: true }
        }
      }
    });

    const now = new Date();
    let notificationsSent = 0;

    for (const enrollment of enrollments) {
      if (!enrollment.deadlineAt || !enrollment.course.deadlineDays) continue;

      let notificationSentForThisEnrollment = false;

      // 2. Check Course Deadline
      if (isDeadlineApproaching(enrollment.deadlineAt, 1)) {
        // Course due within 24 hours
        await createNotification(
          enrollment.learner.id,
          "DEADLINE_REMINDER",
          "Course Deadline Approaching!",
          `Your course "${enrollment.course.title}" is due soon. Complete it to avoid losing progress.`,
          `/courses/${enrollment.course.slug}`
        );
        notificationSentForThisEnrollment = true;
      }

      // 3. Check Module Deadlines (if course is not due tomorrow)
      if (!notificationSentForThisEnrollment) {
        const moduleDeadlines = calculateModuleDeadlines(
          enrollment.assignedAt,
          enrollment.course.deadlineDays,
          enrollment.course.modules
        );

        for (const md of moduleDeadlines) {
          if (isDeadlineApproaching(md.deadlineAt, 1)) {
            const module = enrollment.course.modules.find(m => m.id === md.moduleId);
            if (module) {
              await createNotification(
                enrollment.learner.id,
                "DEADLINE_REMINDER",
                "Module Deadline Approaching!",
                `You're falling behind on "${module.title}" in the ${enrollment.course.title} course.`,
                `/courses/${enrollment.course.slug}`
              );
              notificationSentForThisEnrollment = true;
              break; // Only send one module warning at a time
            }
          }
        }
      }

      // 4. Daily Nudge (if no impending deadlines)
      if (!notificationSentForThisEnrollment) {
        // Find if they made progress today
        const recentProgress = await prisma.progress.findFirst({
          where: {
            userId: enrollment.learnerId,
            lesson: { moduleId: { in: enrollment.course.modules.map(m => m.id) } },
            completedAt: { gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) } // Last 24h
          }
        });

        if (!recentProgress) {
          await createNotification(
            enrollment.learner.id,
            "DAILY_NUDGE",
            "Keep up the momentum!",
            `You haven't completed any lessons in "${enrollment.course.title}" today. A little progress each day goes a long way.`,
            `/courses/${enrollment.course.slug}`
          );
        }
      }

      notificationsSent++;
    }

    return NextResponse.json({ success: true, processed: enrollments.length, sent: notificationsSent });

  } catch (error) {
    console.error("Cron Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

async function createNotification(userId: string, type: any, title: string, message: string, href: string) {
  // Save in-app notification
  await prisma.notification.create({
    data: { userId, type, title, message, href }
  });

  // Try to send Web Push
  try {
    await sendPushNotification(userId, { title, body: message, url: href });
  } catch (e) {
    // Ignore push errors (e.g. user not subscribed)
  }
}
