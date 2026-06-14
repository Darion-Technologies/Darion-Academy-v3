import { AppShell } from "@/components/app-shell";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { RealtimeSync } from "@/components/realtime-sync";
import { syncCurrentSession } from "@/lib/session";
import { AppearanceSync } from "@/components/appearance-sync";

import { getUnreadChatCountAction } from "@/app/actions/chat";

export default async function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  await syncCurrentSession(user.id);
  const [unreadCount, hasEnrollment, preference, unreadChatCount] = await Promise.all([
    prisma.notification.count({ where: { userId: user.id, read: false } }),
    prisma.enrollment.count({ where: { learnerId: user.id } }).then((count) => count > 0),
    prisma.learningPreference.findUnique({ where: { userId: user.id } }),
    getUnreadChatCountAction(),
  ]);
  
  return (
    <AppShell
      user={{ name: user.name, email: user.email, role: user.role, employeeId: user.employeeId, avatarUrl: user.avatarUrl }}
      unreadCount={unreadCount}
      unreadChatCount={unreadChatCount}
      hasEnrollment={hasEnrollment}
      initialSidebarCollapsed={preference?.sidebarCollapsed ?? false}
      initialTheme={preference?.theme ?? "SYSTEM"}
    >
      <AppearanceSync theme={preference?.theme ?? "SYSTEM"} />
      <RealtimeSync userId={user.id} />
      {children}
    </AppShell>
  );
}
