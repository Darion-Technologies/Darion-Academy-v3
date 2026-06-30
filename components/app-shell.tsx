"use client";

import {
  Award, BarChart3, Bell, BookOpen, ClipboardCheck,
  FileQuestion, GraduationCap, LayoutDashboard, LayoutTemplate, LogOut, Menu,
  Users, X, Trophy, PanelLeftClose, PanelLeftOpen, PlaySquare, MessageSquare, NotebookPen, History, ChevronDown, ChevronRight, Settings, Moon, Sun, MoreHorizontal, Calendar, Hash, Bookmark
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useTransition, use, Suspense } from "react";
import { logoutAction } from "@/app/actions/auth";
import { updateAppearanceAction } from "@/app/actions/account";
import { AppearanceMenu } from "@/components/appearance-menu";
import { Brand } from "@/components/brand";
import { SearchBar } from "@/components/search-bar";
import { NotificationDropdown } from "@/components/notification-dropdown";
import { SubmitButton } from "@/components/submit-button";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { AppearanceTheme, UserRole } from "@/generated/prisma";
import { cn, initials } from "@/lib/utils";

type NavItem = { href: string; label: string; icon?: LucideIcon; children?: NavItem[] };
type NavGroup = { label: string; items: NavItem[] };

export type SidebarCourse = {
  id: string;
  title: string;
  slug: string;
  tasks: { id: string; title: string; href: string }[];
};

const learnerItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/courses", label: "My Courses", icon: BookOpen },
  { href: "/calendar", label: "Calendar", icon: Calendar },
  { href: "/dashboard/shorts", label: "Tech Shorts", icon: PlaySquare },
  { href: "/notes", label: "My Notes", icon: NotebookPen },
  { href: "/progress", label: "Progress", icon: BarChart3 },
  { href: "/history", label: "History", icon: History },
  { href: "/certificates", label: "Certificates", icon: Award },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/chat", label: "Messages", icon: MessageSquare },
  { href: "/notifications", label: "Notifications", icon: Bell },
];
const adminItems: NavItem[] = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/courses", label: "Courses", icon: GraduationCap },
  { href: "/admin/submissions", label: "Submissions", icon: ClipboardCheck },
  { href: "/admin/quizzes", label: "Quizzes", icon: FileQuestion },
  { href: "/admin/reports", label: "Reports", icon: BarChart3 },
  { href: "/admin/shorts", label: "Shorts", icon: PlaySquare },
  { href: "/admin/certificate-templates", label: "Templates", icon: LayoutTemplate },
  { href: "/admin/certificates", label: "Credentials", icon: Award },
  { href: "/chat", label: "Messages", icon: MessageSquare },
];
const mentorItems: NavItem[] = [
  { href: "/mentor", label: "Overview", icon: LayoutDashboard },
  { href: "/mentor/learners", label: "Learners", icon: Users },
  { href: "/mentor/submissions", label: "Reviews", icon: ClipboardCheck },
  { href: "/chat", label: "Messages", icon: MessageSquare },
];

