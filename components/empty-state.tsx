import { BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

export function EmptyState({ title, description, className }: { title: string; description: string, className?: string }) {
  return (
    <div className={cn("animate-in fade-in zoom-in-95 duration-500 relative overflow-hidden rounded-xl border border-dashed border-border/60 bg-card/40 p-10 text-center shadow-[var(--shadow-sm)] transition-all hover:border-primary/30 hover:bg-card/60", className)}>
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="size-32 rounded-full bg-primary/10 blur-3xl animate-pulse" />
      </div>
      <div className="relative z-10 flex flex-col items-center">
        <div className="mb-5 flex size-16 items-center justify-center rounded-full bg-muted/50 ring-1 ring-border/50 animate-bounce duration-3000">
          <BookOpen className="size-8 text-muted-foreground" />
        </div>
        <h3 className="text-base font-semibold tracking-tight text-foreground">{title}</h3>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
