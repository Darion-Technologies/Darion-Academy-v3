"use client";

import {
  Award, BarChart3, Bell, BookOpen, ChevronLeft, ChevronRight, ClipboardCheck,
  FileQuestion, GraduationCap, LayoutDashboard, LayoutTemplate, LogOut, Menu,
  Users, X, Trophy
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useTransition } from "react";
import { logoutAction } from "@/app/actions/auth";
import { updateAppearanceAction } from "@/app/actions/account";
import { AppearanceMenu } from "@/components/appearance-menu";
import { Brand } from "@/components/brand";
import { SearchBar } from "@/components/search-bar";
import { SubmitButton } from "@/components/submit-button";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { AppearanceTheme, UserRole } from "@/generated/prisma";
import { cn, initials } from "@/lib/utils";

type NavItem = { href: string; label: string; icon: LucideIcon };
type NavGroup = { label: string; items: NavItem[] };

const learnerItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/courses", label: "My Courses", icon: BookOpen },
  { href: "/progress", label: "Progress", icon: BarChart3 },
  { href: "/certificates", label: "Certificates", icon: Award },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/notifications", label: "Notifications", icon: Bell },
];
const adminItems: NavItem[] = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/courses", label: "Courses", icon: GraduationCap },
  { href: "/admin/submissions", label: "Submissions", icon: ClipboardCheck },
  { href: "/admin/quizzes", label: "Quizzes", icon: FileQuestion },
  { href: "/admin/reports", label: "Reports", icon: BarChart3 },
  { href: "/admin/certificate-templates", label: "Templates", icon: LayoutTemplate },
  { href: "/admin/certificates", label: "Credentials", icon: Award },
];
const mentorItems: NavItem[] = [
  { href: "/mentor", label: "Overview", icon: LayoutDashboard },
  { href: "/mentor/learners", label: "Learners", icon: Users },
  { href: "/mentor/submissions", label: "Reviews", icon: ClipboardCheck },
];

export function AppShell({
  user,
  unreadCount = 0,
  hasEnrollment = false,
  initialSidebarCollapsed = false,
  initialTheme = "SYSTEM",
  children,
}: {
  user: { name: string; email: string; role: UserRole; employeeId?: string | null; avatarUrl?: string | null };
  unreadCount?: number;
  hasEnrollment?: boolean;
  initialSidebarCollapsed?: boolean;
  initialTheme?: AppearanceTheme;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(initialSidebarCollapsed);
  const [, startTransition] = useTransition();

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
        "fixed inset-y-0 left-0 z-40 hidden border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-200 lg:flex lg:flex-col",
        collapsed ? "w-[64px]" : "w-[220px]",
      )}>
        <div className={cn("flex h-12 items-center border-b border-sidebar-border", collapsed ? "justify-center px-2" : "px-4")}>
          {!collapsed && <Brand inverse />}
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {groups.map((group, index) => (
            <div key={group.label} className={cn(index > 0 && "mt-6")}>
              {!collapsed && <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--sidebar-muted)]">{group.label}</p>}
              <div className="space-y-1">
                {group.items.map((item) => <NavLink key={item.href} item={item} active={isActive(item.href)} collapsed={collapsed} />)}
              </div>
            </div>
          ))}
        </nav>
        <div className="border-t border-sidebar-border p-3">
          <Link href="/settings" className={cn(
            "mb-2 flex items-center rounded-lg text-sidebar-foreground transition-colors hover:bg-white/6 hover:text-white",
            collapsed ? "justify-center p-2.5" : "gap-3 p-2.5",
          )}>
            <span className="grid size-9 shrink-0 place-items-center overflow-hidden rounded-lg bg-white/10 text-xs font-bold text-white">
              {user.avatarUrl ? <img src={user.avatarUrl} alt="" className="size-full object-cover" /> : initials(user.name)}
            </span>
            {!collapsed && <span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold text-white">{user.name}</span><span className="block truncate text-xs text-[var(--sidebar-muted)]">{user.role.toLowerCase()}{user.employeeId ? ` (${user.employeeId})` : ""}</span></span>}
          </Link>
          <div className={cn("flex", collapsed ? "flex-col items-center gap-1" : "items-center gap-1")}>
            <Tooltip><TooltipTrigger asChild><Button type="button" variant="ghost" size="icon-sm" onClick={toggleSidebar} aria-expanded={!collapsed} aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"} className="text-sidebar-foreground hover:bg-white/8 hover:text-white">{collapsed ? <ChevronRight /> : <ChevronLeft />}</Button></TooltipTrigger><TooltipContent side="right">{collapsed ? "Expand sidebar" : "Collapse sidebar"}</TooltipContent></Tooltip>
            {!collapsed && <span className="flex-1" />}
            <form action={logoutAction}><SubmitButton variant="ghost" size="icon-sm" pendingText="..." aria-label="Sign out" className="text-sidebar-foreground hover:bg-white/8 hover:text-white"><LogOut /></SubmitButton></form>
          </div>
        </div>
      </aside>

      {mobileOpen && <MobileDrawer groups={groups} user={user} pathname={pathname} close={() => setMobileOpen(false)} />}

      <div data-app-content className={cn("flex min-h-screen flex-col transition-[padding] duration-200", collapsed ? "lg:pl-[64px]" : "lg:pl-[220px]")}>
        <header className="sticky top-0 z-30 flex h-10 lg:h-12 items-center gap-2 lg:gap-4 border-b bg-card/90 px-3 lg:px-4 shadow-[var(--shadow-sm)] backdrop-blur-xl sm:px-6">
          <Button variant="ghost" size="icon" className="relative z-40 shrink-0 touch-manipulation lg:hidden h-8 w-8" onClick={() => setMobileOpen(true)} aria-label="Open navigation"><Menu className="size-4" /></Button>
          <div className="lg:hidden"><Brand /></div>
          <div className="hidden min-w-0 max-w-xl flex-1 lg:block"><SearchBar /></div>
          <div className="ml-auto flex items-center gap-1.5 sm:gap-3">
            <div className="hidden sm:block">
              <AppearanceMenu initialTheme={initialTheme} sidebarCollapsed={collapsed} />
            </div>
            <Button variant="ghost" size="icon-sm" asChild className="relative">
              <Link href="/notifications" aria-label={`${unreadCount} unread notifications`}><Bell />{unreadCount > 0 && <span className="absolute right-1 top-1 size-2 rounded-full bg-primary ring-2 ring-card" />}</Link>
            </Button>
            <div className="ml-1 sm:ml-2 flex items-center gap-3 sm:border-l sm:pl-4">
              <div className="hidden text-right sm:block"><p className="text-sm font-semibold leading-tight">{user.name}</p><p className="text-xs capitalize text-muted-foreground">{user.role.toLowerCase()}{user.employeeId ? ` (${user.employeeId})` : ""}</p></div>
              <Link href="/settings" className="grid size-7 sm:size-9 place-items-center overflow-hidden rounded-md sm:rounded-lg bg-muted text-[10px] sm:text-xs font-bold text-foreground shrink-0">
                {user.avatarUrl ? <img src={user.avatarUrl} alt="" className="size-full object-cover" /> : initials(user.name)}
              </Link>
            </div>
          </div>
        </header>
        <main className="mx-auto w-full max-w-[1440px] flex-1 p-2 pb-16 sm:p-4 lg:p-6">{children}</main>
        <nav className="fixed inset-x-0 bottom-0 z-30 flex justify-around border-t bg-card/95 p-1 backdrop-blur-xl lg:hidden pb-safe">
          {mobileItems.map((item) => <Link key={item.href} href={item.href} className={cn("flex min-w-12 flex-col items-center gap-0.5 rounded-md px-1 py-1 text-[9px] font-medium", isActive(item.href) ? "bg-accent text-accent-foreground" : "text-muted-foreground")}><item.icon className="size-4" />{item.label}</Link>)}
        </nav>
      </div>
    </div>
  );
}

