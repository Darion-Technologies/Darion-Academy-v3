import { BookOpen } from "lucide-react";

export function EmptyState({ title, description }: { title: string; description: string }) {
  return <div className="rounded-lg border border-dashed bg-card p-10 text-center"><BookOpen className="mx-auto mb-3 size-8 text-muted-foreground" /><h3 className="font-semibold">{title}</h3><p className="mt-1 text-sm text-muted-foreground">{description}</p></div>;
}