export function AppShell({
  user,
  unreadCount = 0,
  unreadChatCount = 0,
  hasEnrollment = false,
  initialSidebarCollapsed = false,
  initialTheme = "SYSTEM",
  activeCoursesPromise,
  children,
}: {
  user: { name: string; email: string; role: UserRole; employeeId?: string | null; avatarUrl?: string | null };
  unreadCount?: number;
  unreadChatCount?: number;
  hasEnrollment?: boolean;
  initialSidebarCollapsed?: boolean;
  initialTheme?: AppearanceTheme;
  activeCoursesPromise?: Promise<SidebarCourse[]>;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(initialSidebarCollapsed);
  const [, startTransition] = useTransition();

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch((err) => {
        console.error("Service Worker registration failed:", err);
      });
    }
  }, []);

  const groups: NavGroup[] = user.role === "ADMIN"
    ? [{ label: "Administration", items: adminItems }, ...(hasEnrollment ? [{ label: "My learning", items: learnerItems }] : [])]
    : user.role === "MENTOR"
      ? [{ label: "Mentoring", items: mentorItems }, ...(hasEnrollment ? [{ label: "My learning", items: learnerItems }] : [])]
      : [{ label: "Learning", items: learnerItems }];
  const mobileItems = groups.flatMap((group) => group.items).slice(0, 5);

  function isActive(href: string) {
    if (href === "/dashboard" || href === "/admin" || href === "/mentor") return pathname === href;
    return pathname.startsWith(href);
  }

  function toggleSidebar() {
    const next = !collapsed;
    setCollapsed(next);
    const formData = new FormData();
    formData.set("sidebarCollapsed", String(next));
    startTransition(() => void updateAppearanceAction(formData));
  }

  return (
    <div className="min-h-screen bg-background">
      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 hidden border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-200 lg:flex lg:flex-col antialiased",
        collapsed ? "w-[64px]" : "w-[200px]",
      )}>
        <div className={cn("flex h-10 items-center border-b border-sidebar-border", collapsed ? "justify-center px-2" : "px-4")}>
          <Brand collapsed={collapsed} />
        </div>
        <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-6">
          {groups.map(group => (
            <div key={group.label} className="space-y-1">
              {!collapsed && (
                <p className="px-2 text-[10px] font-bold uppercase tracking-[0.15em] text-sidebar-foreground/50 mb-2">
                  {group.label}
                </p>
              )}
              <div className="space-y-0.5">
                {group.items.map((item) => (
                  <NavLink key={item.href} item={item} active={isActive(item.href)} collapsed={collapsed} unreadChatCount={unreadChatCount} unreadCount={unreadCount} pathname={pathname} />
                ))}
              </div>
            </div>
          ))}
          {activeCoursesPromise && (
            <Suspense fallback={
              <div className="space-y-1">
                {!collapsed && <p className="px-2 text-[10px] font-bold uppercase tracking-[0.15em] text-sidebar-foreground/50 mb-2">Active Courses</p>}
                <div className="space-y-0.5 px-3">
                  <div className="h-8 rounded-md bg-sidebar-muted/50 animate-pulse" />
                  <div className="h-8 rounded-md bg-sidebar-muted/50 animate-pulse mt-1" />
                </div>
              </div>
            }>
              <ActiveCoursesRenderer 
                promise={activeCoursesPromise} 
                collapsed={collapsed} 
                pathname={pathname} 
              />
            </Suspense>
          )}
        </nav>
        <div className="border-t border-sidebar-border p-3 flex flex-col gap-2">
          <Link href="/settings" className={cn(
            "flex items-center rounded-md py-1 hover:bg-sidebar-accent transition-colors",
            collapsed ? "justify-center" : "gap-3 px-1"
          )}>
            <span className="relative grid size-8 shrink-0 place-items-center overflow-hidden rounded-full bg-sidebar-muted/20 text-[10px] font-bold text-sidebar-foreground">
              <span className="absolute inset-0 flex items-center justify-center">{initials(user.name)}</span>
              {user.avatarUrl && <img src={user.avatarUrl} alt="" width={32} height={32} className="relative z-10 size-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />}
            </span>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-semibold text-sidebar-foreground leading-tight group-hover:text-sidebar-foreground">{user.name}</p>
                <p className="truncate text-[10px] text-sidebar-foreground/50 leading-tight mt-0.5">{user.role.toLowerCase()}{user.employeeId ? ` (${user.employeeId})` : ""}</p>
              </div>
            )}
          </Link>

          <div className="flex flex-col gap-0.5 mt-2 border-t border-sidebar-border pt-2">
            <button 
              onClick={toggleSidebar}
              className={cn("flex h-8 items-center gap-3 px-2 text-[13px] font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground rounded-md transition-colors", collapsed && "justify-center px-0")}
            >
              {collapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
              {!collapsed && <span>Collapse</span>}
            </button>
            <form action={logoutAction} className="w-full">
              <SubmitButton variant="ghost" size="sm" pendingText="" className={cn("w-full h-8 py-0 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground rounded-md transition-colors justify-start font-medium text-[13px] gap-3", collapsed ? "px-0 justify-center" : "px-2")}>
                <LogOut className="size-4 shrink-0" />
                {!collapsed && <span>Sign out</span>}
              </SubmitButton>
            </form>
          </div>
        </div>
      </aside>

      {mobileOpen && <MobileDrawer groups={groups} activeCoursesPromise={activeCoursesPromise} user={user} pathname={pathname} close={() => setMobileOpen(false)} unreadCount={unreadCount} unreadChatCount={unreadChatCount} />}

      <div data-app-content className={cn("flex min-h-screen flex-col transition-[padding] duration-200", collapsed ? "lg:pl-[64px]" : "lg:pl-[200px]")}>
        {!(pathname === "/dashboard" || pathname.startsWith("/chat")) && (
          <header className="sticky top-0 z-30 flex h-auto min-h-12 pt-safe items-center gap-2 lg:gap-3 border-b border-border bg-card/95 px-2 lg:px-4 shadow-none backdrop-blur-xl sm:px-4 py-1">
            <Button variant="ghost" size="icon" className="relative z-40 shrink-0 touch-manipulation lg:hidden h-10 w-10" onClick={() => setMobileOpen(true)} aria-label="Open navigation"><Menu className="size-5" /></Button>
            <div className="lg:hidden"><Brand /></div>
            <div className="hidden min-w-0 max-w-xl flex-1 lg:block"><SearchBar /></div>
            <div className="ml-auto flex items-center gap-1.5 sm:gap-3">
              <div className="hidden sm:block">
                <AppearanceMenu initialTheme={initialTheme} sidebarCollapsed={collapsed} />
              </div>
              <NotificationDropdown unreadCount={unreadCount} />
              <div className="ml-1 sm:ml-2 flex items-center gap-3 sm:border-l sm:pl-4">
                <div className="hidden text-right sm:block"><p className="text-sm font-semibold leading-tight">{user.name}</p><p className="text-xs capitalize text-muted-foreground">{user.role.toLowerCase()}{user.employeeId ? ` (${user.employeeId})` : ""}</p></div>
                <Link href="/settings" className="relative grid size-8 sm:size-10 place-items-center overflow-hidden rounded-full sm:bg-muted text-[10px] sm:text-xs font-bold text-foreground shrink-0 border border-border transition-transform active:scale-95">
                  <span className="absolute inset-0 flex items-center justify-center">{initials(user.name)}</span>
                  {user.avatarUrl && <img src={user.avatarUrl} alt="" width={40} height={40} className="relative z-10 size-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />}
                </Link>
              </div>
            </div>
          </header>
        )}
        <main className={cn(
          "flex-1 w-full",
          pathname.startsWith("/chat") ? "p-0 max-w-none" : "container-responsive pb-20 pt-4"
        )}>
          <div className={cn(
            "w-full h-full",
            pathname.startsWith("/chat") && "h-[100dvh] flex flex-col"
          )}>
            {children}
          </div>
        </main>
        {!(pathname.startsWith("/chat")) && (
          <nav className="fixed inset-x-0 bottom-0 z-30 flex justify-around border-t bg-card/95 p-1 backdrop-blur-xl lg:hidden pb-safe">
            {mobileItems.map((item) => <Link key={item.href} href={item.href} prefetch={true} className={cn("flex min-w-16 min-h-12 flex-col items-center justify-center gap-1 rounded-md px-1 py-2 text-[10px] font-medium active:scale-95 transition-all", isActive(item.href) ? "bg-accent/10 text-accent" : "text-muted-foreground hover:text-foreground hover:bg-accent/5")}>{item.icon && <item.icon className="size-5" />}{item.label}</Link>)}
          </nav>
        )}
      </div>
    </div>
  );
}

