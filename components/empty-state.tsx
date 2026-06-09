import { BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

export function EmptyState({ title, description, className }: { title: string; description: string, className?: string }) {
  return (
    <div className={cn("animate-slide-up-fade relative overflow-hidden rounded-xl border border-dashed border-border/60 bg-card/40 p-10 text-center shadow-[var(--shadow-sm)]", className)}>
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="size-32 rounded-full bg-primary/5 blur-3xl" />
      </div>
      <div className="relative z-10 flex flex-col items-center">
        <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-muted/50 ring-1 ring-border/50">
          <BookOpen className="size-6 text-muted-foreground" />
        </div>
        <h3 className="text-base font-semibold tracking-tight text-foreground">{title}</h3>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
