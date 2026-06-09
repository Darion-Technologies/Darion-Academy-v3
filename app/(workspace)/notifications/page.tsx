import Link from "next/link";
import { markNotificationReadAction, markAllNotificationsReadAction } from "@/app/actions/account";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/submit-button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CheckCheck } from "lucide-react";

export default async function NotificationsPage() {
  const user = await requireUser();
  const items = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const unreadItems = items.filter((item) => !item.read);
  const readItems = items.filter((item) => item.read);

  return (
    <>
      <PageHeader
        title="Notifications"
        description="Updates about assignments, reviews, and certificates."
        action={
          unreadItems.length > 0 ? (
            <form action={markAllNotificationsReadAction}>
              <SubmitButton variant="secondary" className="active-press gap-2" pendingText="Clearing...">
                <CheckCheck className="size-4" />
                Mark all as read
              </SubmitButton>
            </form>
          ) : null
        }
      />
      {items.length === 0 ? (
        <EmptyState title="No notifications" description="You're all caught up." />
      ) : (
        <div className="space-y-6">
          {unreadItems.length > 0 && (
            <div className="space-y-3">
              {unreadItems.map((item, index) => (
                <NotificationCard key={item.id} item={item} index={index} />
              ))}
            </div>
          )}

          {readItems.length > 0 && (
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="read-notifications" className="border-none">
                <AccordionTrigger className="text-sm font-medium text-muted-foreground hover:text-foreground">
                  View previously read ({readItems.length})
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3 pt-2">
                    {readItems.map((item, index) => (
                      <NotificationCard key={item.id} item={item} index={index} />
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}
        </div>
      )}
    </>
  );
}

function NotificationCard({ item, index = 0 }: { item: any, index?: number }) {
  return (
    <div
      className={`animate-slide-up-fade opacity-0 flex items-center gap-4 rounded-xl border bg-card p-5 shadow-[var(--shadow-sm)] ${
        !item.read
          ? "border-primary/30 bg-accent/45 ring-1 ring-primary/20"
          : "border-border"
      }`}
      style={{ animationDelay: `${index * 40}ms` }}
    >
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
          <Button variant="outline" size="sm" asChild className="active-press">
            <Link href={item.href}>Open</Link>
          </Button>
        )}
        {!item.read && (
          <form action={markNotificationReadAction}>
            <input type="hidden" name="id" value={item.id} />
            <SubmitButton variant="ghost" size="sm" pendingText="..." className="active-press">
              Mark read
            </SubmitButton>
          </form>
        )}
      </div>
    </div>
  );
}
