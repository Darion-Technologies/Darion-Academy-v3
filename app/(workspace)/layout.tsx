import { AppShell } from "@/components/app-shell";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { RealtimeSync } from "@/components/realtime-sync";
import { syncCurrentSession } from "@/lib/session";
import { AppearanceSync } from "@/components/appearance-sync";

import { getUnreadChatCountAction } from "@/app/actions/chat";
import { getTopDashboardData } from "@/lib/dashboard-data";

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

async function fetchSidebarCourses(userId: string) {
  const dashboardData = await getTopDashboardData(userId);
  return dashboardData.enrollments
    .filter(e => e.status === "IN_PROGRESS" || e.status === "ASSIGNED")
    .map(course => ({
      id: course.courseId,
      title: course.courseTitle,
      slug: course.courseSlug,
      tasks: dashboardData.pendingActions
        .filter(a => a.courseSlug === course.courseSlug)
        .map(action => ({
          id: action.id,
          title: action.title,
          href: `/courses/${course.courseSlug}?task=${action.id}`
        }))
    }));
}

export default async function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  // Fire and forget session sync so we don't block the layout render
  void syncCurrentSession(user.id);
  
  const { unreadCount, hasEnrollment, preference } = await getCachedLayoutData(user.id);
  
  // We fetch chat count client-side now to avoid blocking the layout
  
  const activeCoursesPromise = fetchSidebarCourses(user.id);

  return (
    <AppShell
      user={{ name: user.name, email: user.email, role: user.role, employeeId: user.employeeId, avatarUrl: user.avatarUrl }}
      unreadCount={unreadCount}
      unreadChatCount={0} // Fetched on client
      hasEnrollment={hasEnrollment}
      initialSidebarCollapsed={preference?.sidebarCollapsed ?? false}
      initialTheme={preference?.theme ?? "SYSTEM"}
      activeCoursesPromise={activeCoursesPromise}
    >
      <AppearanceSync theme={preference?.theme ?? "SYSTEM"} />
      <RealtimeSync userId={user.id} />
      {children}
    </AppShell>
  );
}
