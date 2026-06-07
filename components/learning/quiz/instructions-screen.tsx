import { ShieldAlert, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type InstructionsScreenProps = {
  quiz: any;
  onStart: () => void;
  isPending: boolean;
};

export function InstructionsScreen({ quiz, onStart, isPending }: InstructionsScreenProps) {
  return (
    <div className="max-w-3xl mx-auto bg-card border border-border shadow-[var(--shadow-md)]">
      {/* Header bar */}
      <div className="bg-sidebar px-8 py-6 text-sidebar-foreground">
        <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#7FC5DD] mb-2">
          Darion Academy — Exam Environment
        </div>
        <h1 className="text-xl font-bold tracking-tight">{quiz.title}</h1>
        <p className="text-sm text-[#7FC5DD] mt-1">
          Please read the following instructions carefully before starting the exam.
        </p>
      </div>

      <div className="p-8 space-y-8">
        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Duration",        value: quiz.timeLimit ? `${quiz.timeLimit} mins` : "No limit" },
            { label: "Questions",       value: quiz.questions?.length ?? 0 },
            { label: "Passing Mark",    value: `${quiz.passMark}%` },
            { label: "Attempts Allowed",value: quiz.maxAttempts ?? "Unlimited" },
          ].map(({ label, value }) => (
            <div key={label} className="bg-muted border border-border p-4 text-center">
              <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">{label}</div>
              <div className="font-bold text-foreground">{value}</div>
            </div>
          ))}
        </div>

        {/* General rules */}
        <div className="space-y-3">
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">General Rules</h3>
          <ul className="space-y-2">
            {[
              "Ensure you have a stable internet connection before starting.",
              "Your progress is auto-saved locally. Do not clear browser data during the exam.",
              ...(quiz.timeLimit ? ["The exam will automatically submit when the timer reaches zero."] : []),
            ].map((rule, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                <CheckCircle2 className="size-4 text-[var(--success)] shrink-0 mt-0.5" />
                {rule}
              </li>
            ))}
          </ul>
        </div>

        {/* Strict proctoring warning */}
        {quiz.isStrict && (
          <div className="flex items-start gap-3 border border-[var(--error)] bg-[var(--error-light)] p-5">
            <ShieldAlert className="size-5 shrink-0 text-[var(--error)] mt-0.5" />
            <div className="space-y-2 text-sm text-[var(--error)]">
              <p className="font-bold">Strict Proctoring is Enabled</p>
              <ul className="list-disc pl-5 space-y-1 text-[13px]">
                <li>You must allow webcam access and remain in frame throughout the exam.</li>
                <li>You must remain in fullscreen mode.</li>
                <li>Do not switch tabs, open new windows, or minimise the browser.</li>
                <li>Copy, paste, and right-click are disabled.</li>
                <li>Violating these rules 3 times will instantly terminate and fail your exam.</li>
              </ul>
            </div>
          </div>
        )}

        {/* Start button */}
        <div className="pt-2 border-t border-border">
          <Button
            size="lg"
            onClick={onStart}
            disabled={isPending}
            className="w-full md:w-auto px-12 text-base font-bold uppercase tracking-wider"
          >
            {isPending ? "Starting Exam..." : "I Understand — Start Exam"}
          </Button>
        </div>
      </div>
    </div>
  );
}
