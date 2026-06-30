import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type QuestionRendererProps = {
  question: any;
  answer: string | string[]; // Can be array for future multi-select
  onAnswerChange: (answer: string | string[]) => void;
};

export function QuestionRenderer({ question, answer, onAnswerChange }: QuestionRendererProps) {
  
  if (question.type === "MULTIPLE_CHOICE") {
    let options: string[] = [];
    if (Array.isArray(question.options)) {
      options = question.options;
    } else if (typeof question.options === 'string') {
      try {
        options = JSON.parse(question.options);
      } catch (e) {
        if (question.options.includes('\n')) {
          options = question.options.split('\n').map((s: string) => s.trim()).filter(Boolean);
        } else {
          options = question.options.split(',').map((s: string) => s.trim()).filter(Boolean);
        }
      }
    }

    return (
      <div className="space-y-3">
        {options.map((option) => {
          const isSelected = answer === option;
          return (
            <label 
              key={option} 
              className={`flex cursor-pointer items-center gap-4 border p-4 text-base transition-all
                ${isSelected 
                  ? "border-slate-800 bg-muted/50 shadow-sm ring-1 ring-slate-800" 
                  : "border-border hover:border-border hover:bg-muted/50/50"
                }`}
            >
              <div className={`flex items-center justify-center w-5 h-5 border shrink-0 transition-colors
                ${isSelected ? "border-slate-800 bg-slate-800" : "border-border bg-card"}`}
              >
                {isSelected && <div className="w-2 h-2 bg-card" />}
              </div>
              <input 
                type="radio" 
                name={`question-${question.id}`} 
                value={option} 
                checked={isSelected}
                onChange={(e) => onAnswerChange(e.target.value)} 
                className="hidden" 
              />
              <span className={isSelected ? "font-medium text-foreground" : "text-foreground"}>
                {option}
              </span>
            </label>
          );
        })}
      </div>
    );
  }

  if (question.type === "TRUE_FALSE") {
    return (
      <div className="flex gap-4">
        {["True", "False"].map((v) => {
          const isSelected = answer === v;
          return (
            <label 
              key={v} 
              className={`flex flex-1 cursor-pointer items-center justify-center gap-3 border p-6 text-lg transition-all
                ${isSelected 
                  ? "border-slate-800 bg-muted/50 shadow-sm ring-1 ring-slate-800 font-semibold text-foreground" 
                  : "border-border hover:border-border hover:bg-muted/50/50 text-foreground font-medium"
                }`}
            >
              <div className={`flex items-center justify-center w-5 h-5 border shrink-0 transition-colors
                ${isSelected ? "border-slate-800 bg-slate-800" : "border-border bg-card"}`}
              >
                {isSelected && <div className="w-2 h-2 bg-card" />}
              </div>
              <input 
                type="radio" 
                name={`question-${question.id}`} 
                value={v} 
                checked={isSelected}
                onChange={(e) => onAnswerChange(e.target.value)} 
                className="hidden" 
              />
              {v}
            </label>
          );
        })}
      </div>
    );
  }

  // Fallback for SHORT_ANSWER or future text-based
  return (
    <div className="space-y-3">
      <Label htmlFor={`question-${question.id}`} className="text-sm font-medium text-foreground">
        Type your answer below
      </Label>
      <Textarea 
        id={`question-${question.id}`}
        name={`question-${question.id}`} 
        value={(answer as string) || ""}
        onChange={(e) => onAnswerChange(e.target.value)}
        placeholder="Enter your answer..."
        className="min-h-[150px] resize-y text-base p-4 focus-visible:ring-slate-800 border-border"
        autoComplete="off" 
        autoCorrect="off" 
        autoCapitalize="off" 
        spellCheck="false" 
      />
    </div>
  );
}
