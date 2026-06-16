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
      <CardHeader className="mb-1 flex flex-row items-center justify-between border-b pb-1">
        <CardTitle>
          Action Items
        </CardTitle>
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
                className={`flex items-center gap-2 border-b px-1 py-1 transition-colors hover:bg-muted/45 ${
                  isWaiting ? "pointer-events-none opacity-60" : ""
                }`}
              >
                <div className="flex-1 min-w-0">
                  <p className="truncate text-xs font-semibold">{action.title}</p>
                  <p className="truncate text-[9px] text-muted-foreground">
                    {action.courseName}
                  </p>
                </div>
                <Badge variant={badgeVariant} className="text-[9px] px-1 py-0">{badgeText}</Badge>
              </Link>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