function NavLink({ item, active, collapsed, onClick }: { item: NavItem; active: boolean; collapsed: boolean; onClick?: () => void }) {
  const link = <Link href={item.href} onClick={onClick} className={cn(
    "relative flex h-8 items-center rounded-md text-sm font-medium transition-colors",
    collapsed ? "justify-center px-1" : "gap-2.5 px-2.5",
    active ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground hover:bg-white/6 hover:text-white",
  )}>
    <item.icon className="size-4 shrink-0" />
    {!collapsed && <span>{item.label}</span>}
  </Link>;
  return collapsed ? <Tooltip><TooltipTrigger asChild>{link}</TooltipTrigger><TooltipContent side="right">{item.label}</TooltipContent></Tooltip> : link;
}

function MobileDrawer({ groups, user, close, pathname }: { groups: NavGroup[]; user: { name: string; role: UserRole; avatarUrl?: string | null; employeeId?: string | null }; close: () => void; pathname: string }) {
  return <div className="fixed inset-0 z-50 lg:hidden">
    <button className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm" onClick={close} aria-label="Close navigation" />
    <aside className="relative flex h-full w-[240px] flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground shadow-2xl">
      <div className="flex h-12 items-center justify-between border-b border-sidebar-border px-4"><Brand inverse /><Button variant="ghost" size="icon-xs" onClick={close} className="text-sidebar-foreground hover:bg-white/8 hover:text-white"><X /></Button></div>
      <nav className="flex-1 overflow-y-auto p-2">{groups.map((group) => <div key={group.label} className="mb-4"><p className="mb-1 px-2 text-[9px] font-semibold uppercase tracking-[0.1em] text-[var(--sidebar-muted)]">{group.label}</p><div className="space-y-0.5">{group.items.map((item) => <NavLink key={item.href} item={item} active={pathname === item.href || (item.href !== "/dashboard" && item.href !== "/admin" && item.href !== "/mentor" && pathname.startsWith(item.href))} collapsed={false} onClick={close} />)}</div></div>)}</nav>
      <div className="border-t border-sidebar-border p-3 flex items-center gap-2">
        <div className="grid size-8 shrink-0 place-items-center overflow-hidden rounded-md bg-white/10 text-[10px] font-bold text-white">
          {user.avatarUrl ? <img src={user.avatarUrl} alt="" className="size-full object-cover" /> : initials(user.name)}
        </div>
        <div>
          <p className="text-sm font-semibold text-white">{user.name}</p>
          <p className="text-xs capitalize text-[var(--sidebar-muted)]">{user.role.toLowerCase()}{user.employeeId ? ` (${user.employeeId})` : ""}</p>
        </div>
      </div>
    </aside>
  </div>;
}
