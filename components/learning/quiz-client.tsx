"use client";

import { useState, useEffect, useRef, useTransition, useCallback } from "react";
import { AlertCircle, ShieldAlert, Loader2, ChevronRight, ChevronLeft, Flag, Eraser } from "lucide-react";
import { Button } from "@/components/ui/button";
import { startQuizAction, submitQuizAction } from "@/app/actions/learning";
import { useProctoring } from "./use-proctoring";
import { QuizState, AnswersMap, QuestionStatusesMap, QuestionStatus } from "./quiz/quiz-types";
import { InstructionsScreen } from "./quiz/instructions-screen";
import { ExamHeader } from "./quiz/exam-header";
import { QuestionNavigator } from "./quiz/question-navigator";
import { QuestionRenderer } from "./quiz/question-renderer";
import { SubmitConfirmation } from "./quiz/submit-confirmation";

type QuizProps = {
  quiz: any;
  canAttempt: boolean;
};

export function QuizClient({ quiz, canAttempt }: QuizProps) {
  const [examState, setExamState]   = useState<QuizState>("instructions");
  const [attemptId, setAttemptId]   = useState<string | null>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers]   = useState<AnswersMap>({});
  const [statuses, setStatuses] = useState<QuestionStatusesMap>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(quiz.timeLimit ? quiz.timeLimit * 60 : null);

  const [isPending, startTransition] = useTransition();
  const [modelLoaded, setModelLoaded] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const { warnings, isTerminated, warningMessage, dismissWarning, startProctoring, issueWarning } =
    useProctoring(quiz.isStrict, 3);

  const LOCAL_STORAGE_KEY = `quiz_draft_${quiz.id}`;

  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.answers) setAnswers(parsed.answers);
        if (parsed.statuses) setStatuses(parsed.statuses);
        if (parsed.timeLeft !== undefined && parsed.timeLeft !== null && examState === "in_progress") {
          setTimeLeft(parsed.timeLeft);
        }
      }
    } catch (e) {
      console.error("Failed to parse saved quiz data", e);
    }
  }, [LOCAL_STORAGE_KEY, examState]);

  useEffect(() => {
    if (examState === "in_progress" || examState === "instructions") {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ answers, statuses, timeLeft }));
    }
  }, [answers, statuses, timeLeft, examState, LOCAL_STORAGE_KEY]);

  const handleStart = () => {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("quizId", quiz.id);
      const res = await startQuizAction(formData);
      if (res.attemptId) {
        setAttemptId(res.attemptId);
        setExamState("in_progress");
        startProctoring();
        const firstId = quiz.questions[0]?.id;
        if (firstId && !statuses[firstId]) updateStatus(firstId, "visited");
      }
    });
  };

  const updateStatus = useCallback((qId: string, newStatus: QuestionStatus) => {
    setStatuses((prev) => {
      const current = prev[qId] || "not_visited";
      if ((current === "answered" || current === "answered_and_marked") && newStatus === "visited") return prev;
      return { ...prev, [qId]: newStatus };
    });
  }, []);

  const handleAnswerChange = (qId: string, answer: string | string[]) => {
    setAnswers((prev) => ({ ...prev, [qId]: answer as string }));
    const currentStatus = statuses[qId];
    if (currentStatus === "marked_for_review") updateStatus(qId, "answered_and_marked");
    else updateStatus(qId, "answered");
  };

  const handleClearAnswer = (qId: string) => {
    setAnswers((prev) => { const next = { ...prev }; delete next[qId]; return next; });
    const currentStatus = statuses[qId];
    if (currentStatus === "answered_and_marked") updateStatus(qId, "marked_for_review");
    else updateStatus(qId, "visited");
  };

  const handleToggleMark = (qId: string) => {
    const currentStatus = statuses[qId] || "not_visited";
    if      (currentStatus === "answered")           updateStatus(qId, "answered_and_marked");
    else if (currentStatus === "answered_and_marked") updateStatus(qId, "answered");
    else if (currentStatus === "marked_for_review")  updateStatus(qId, "visited");
    else                                             updateStatus(qId, "marked_for_review");
  };

  const handleNavigate = (index: number) => {
    if (index >= 0 && index < quiz.questions.length) {
      setCurrentIndex(index);
      const nextId = quiz.questions[index].id;
      if (!statuses[nextId]) updateStatus(nextId, "visited");
    }
  };

  // Timer
  useEffect(() => {
    const isTimerActive = examState === "in_progress" && (!quiz.isStrict || modelLoaded) && !isTerminated;
    if (!isTimerActive || timeLeft === null) return;
    if (timeLeft <= 0) {
      setExamState("submitting");
      if (formRef.current) formRef.current.requestSubmit();
      return;
    }
    const timer = setInterval(() => setTimeLeft((prev) => (prev !== null ? prev - 1 : null)), 1000);
    return () => clearInterval(timer);
  }, [examState, modelLoaded, quiz.isStrict, timeLeft, isTerminated]);

  // Auto-submit on termination
  useEffect(() => {
    if (isTerminated && formRef.current && examState !== "submitted") {
      setExamState("submitting");
      formRef.current.requestSubmit();
    }
  }, [isTerminated, examState]);

  // Hide LMS chrome while quiz is active
  useEffect(() => {
    if (examState === "in_progress") document.body.classList.add("quiz-active");
    else document.body.classList.remove("quiz-active");
    return () => document.body.classList.remove("quiz-active");
  }, [examState]);

  const handleSubmitInit    = () => setExamState("submitting");
  const handleSubmitCancel  = () => setExamState("in_progress");
  const handleSubmitConfirm = () => {
    startTransition(() => {
      if (formRef.current) {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        formRef.current.requestSubmit();
        setExamState("submitted");
      }
    });
  };

  // ── Not eligible ──
  if (!canAttempt) {
    return (
      <div className="flex items-center gap-3 p-5 bg-[var(--warning-light)] border border-[var(--warning)]">
        <AlertCircle className="size-5 text-[var(--warning)] shrink-0" />
        <p className="text-sm text-[var(--warning)] font-semibold">
          You have reached the maximum number of attempts for this quiz.
        </p>
      </div>
    );
  }

  // ── Instructions ──
  if (examState === "instructions") {
    return <InstructionsScreen quiz={quiz} onStart={handleStart} isPending={isPending} />;
  }

  const currentQ = quiz.questions[currentIndex];
  const isFirst  = currentIndex === 0;
  const isLast   = currentIndex === quiz.questions.length - 1;

  // ── Exam in progress ──
  return (
    <div className="min-h-screen bg-background pb-20">
      <ExamHeader
        title={quiz.title}
        isStrict={quiz.isStrict}
        timeLeft={timeLeft}
        warnings={warnings}
        currentQuestion={currentIndex + 1}
        totalQuestions={quiz.questions.length}
        onWarning={issueWarning}
        onModelLoaded={() => setModelLoaded(true)}
        onCameraDenied={(err) => setCameraError(err || "Access Denied")}
      />

      <div className="max-w-[1600px] mx-auto px-4 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Navigator — left */}
        <div className="lg:col-span-1 order-2 lg:order-1 hidden md:block">
          <QuestionNavigator
            questions={quiz.questions}
            statuses={statuses}
            currentIndex={currentIndex}
            onNavigate={handleNavigate}
          />
        </div>

        {/* Question area — right */}
        <div className="lg:col-span-3 order-1 lg:order-2 space-y-4">
          <div className="bg-card border border-border shadow-[var(--shadow-sm)] min-h-[400px] flex flex-col">

            {/* Question header */}
            <div className="bg-card border-b border-border px-6 py-5">
              <div className="flex items-start justify-between gap-4">
                <div className="text-base font-semibold text-foreground leading-relaxed">
                  <span className="text-muted-foreground mr-2">{currentIndex + 1}.</span>
                  {currentQ.prompt}
                </div>
                <div className="bg-muted border border-border text-foreground px-3 py-1 text-xs font-bold uppercase tracking-wider shrink-0">
                  {currentQ.points} {currentQ.points === 1 ? "Mark" : "Marks"}
                </div>
              </div>
            </div>

            {/* Question content */}
            <div className="px-6 py-5 flex-1 bg-background/50">
              <QuestionRenderer
                question={currentQ}
                answer={answers[currentQ.id]}
                onAnswerChange={(val) => handleAnswerChange(currentQ.id, val)}
              />
            </div>

            {/* Action bar */}
            <div className="bg-card border-t border-border px-6 py-4 flex flex-wrap items-center justify-between gap-3">
              {/* Left: Mark / Clear */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleToggleMark(currentQ.id)}
                  className={
                    statuses[currentQ.id] === "marked_for_review" ||
                    statuses[currentQ.id] === "answered_and_marked"
                      ? "border-[var(--warning)] text-[var(--warning)] bg-[var(--warning-light)]"
                      : ""
                  }
                >
                  <Flag
                    className={`w-3.5 h-3.5 mr-1 ${
                      statuses[currentQ.id] === "marked_for_review" ||
                      statuses[currentQ.id] === "answered_and_marked"
                        ? "fill-[#B99A5F] text-[var(--warning)]"
                        : ""
                    }`}
                  />
                  Mark for Review
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleClearAnswer(currentQ.id)}
                  disabled={!answers[currentQ.id]}
                  className="text-muted-foreground hover:text-[var(--error)] hidden sm:flex"
                >
                  <Eraser className="w-3.5 h-3.5 mr-1" />
                  Clear
                </Button>
              </div>

              {/* Right: Navigation */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isFirst}
                  onClick={() => handleNavigate(currentIndex - 1)}
                >
                  <ChevronLeft className="w-3.5 h-3.5 mr-0.5" /> Prev
                </Button>
                {!isLast ? (
                  <button
                    onClick={() => handleNavigate(currentIndex + 1)}
                    className="h-8 px-4 bg-[#071117] text-white text-sm font-bold hover:bg-primary transition-colors flex items-center gap-1"
                  >
                    Save & Next <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                  </button>
                ) : (
                  <button
                    onClick={handleSubmitInit}
                    className="h-8 px-4 bg-[var(--success)] text-white text-sm font-bold hover:bg-[#1E4138] transition-colors flex items-center gap-1"
                  >
                    Submit Exam
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Mobile navigator trigger */}
          <div className="fixed inset-x-0 bottom-0 z-40 bg-card border-t border-border p-3 md:hidden shadow-[0_-2px_8px_rgba(7,17,23,0.06)]">
            <Button variant="outline" className="w-full font-bold uppercase tracking-wider text-xs" onClick={() => setMobileNavOpen(true)}>
              Question Navigator ({currentIndex + 1} / {quiz.questions.length})
            </Button>
          </div>

          {/* Mobile navigator overlay */}
          {mobileNavOpen && (
            <div className="fixed inset-0 z-50 flex flex-col justify-end md:hidden">
              <div className="absolute inset-0 bg-[#071117]/60" onClick={() => setMobileNavOpen(false)} />
              <div className="relative bg-card max-h-[70vh] flex flex-col">
                <div className="p-4 border-b border-border flex justify-between items-center bg-muted">
                  <span className="font-bold text-sm text-foreground uppercase tracking-wider">Jump to Question</span>
                  <Button variant="ghost" size="sm" onClick={() => setMobileNavOpen(false)}>Close</Button>
                </div>
                <div className="p-4 overflow-y-auto pb-8">
                  <QuestionNavigator
                    questions={quiz.questions}
                    statuses={statuses}
                    currentIndex={currentIndex}
                    onNavigate={(i) => { handleNavigate(i); setMobileNavOpen(false); }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Submit confirmation overlay */}
      {examState === "submitting" && (
        <SubmitConfirmation
          questions={quiz.questions}
          statuses={statuses}
          onConfirm={handleSubmitConfirm}
          onCancel={handleSubmitCancel}
          isPending={isPending}
        />
      )}

      {/* Camera error overlay */}
      {cameraError && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#071117]/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-card border border-border shadow-[var(--shadow-lg)]">
            <div className="bg-[var(--error-light)] border-b border-border px-5 py-4 flex items-center gap-2">
              <ShieldAlert className="size-5 text-[var(--error)]" />
              <span className="font-bold text-[var(--error)]">Camera Hardware Error</span>
            </div>
            <div className="p-6 space-y-4 text-center">
              <p className="text-muted-foreground text-sm">
                Strict mode cannot start because your camera hardware failed to initialise.
              </p>
              <div className="bg-muted border border-border p-3 text-xs font-mono text-[var(--error)] text-left overflow-hidden">
                Error: {cameraError}
              </div>
              <p className="text-xs text-muted-foreground">
                Ensure no other apps are using the camera, reconnect it, and try again.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Proctoring warning overlay */}
      {warningMessage && !cameraError && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#071117]/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-card border border-border shadow-[var(--shadow-lg)]">
            <div className="bg-[var(--error-light)] border-b border-border px-5 py-4 flex items-center gap-2">
              <ShieldAlert className="size-5 text-[var(--error)]" />
              <span className="font-bold text-[var(--error)]">Policy Violation Detected</span>
            </div>
            <div className="p-6 space-y-4 text-center">
              <p className="text-muted-foreground text-sm">{warningMessage}</p>
              {!isTerminated && (
                <p className="text-sm font-bold text-[var(--error)]">
                  Warning {warnings} of 3. You will be failed at 3 warnings.
                </p>
              )}
              {!isTerminated && (
                <button
                  onClick={dismissWarning}
                  className="w-full h-10 bg-[var(--error)] text-white font-bold text-sm hover:bg-[#6E2E2C] transition-colors"
                >
                  I understand, return to exam
                </button>
              )}
              {isTerminated && (
                <p className="text-sm font-bold text-[var(--error)] animate-pulse">
                  Submitting exam automatically...
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* AI proctoring loading overlay */}
      {quiz.isStrict && !modelLoaded && !cameraError && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#071117]/80 backdrop-blur-sm p-4">
          <div className="bg-card border border-border p-10 shadow-[var(--shadow-lg)] text-center space-y-4 max-w-sm w-full">
            <Loader2 className="mx-auto size-10 animate-spin text-primary" />
            <p className="text-lg font-bold text-foreground">Initialising AI Proctoring</p>
            <p className="text-sm text-muted-foreground max-w-[260px] mx-auto">
              Please wait while we secure your exam environment. The timer has not started yet.
            </p>
          </div>
        </div>
      )}

      {/* Hidden form for server action submission */}
      <form ref={formRef} action={submitQuizAction} className="hidden">
        <input type="hidden" name="quizId"    value={quiz.id} />
        <input type="hidden" name="attemptId" value={attemptId ?? ""} />
        <input type="hidden" name="warnings"  value={warnings} />
        {quiz.questions.map((q: any) => (
          <input key={q.id} type="hidden" name={`question-${q.id}`} value={answers[q.id] || ""} />
        ))}
      </form>
    </div>
  );
}
