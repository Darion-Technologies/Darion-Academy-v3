import { QuestionStatus } from "./quiz-types";
import { Check, Flag } from "lucide-react";

type QuestionNavigatorProps = {
  questions: any[];
  statuses: Record<string, QuestionStatus>;
  currentIndex: number;
  onNavigate: (index: number) => void;
};

export function QuestionNavigator({
  questions,
  statuses,
  currentIndex,
  onNavigate,
}: QuestionNavigatorProps) {

  const stats = { answered: 0, marked: 0, notVisited: 0, visited: 0 };
  questions.forEach((q) => {
    const s = statuses[q.id] || "not_visited";
    if (s === "answered" || s === "answered_and_marked") stats.answered++;
    if (s === "marked_for_review" || s === "answered_and_marked") stats.marked++;
    if (s === "not_visited") stats.notVisited++;
    if (s === "visited") stats.visited++;
  });

  const getButtonClass = (status: QuestionStatus, isCurrent: boolean): string => {
    let base = "relative flex items-center justify-center w-9 h-9 text-[11px] font-bold transition-all border ";
    if (isCurrent) base += "ring-2 ring-offset-1 ring-[#008CBB] z-10 scale-110 shadow-md ";

    switch (status) {
      case "answered":           return base + "bg-[var(--success-light)] text-[var(--success)] border-[var(--success)]";
      case "marked_for_review":  return base + "bg-[var(--warning-light)] text-[var(--warning)] border-[var(--warning)]";
      case "answered_and_marked":return base + "bg-[var(--info-light)] text-[var(--info)] border-primary";
      case "visited":            return base + "bg-muted text-muted-foreground border-border";
      default:                   return base + "bg-card text-muted-foreground border-border hover:bg-background";
    }
  };

  const getStatusIcon = (status: QuestionStatus) => {
    if (status === "answered" || status === "answered_and_marked") {
      return (
        <Check className="w-2.5 h-2.5 absolute -bottom-1 -right-1 bg-[var(--success)] text-white p-[1px]" />
      );
    }
    if (status === "marked_for_review") {
      return <Flag className="w-2.5 h-2.5 absolute -top-1 -right-1 text-[var(--warning)] fill-[#B99A5F]" />;
    }
    return null;
  };

  return (
    <div className="bg-card border border-border flex flex-col h-full max-h-[calc(100vh-140px)] sticky top-24 shadow-[var(--shadow-sm)]">
      {/* Stats legend */}
      <div className="p-4 border-b border-border">
        <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-3">
          Question Navigator
        </h3>
        <div className="grid grid-cols-2 gap-2 text-[10px] font-bold uppercase tracking-wider">
          <div className="flex items-center gap-1.5 text-[var(--success)] bg-[var(--success-light)] border border-[#B8D8CC] p-2">
            <span className="w-2 h-2 bg-[var(--success)]" /> Answered ({stats.answered})
          </div>
          <div className="flex items-center gap-1.5 text-[var(--warning)] bg-[var(--warning-light)] border border-[#D9C070] p-2">
            <span className="w-2 h-2 bg-[var(--warning)]" /> Marked ({stats.marked})
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground bg-muted border border-border p-2">
            <span className="w-2 h-2 bg-[#D9E3E7]" /> Not Answered ({stats.visited})
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground bg-card border border-border p-2">
            <span className="w-2 h-2 bg-card border border-border" /> Not Visited ({stats.notVisited})
          </div>
        </div>
      </div>

      {/* Question grid */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-5 gap-2">
          {questions.map((q, index) => {
            const status = statuses[q.id] || "not_visited";
            const isCurrent = index === currentIndex;
            return (
              <button
                key={q.id}
                onClick={() => onNavigate(index)}
                className={getButtonClass(status, isCurrent)}
                aria-label={`Question ${index + 1}`}
                title={`Q${index + 1} — ${status.replace(/_/g, " ")}`}
              >
                {index + 1}
                {getStatusIcon(status)}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
