import Link from "next/link";
import { markNotificationReadAction } from "@/app/actions/account";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/submit-button";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
export default async function NotificationsPage() {
  const user = await requireUser();
  const items = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <>
      <PageHeader
        title="Notifications"
        description="Updates about assignments, reviews, and certificates."
      />
      {items.length === 0 ? (
        <EmptyState title="No notifications" description="You're all caught up." />
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className={`flex items-center gap-4 rounded-xl border bg-card p-5 shadow-[var(--shadow-sm)] ${
                !item.read
                  ? "border-primary/30 bg-accent/45 ring-1 ring-primary/20"
                  : "border-border"
              }`}
            >
              {/* Unread indicator dot */}
              {!item.read && (
                <div className="size-2 shrink-0 rounded-full bg-primary" />
              )}

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="font-bold text-foreground">{item.title}</h2>
                  {!item.read && <Badge variant="info">New</Badge>}
                </div>
                <p className="text-sm text-muted-foreground">{item.message}</p>
                <p className="text-xs text-muted-foreground mt-1 opacity-70">
                  {item.createdAt.toLocaleString()}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {item.href && (
                  <Button variant="outline" size="sm" asChild>
                    <Link href={item.href}>Open</Link>
                  </Button>
                )}
                {!item.read && (
                  <form action={markNotificationReadAction}>
                    <input type="hidden" name="id" value={item.id} />
                    <SubmitButton variant="ghost" size="sm" pendingText="...">
                      Mark read
                    </SubmitButton>
                  </form>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
