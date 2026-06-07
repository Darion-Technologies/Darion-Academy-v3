import { AlertTriangle, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QuestionStatus } from "./quiz-types";

type SubmitConfirmationProps = {
  questions: any[];
  statuses: Record<string, QuestionStatus>;
  onConfirm: () => void;
  onCancel: () => void;
  isPending: boolean;
};

export function SubmitConfirmation({
  questions,
  statuses,
  onConfirm,
  onCancel,
  isPending,
}: SubmitConfirmationProps) {
  let answered   = 0;
  let marked     = 0;
  let notAnswered = 0;

  questions.forEach((q) => {
    const s = statuses[q.id] || "not_visited";
    if (s === "answered" || s === "answered_and_marked") answered++;
    if (s === "marked_for_review" || s === "answered_and_marked") marked++;
    if (s === "not_visited" || s === "visited" || s === "marked_for_review") notAnswered++;
  });

  const allAnswered = notAnswered === 0;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#071117]/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-card border border-border shadow-[var(--shadow-lg)]">

        {/* Header */}
        <div className={`px-6 py-5 border-b border-border flex items-center gap-3 ${
          allAnswered ? "bg-[var(--success-light)]" : "bg-[var(--warning-light)]"
        }`}>
          {allAnswered ? (
            <CheckCircle className="size-5 text-[var(--success)] shrink-0" />
          ) : (
            <AlertTriangle className="size-5 text-[var(--warning)] shrink-0" />
          )}
          <div>
            <h2 className="font-bold text-foreground">Submit Final Answers?</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              You cannot change your answers after submission.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="p-6 space-y-6">
          <div className="bg-muted border border-border divide-y divide-[#D9E3E7]">
            <div className="flex justify-between items-center px-4 py-3">
              <span className="text-sm font-semibold text-muted-foreground">Total Questions</span>
              <span className="font-bold text-foreground">{questions.length}</span>
            </div>
            <div className="flex justify-between items-center px-4 py-3">
              <span className="text-sm font-semibold text-[var(--success)]">Answered</span>
              <span className="font-bold text-[var(--success)]">{answered}</span>
            </div>
            <div className="flex justify-between items-center px-4 py-3">
              <span className="text-sm font-semibold text-[var(--warning)]">Marked for Review</span>
              <span className="font-bold text-[var(--warning)]">{marked}</span>
            </div>
            {notAnswered > 0 && (
              <div className="flex justify-between items-center px-4 py-3 bg-[var(--error-light)]">
                <span className="text-sm font-bold text-[var(--error)] flex items-center gap-1.5">
                  <AlertTriangle className="size-4" /> Not Answered
                </span>
                <span className="font-bold text-[var(--error)]">{notAnswered}</span>
              </div>
            )}
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-3">
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={isPending}
              className="flex-1"
            >
              Back to Exam
            </Button>
            <button
              onClick={onConfirm}
              disabled={isPending}
              className={`flex-1 h-10 px-4 text-sm font-bold uppercase tracking-wider text-white transition-colors flex items-center justify-center gap-2 ${
                notAnswered > 0
                  ? "bg-[var(--warning)] hover:bg-[#8C6A3F]"
                  : "bg-primary hover:bg-[#006A8E]"
              } disabled:opacity-50`}
            >
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Confirm Submit"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
