export function normalizeAnswer(answer: string) {
  return answer.trim().toLocaleLowerCase().replace(/\s+/g, " ");
}

export type ScorableQuestion = {
  id: string;
  correctAnswer: string;
  points: number;
};

export function scoreQuiz(
  questions: ScorableQuestion[],
  answers: Record<string, string>,
  passMark: number,
) {
  const graded = questions.map((question) => {
    const answer = answers[question.id] ?? "";
    const isCorrect = normalizeAnswer(answer) === normalizeAnswer(question.correctAnswer);
    return { questionId: question.id, answer, isCorrect, pointsEarned: isCorrect ? question.points : 0 };
  });
  const totalPoints = questions.reduce((sum, question) => sum + question.points, 0);
  const earnedPoints = graded.reduce((sum, answer) => sum + answer.pointsEarned, 0);
  const score = totalPoints ? Math.round((earnedPoints / totalPoints) * 100) : 0;
  return { graded, totalPoints, earnedPoints, score, passed: score >= passMark };
}