function NavLink({ item, active, collapsed, onClick, unreadChatCount, unreadCount, pathname }: { item: NavItem; active: boolean; collapsed: boolean; onClick?: () => void; unreadChatCount?: number; unreadCount?: number; pathname?: string }) {
  const isChat = item.href === "/chat";
  const hasUnreadChat = isChat && typeof unreadChatCount === 'number' && unreadChatCount > 0;
  const isNotifications = item.href === "/notifications";
  const isAssignments = item.href === "/assignments";
  
  // Expanded logic for Assignments
  const [expanded, setExpanded] = useState(pathname?.startsWith(item.href) || false);
  
  const linkContent = (
    <>
      <div className="relative">
        {item.icon && <item.icon className="size-4 shrink-0" />}
        {hasUnreadChat && collapsed && (
          <span className="absolute -top-1 -right-1 flex size-2.5 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white"></span>
        )}
      </div>
      {!collapsed && (
        <div className="flex flex-1 items-center justify-between min-w-0 gap-2">
          <span className="truncate" title={item.label}>{item.label}</span>
          {hasUnreadChat && (
            <span className="flex size-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
              {unreadChatCount}
            </span>
          )}
          {isNotifications && unreadCount !== undefined && unreadCount > 0 && (
            <span className="flex items-center justify-center rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
          {item.children && (
             expanded ? <ChevronDown className="size-4 shrink-0 opacity-50" /> : <ChevronRight className="size-4 shrink-0 opacity-50" />
          )}
        </div>
      )}
    </>
  );

  const baseClasses = cn(
    "relative flex h-8 items-center rounded-md text-[13px] font-medium transition-colors",
    collapsed ? "justify-center px-1" : "gap-3 px-3",
    active && !item.children ? "bg-sidebar-accent text-sidebar-foreground font-semibold" : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent",
  );

  if (item.children) {
    return (
      <div className="flex flex-col">
        <button onClick={() => setExpanded(!expanded)} className={baseClasses}>
          {linkContent}
        </button>
        {expanded && !collapsed && (
          <div className="mt-0.5 flex flex-col space-y-0.5 relative before:absolute before:left-[19px] before:top-1 before:bottom-3 before:w-px before:bg-sidebar-border">
            {item.children.map(child => (
              <Link 
                key={child.href} 
                href={child.href}
                className={cn(
                  "relative flex h-7 items-center pl-10 pr-3 text-[11px] transition-colors rounded-md truncate",
                  pathname === child.href ? "text-sidebar-foreground font-semibold" : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                )}
                title={child.label}
              >
                <span className="truncate">{child.label}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  const link = <Link href={item.href} prefetch={true} onClick={onClick} className={baseClasses}>{linkContent}</Link>;
  return collapsed ? <Tooltip><TooltipTrigger asChild>{link}</TooltipTrigger><TooltipContent side="right">{item.label}</TooltipContent></Tooltip> : link;
}

function ActiveCoursesRenderer({ promise, collapsed, pathname, onClick }: { promise: Promise<SidebarCourse[]>, collapsed: boolean, pathname: string, onClick?: () => void }) {
  const activeCourses = use(promise);
  
  if (!activeCourses || activeCourses.length === 0) return null;

  const courseItems: NavItem[] = activeCourses.map((c: SidebarCourse) => ({
    label: c.title,
    href: `/courses/${c.slug}`,
    icon: Hash,
    children: c.tasks.length > 0 ? c.tasks.map((t: { title: string, href: string }) => ({
      label: t.title,
      href: t.href
    })) : undefined
  }));

  return (
    <div className="space-y-1 mt-6">
      {!collapsed && (
        <p className="px-2 text-[10px] font-bold uppercase tracking-[0.15em] text-sidebar-foreground/50 mb-2">
          Active Courses
        </p>
      )}
      <div className="space-y-0.5">
        {courseItems.map((item) => (
          <NavLink 
            key={item.href} 
            item={item} 
            active={pathname.startsWith(item.href)} 
            collapsed={collapsed} 
            pathname={pathname}
            onClick={onClick}
          />
        ))}
      </div>
    </div>
  );
}

function MobileDrawer({ groups, activeCoursesPromise, user, close, pathname, unreadCount, unreadChatCount }: { groups: NavGroup[]; activeCoursesPromise?: Promise<SidebarCourse[]>; user: { name: string; role: UserRole; avatarUrl?: string | null; employeeId?: string | null }; close: () => void; pathname: string; unreadCount?: number; unreadChatCount?: number }) {
  return <div className="fixed inset-0 z-50 lg:hidden">
    <button className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm" onClick={close} aria-label="Close navigation" />
    <aside className="relative flex h-full w-[240px] flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground shadow-2xl antialiased">
      <div className="flex h-10 items-center justify-between border-b border-sidebar-border px-4"><Brand /><Button variant="ghost" size="icon-xs" onClick={close} className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"><X /></Button></div>
      <nav className="flex-1 overflow-y-auto p-2">
        {groups.map((group) => <div key={group.label} className="mb-4"><p className="mb-1 px-2 text-[9px] font-semibold uppercase tracking-[0.1em] text-[var(--sidebar-muted)]">{group.label}</p><div className="space-y-0.5">{group.items.map((item) => <NavLink key={item.href} item={item} active={pathname === item.href || (item.href !== "/dashboard" && item.href !== "/admin" && item.href !== "/mentor" && pathname.startsWith(item.href))} collapsed={false} onClick={close} unreadChatCount={unreadChatCount} unreadCount={unreadCount} pathname={pathname} />)}</div></div>)}
        {activeCoursesPromise && (
          <Suspense fallback={<div className="h-10 animate-pulse bg-sidebar-muted/50 rounded-md mx-2 mt-4" />}>
            <ActiveCoursesRenderer promise={activeCoursesPromise} collapsed={false} pathname={pathname} onClick={close} />
          </Suspense>
        )}
      </nav>
      <div className="border-t border-sidebar-border p-3 flex items-center gap-2">
        <div className="relative grid size-8 shrink-0 place-items-center overflow-hidden rounded-full bg-sidebar-muted/20 text-[10px] font-bold text-sidebar-foreground">
          <span className="absolute inset-0 flex items-center justify-center">{initials(user.name)}</span>
          {user.avatarUrl && <img src={user.avatarUrl} alt="" width={36} height={36} className="relative z-10 size-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />}
        </div>
        <div>
          <p className="text-sm font-semibold text-sidebar-foreground">{user.name}</p>
          <p className="text-xs capitalize text-[var(--sidebar-muted)]">{user.role.toLowerCase()}{user.employeeId ? ` (${user.employeeId})` : ""}</p>
        </div>
      </div>
    </aside>
  </div>;
}
