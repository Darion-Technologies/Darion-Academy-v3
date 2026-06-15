import { AppShell } from "@/components/app-shell";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { RealtimeSync } from "@/components/realtime-sync";
import { syncCurrentSession } from "@/lib/session";
import { AppearanceSync } from "@/components/appearance-sync";

import { getUnreadChatCountAction } from "@/app/actions/chat";

import { unstable_cache } from "next/cache";

const getCachedLayoutData = unstable_cache(
  async (userId: string) => {
    const [unreadCount, hasEnrollment, preference] = await Promise.all([
      prisma.notification.count({ where: { userId, read: false } }),
      prisma.enrollment.count({ where: { learnerId: userId } }).then((count) => count > 0),
      prisma.learningPreference.findUnique({ where: { userId } }),
    ]);
    return { unreadCount, hasEnrollment, preference };
  },
  ["workspace-layout-data"],
  { tags: ["workspace-layout-data"], revalidate: 300 }
);

export default async function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  await syncCurrentSession(user.id);
  
  // We don't cache unreadChatCount because chat needs real-time accuracy, but we run it concurrently
  const [{ unreadCount, hasEnrollment, preference }, unreadChatCount] = await Promise.all([
    getCachedLayoutData(user.id),
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
