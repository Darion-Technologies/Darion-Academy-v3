import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '../../auth-utils';
import { calculateModuleDeadlines } from '@/lib/deadlines';
import { createSignedUrl } from '@/lib/storage';

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const params = await props.params;
    const courseId = params.id;

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        modules: {
          include: {
            lessons: {
              include: { assignment: { select: { id: true, allowFile: true, allowLink: true, allowText: true } }, quiz: { select: { id: true } } },
              orderBy: { order: "asc" },
            },
          },
          orderBy: { order: "asc" },
        },
      },
    });

    if (!course) return NextResponse.json({ error: 'Course not found' }, { status: 404 });

    const enrollment = await prisma.enrollment.findUnique({
      where: { learnerId_courseId: { learnerId: user.id, courseId: course.id } },
      include: { certificates: { where: { status: "GENERATED" }, take: 1, select: { id: true } } },
    });

    if (!enrollment && user.role !== "ADMIN" && !(user.role === "MENTOR" && (await prisma.enrollment.findFirst({ where: { courseId: course.id, mentorId: user.id } })))) {
      return NextResponse.json({ error: 'Not enrolled' }, { status: 403 });
    }

    const isLearner = Boolean(enrollment);

    const [completedRecords, submissions, quizAttempts] = await Promise.all([
      isLearner ? prisma.progress.findMany({
        where: { userId: user.id, completed: true, lesson: { module: { courseId: course.id } } },
        select: { lessonId: true },
      }) : Promise.resolve([]),
      isLearner ? prisma.submission.findMany({
        where: { learnerId: user.id, assignment: { lesson: { module: { courseId: course.id } } } },
        select: { assignmentId: true, status: true },
      }) : Promise.resolve([]),
      isLearner ? prisma.quizAttempt.findMany({
        where: { userId: user.id, quiz: { lesson: { module: { courseId: course.id } } } },
        select: { quizId: true, status: true },
        orderBy: { submittedAt: "desc" },
      }) : Promise.resolve([]),
    ]);

    const completedLessonIds = new Set(completedRecords.map((p) => p.lessonId));
    const submissionMap = new Map(submissions.map((s) => [s.assignmentId, s.status]));
    const quizResultMap = new Map<string, string>();
    for (const a of quizAttempts) {
      if (!quizResultMap.has(a.quizId) || a.status === "PASSED") {
        quizResultMap.set(a.quizId, a.status);
      }
    }

    const moduleCompletionMap: Record<string, boolean> = {};
    for (const mod of course.modules) {
      let allComplete = true;
      for (const l of mod.lessons) {
        if (l.quiz && quizResultMap.get(l.quiz.id) !== "PASSED") allComplete = false;
        else if (l.assignment && submissionMap.get(l.assignment.id) !== "APPROVED") allComplete = false;
        else if (!l.quiz && !l.assignment && !completedLessonIds.has(l.id)) allComplete = false;
      }
      moduleCompletionMap[mod.id] = allComplete;
    }

    const moduleDeadlines = enrollment && course.deadlineDays 
      ? calculateModuleDeadlines(enrollment.assignedAt, course.deadlineDays, course.modules) 
      : [];
    const moduleDeadlineMap: Record<string, string> = {};
    for (const md of moduleDeadlines) {
      moduleDeadlineMap[md.moduleId] = md.deadlineAt.toISOString();
    }

    // Attach signed URL for thumbnail
    let signedThumbnail = null;
    if (course.thumbnailUrl) {
      try {
        signedThumbnail = await createSignedUrl('course-files', course.thumbnailUrl, 3600);
      } catch (e) {}
    }

    const responseData = {
      course: {
        id: course.id,
        title: course.title,
        slug: course.slug,
        description: course.description,
        difficulty: course.difficulty,
        estimatedMinutes: course.estimatedMinutes,
        thumbnailUrl: signedThumbnail,
        modules: course.modules.map(m => ({
          id: m.id,
          title: m.title,
          description: m.description,
          order: m.order,
          lessons: m.lessons.map(l => ({
            id: l.id,
            title: l.title,
            order: l.order,
            type: l.type,
            estimatedMinutes: l.estimatedMinutes,
            hasQuiz: !!l.quiz,
            hasAssignment: !!l.assignment,
            quizStatus: l.quiz ? quizResultMap.get(l.quiz.id) || null : null,
            assignmentStatus: l.assignment ? submissionMap.get(l.assignment.id) || null : null,
            isCompleted: l.quiz 
              ? quizResultMap.get(l.quiz.id) === "PASSED" 
              : l.assignment 
                ? submissionMap.get(l.assignment.id) === "APPROVED" 
                : completedLessonIds.has(l.id),
          }))
        })),
      },
      enrollment: enrollment ? {
        progressPercent: enrollment.progressPercent,
        isCompleted: enrollment.progressPercent === 100,
        hasCertificate: (enrollment.certificates?.length ?? 0) > 0,
      } : null,
      moduleCompletionMap,
      moduleDeadlineMap,
      isLearner
    };

    return NextResponse.json(responseData);
  } catch (error: any) {
    console.error('Error fetching course details:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
