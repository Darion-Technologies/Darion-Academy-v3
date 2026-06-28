import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '../../auth-utils';
import { createSignedUrl } from '@/lib/storage';
import { getYouTubeVideoId } from '@/lib/youtube';

async function withDbRetry<T>(fn: () => Promise<T>, retries = 2): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    const isPoolerError =
      error?.message?.includes("Can't reach database") ||
      error?.message?.includes("connect ETIMEDOUT") ||
      error?.code === 'P1001';
    if (isPoolerError && retries > 0) {
      await new Promise(r => setTimeout(r, 400));
      return withDbRetry(fn, retries - 1);
    }
    throw error;
  }
}


export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const params = await props.params;
    const lessonId = params.id;

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { 
        module: { include: { course: true } }, 
        assignment: true, 
        quiz: true,
        videoProgress: { where: { userId: user.id } },
        videoNotes: { where: { userId: user.id }, orderBy: { timestamp: "asc" } }
      },
    });

    if (!lesson) return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });

    const enrollment = await prisma.enrollment.findUnique({
      where: { learnerId_courseId: { learnerId: user.id, courseId: lesson.module.courseId } },
    });

    const mentorAccess = user.role === "MENTOR"
      ? await prisma.enrollment.findFirst({ where: { mentorId: user.id, courseId: lesson.module.courseId }, select: { id: true } })
      : null;

    if (!enrollment && user.role !== "ADMIN" && !mentorAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const isLearner = Boolean(enrollment);

    // Module lock check - verify previous module is completed
    let isLocked = false;
    if (isLearner && lesson.module.order > 1) {
      const prevModule = await prisma.module.findFirst({
        where: { courseId: lesson.module.courseId, order: lesson.module.order - 1 },
        include: { lessons: { include: { assignment: true, quiz: true } } },
      });
      if (prevModule) {
        const prevLessonIds = prevModule.lessons.map((l) => l.id);
        const [progress, submissions, quizAttempts] = await withDbRetry(() => Promise.all([
          prisma.progress.findMany({ where: { userId: user.id, lessonId: { in: prevLessonIds }, completed: true } }),
          prisma.submission.findMany({ where: { learnerId: user.id, assignment: { lessonId: { in: prevLessonIds } } } }),
          prisma.quizAttempt.findMany({ where: { userId: user.id, quiz: { lessonId: { in: prevLessonIds } } } })
        ]));

        const completedIds = new Set(progress.map(p => p.lessonId));
        const submissionMap = new Map(submissions.map(s => [s.assignmentId, s.status]));
        const quizMap = new Map(quizAttempts.map(q => [q.quizId, q.status]));

        let allCompleted = true;
        for (const l of prevModule.lessons) {
          if (l.quiz && quizMap.get(l.quiz.id) !== "PASSED") allCompleted = false;
          else if (l.assignment && submissionMap.get(l.assignment.id) !== "APPROVED") allCompleted = false;
          else if (!l.quiz && !l.assignment && !completedIds.has(l.id)) allCompleted = false;
        }

        if (!allCompleted) {
          isLocked = true;
        }
      }
    }

    if (isLocked) {
      return NextResponse.json({ error: 'Module locked' }, { status: 403 });
    }

    const submission = lesson.assignment
      ? await prisma.submission.findUnique({
          where: { assignmentId_learnerId: { assignmentId: lesson.assignment.id, learnerId: user.id } },
          include: { feedback: { include: { author: true } } },
        })
      : null;

    let lessonFileUrl = null;
    if (lesson.fileUrl) {
      try {
        lessonFileUrl = await createSignedUrl("lesson-files", lesson.fileUrl);
      } catch (e) {}
    }

    const youtubeVideoId = lesson.videoUrl ? getYouTubeVideoId(lesson.videoUrl) : null;
    const canComplete = isLearner;

    // Find next and previous lessons
    let nextLessonId: string | null = null;
    const nextLessonInModule = await prisma.lesson.findFirst({
      where: { moduleId: lesson.moduleId, order: { gt: lesson.order } },
      orderBy: { order: "asc" }
    });
    if (nextLessonInModule) {
      nextLessonId = nextLessonInModule.id;
    } else {
      const nextModule = await prisma.module.findFirst({
        where: { courseId: lesson.module.courseId, order: { gt: lesson.module.order } },
        orderBy: { order: "asc" },
        include: { lessons: { orderBy: { order: "asc" }, take: 1 } }
      });
      if (nextModule && nextModule.lessons.length > 0) {
        nextLessonId = nextModule.lessons[0].id;
      }
    }

    let prevLessonId: string | null = null;
    const prevLessonInModule = await prisma.lesson.findFirst({
      where: { moduleId: lesson.moduleId, order: { lt: lesson.order } },
      orderBy: { order: "desc" }
    });
    if (prevLessonInModule) {
      prevLessonId = prevLessonInModule.id;
    } else {
      const prevModule = await prisma.module.findFirst({
        where: { courseId: lesson.module.courseId, order: { lt: lesson.module.order } },
        orderBy: { order: "desc" },
        include: { lessons: { orderBy: { order: "desc" }, take: 1 } }
      });
      if (prevModule && prevModule.lessons.length > 0) {
        prevLessonId = prevModule.lessons[0].id;
      }
    }

    const existingProgress = canComplete
      ? await prisma.progress.findUnique({ where: { userId_lessonId: { userId: user.id, lessonId: lesson.id } } })
      : null;

    return NextResponse.json({
      lesson: {
        id: lesson.id,
        title: lesson.title,
        type: lesson.type,
        content: lesson.content,
        externalUrl: lesson.externalUrl,
        videoUrl: lesson.videoUrl,
        youtubeVideoId,
        videoStartTime: lesson.videoStartTime,
        videoEndTime: lesson.videoEndTime,
        estimatedMinutes: lesson.estimatedMinutes,
        assignment: lesson.assignment,
        quiz: lesson.quiz,
        module: {
          id: lesson.module.id,
          title: lesson.module.title,
          course: {
            id: lesson.module.course.id,
            title: lesson.module.course.title,
          }
        },
        videoNotes: lesson.videoNotes,
      },
      lessonFileUrl,
      submission,
      isLearner,
      canComplete,
      existingProgress,
      videoProgress: lesson.videoProgress?.[0] || null,
      nextLessonId,
      prevLessonId,
      mentorAccess: !!mentorAccess
    });
  } catch (error: any) {
    console.error('Error fetching lesson:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
