export type CompletionInput = {
  requiredLessonIds: string[];
  completedLessonIds: string[];
  requiredAssignmentIds: string[];
  approvedAssignmentIds: string[];
  requiredQuizIds: string[];
  passedQuizIds: string[];
};

export function calculateCourseProgress(input: CompletionInput) {
  const required = [
    ...input.requiredLessonIds.map((id) => `lesson:${id}`),
    ...input.requiredAssignmentIds.map((id) => `assignment:${id}`),
    ...input.requiredQuizIds.map((id) => `quiz:${id}`),
  ];
  const completed = new Set([
    ...input.completedLessonIds.map((id) => `lesson:${id}`),
    ...input.approvedAssignmentIds.map((id) => `assignment:${id}`),
    ...input.passedQuizIds.map((id) => `quiz:${id}`),
  ]);
  if (!required.length) return 0;
  return Math.round((required.filter((item) => completed.has(item)).length / required.length) * 100);
}

export async function refreshEnrollmentProgress(
  db: typeof import("@/lib/prisma").prisma,
  learnerId: string,
  courseId: string,
) {
  const course = await db.course.findUniqueOrThrow({
    where: { id: courseId },
    include: {
      modules: {
        include: {
          lessons: { include: { assignment: true, quiz: true } },
        },
      },
    },
  });
  const lessons = course.modules.flatMap((module) => module.lessons);
  const [progress, submissions, attempts] = await Promise.all([
    db.progress.findMany({
      where: { userId: learnerId, lessonId: { in: lessons.map((lesson) => lesson.id) }, completed: true },
    }),
    db.submission.findMany({
      where: {
        learnerId,
        assignmentId: { in: lessons.flatMap((lesson) => (lesson.assignment ? [lesson.assignment.id] : [])) },
        status: "APPROVED",
      },
    }),
    db.quizAttempt.findMany({
      where: {
        userId: learnerId,
        quizId: { in: lessons.flatMap((lesson) => (lesson.quiz ? [lesson.quiz.id] : [])) },
        status: "PASSED",
      },
      distinct: ["quizId"],
    }),
  ]);
  const percent = calculateCourseProgress({
    requiredLessonIds: lessons
      .filter((lesson) => lesson.completionRequired && !lesson.assignment && !lesson.quiz)
      .map((lesson) => lesson.id),
    completedLessonIds: progress.map((item) => item.lessonId),
    requiredAssignmentIds: lessons.flatMap((lesson) => (lesson.completionRequired && lesson.assignment ? [lesson.assignment.id] : [])),
    approvedAssignmentIds: submissions.map((item) => item.assignmentId),
    requiredQuizIds: lessons.flatMap((lesson) => (lesson.completionRequired && lesson.quiz ? [lesson.quiz.id] : [])),
    passedQuizIds: attempts.map((item) => item.quizId),
  });
  return db.enrollment.update({
    where: { learnerId_courseId: { learnerId, courseId } },
    data: {
      progressPercent: percent,
      status: percent === 100 ? "AWAITING_APPROVAL" : percent > 0 ? "IN_PROGRESS" : "ASSIGNED",
      startedAt: percent > 0 ? new Date() : undefined,
    },
  });
}
