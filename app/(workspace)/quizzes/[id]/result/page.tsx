import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import {
  Trophy, XCircle, CheckCircle2, Circle, ArrowLeft, RotateCcw, BookOpen,
} from "lucide-react";

export default async function QuizResultPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ attempt?: string }>;
}) {
  const user = await requireRole("EMPLOYEE", "INTERN");
  const { id } = await params;
  const { attempt: attemptId } = await searchParams;
  const attempt = attemptId
    ? await prisma.quizAttempt.findFirst({
        where: { id: attemptId, quizId: id, userId: user.id },
        include: {
          quiz: {
            include: {
              questions: { orderBy: { order: "asc" } },
              lesson: { include: { module: { include: { course: true } } } },
              attempts: { where: { userId: user.id }, select: { id: true } },
            },
          },
          answers: true,
        },
      })
    : null;
  if (!attempt) notFound();

  const isPassed = attempt.status === "PASSED";
  const course = attempt.quiz.lesson.module.course;
  const canRetake = !isPassed && (!attempt.quiz.maxAttempts || attempt.quiz.attempts.length < attempt.quiz.maxAttempts);
  const correctCount = attempt.answers.filter((a) => a.isCorrect).length;

  // Build answer lookup
  const answerMap = new Map(attempt.answers.map((a) => [a.questionId, a]));

  return (
    <div className="mx-auto max-w-2xl space-y-6 pt-6">
      {/* Back link */}
      <Link href={`/courses/${course.slug}`} className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline">
        <ArrowLeft className="size-3.5" />
        Back to {course.title}
      </Link>

      {/* Score card */}
      <Card className={`overflow-hidden ${isPassed ? "border-emerald-200" : "border-red-200"}`}>
        <div className={`px-8 py-10 text-center ${isPassed ? "bg-gradient-to-b from-emerald-50 to-white" : "bg-gradient-to-b from-red-50 to-white"}`}>
          {/* Icon */}
          <div className={`mx-auto mb-4 flex size-16 items-center justify-center rounded-full ${isPassed ? "bg-emerald-100" : "bg-red-100"}`}>
            {isPassed ? (
              <Trophy className="size-8 text-emerald-600" />
            ) : (
              <XCircle className="size-8 text-red-500" />
            )}
          </div>

          {/* Status badge */}
          <Badge variant={isPassed ? "success" : "error"} className="text-sm px-4 py-1">
            {isPassed ? "PASSED" : "FAILED"}
          </Badge>

          {/* Score */}
          <p className="mt-6 text-6xl font-extrabold tracking-tight animate-[count-up_0.5s_ease-out]"
            style={{ color: isPassed ? "#065f46" : "#991b1b" }}
          >
            {attempt.score}%
          </p>

          {/* Details */}
          <p className="mt-2 text-muted-foreground">
            {attempt.earnedPoints} of {attempt.totalPoints} points · {correctCount} of {attempt.quiz.questions.length} correct
          </p>

          <h1 className="mt-6 text-xl font-semibold">{attempt.quiz.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">Pass mark: {attempt.quiz.passMark}%</p>

          {/* Actions */}
          <div className="mt-7 flex justify-center gap-3">
            <Button variant="outline" asChild>
              <Link href={`/courses/${course.slug}`}>
                <BookOpen className="size-4" />
                Back to Course
              </Link>
            </Button>
            {canRetake && (
              <Button asChild>
                <Link href={`/quizzes/${attempt.quizId}`}>
                  <RotateCcw className="size-4" />
                  Try Again
                </Link>
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Answers breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>Answer Review</span>
            <Badge variant="info">{correctCount}/{attempt.quiz.questions.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {attempt.quiz.questions.map((question, index) => {
            const answer = answerMap.get(question.id);
            const isCorrect = answer?.isCorrect ?? false;

            return (
              <div
                key={question.id}
                className={`rounded-xl border p-4 ${
                  isCorrect ? "border-emerald-200 bg-emerald-50/50" : "border-red-200 bg-red-50/50"
                }`}
              >
                <div className="flex items-start gap-3">
                  {isCorrect ? (
                    <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-500" />
                  ) : (
                    <Circle className="mt-0.5 size-5 shrink-0 text-red-400" />
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {index + 1}. {question.prompt}
                      <span className="ml-2 text-xs font-normal text-muted-foreground">({question.points} pt{question.points > 1 ? "s" : ""})</span>
                    </p>

                    <div className="mt-2 space-y-1 text-sm">
                      {answer && (
                        <p className={isCorrect ? "text-emerald-700" : "text-red-700"}>
                          <span className="font-medium">Your answer:</span> {answer.answer || "(no answer)"}
                        </p>
                      )}
                      {!isCorrect && (
                        <p className="text-emerald-700">
                          <span className="font-medium">Correct answer:</span> {question.correctAnswer}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
