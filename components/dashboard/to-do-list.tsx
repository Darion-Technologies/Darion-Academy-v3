import Link from "next/link";
import { CheckSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { PendingAction } from "@/lib/dashboard-data";

function getActionHref(action: PendingAction): string {
  if (action.type === "quiz" && action.quizId) return `/quizzes/${action.quizId}`;
  if (action.lessonId) return `/lessons/${action.lessonId}`;
  return `/courses/${action.courseSlug}`;
}

export function ToDoList({ actions }: { actions: PendingAction[] }) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="mb-1 flex flex-row items-center justify-between border-b">
        <CardTitle>
          Action Items
        </CardTitle>
        <div className="rounded-md border bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
          Priority
        </div>
      </CardHeader>

      <CardContent className="px-2 pb-2 sm:px-3 sm:pb-3 space-y-0 flex-1">
        {actions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CheckSquare className="size-8 text-muted-foreground/50" />
            <p className="mt-3 text-sm text-muted-foreground">
              All assignments complete
            </p>
          </div>
        ) : (
          actions.slice(0, 5).map((action) => {
            const isWaiting = action.status === "Waiting for approval";
            let badgeVariant: "neutral" | "error" | "warning" | "success" | "info" = "neutral";
            let badgeText = action.status;

            if (action.priority === "high") {
              badgeVariant = "error";
              if (action.status === "To do") badgeText = "ASAP";
            } else if (action.status === "To do") {
              badgeVariant = "warning";
              badgeText = "PENDING";
            } else if (isWaiting) {
              badgeVariant = "info";
              badgeText = "IN REVIEW";
            }

            return (
              <Link
                key={action.id}
                href={getActionHref(action)}
                className={`flex items-center gap-2.5 border-b px-2 py-1.5 sm:gap-3 sm:py-2 transition-colors hover:bg-muted/45 ${
                  isWaiting ? "pointer-events-none opacity-60" : ""
                }`}
              >
                {/* Status indicator */}
                {isWaiting ? (
                  <div className="flex size-4 shrink-0 items-center justify-center rounded border border-primary bg-primary">
                    <div className="size-1.5 rounded-full bg-primary-foreground" />
                  </div>
                ) : (
                  <div className="size-4 shrink-0 rounded border-2 border-border bg-card" />
                )}

                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-semibold">{action.title}</p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {action.courseName}
                  </p>
                </div>

                <Badge variant={badgeVariant}>{badgeText}</Badge>
              </Link>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
