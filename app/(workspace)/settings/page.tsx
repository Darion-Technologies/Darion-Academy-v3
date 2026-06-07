import { logoutOtherSessionsAction, revokeSessionAction, updatePreferencesAction, updateProfileAction } from "@/app/actions/account";
import { PasswordForm } from "@/components/auth/password-form";
import { PageHeader } from "@/components/page-header";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requireUser } from "@/lib/auth";
import { Shield, Bell, Laptop, Building2, CalendarDays, KeyRound, MonitorSmartphone } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { sessionIdFromToken } from "@/lib/session";
import { Select } from "@/components/ui/select";
import { AppearanceSettings } from "@/components/appearance-settings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AvatarUpload } from "./_components/avatar-upload";

function SettingPanel({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader className="border-b bg-muted/20">
        <CardTitle className="text-lg">{title}</CardTitle>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </CardHeader>
      <CardContent className="pt-6">{children}</CardContent>
    </Card>
  );
}

function LockedRow({ icon: Icon, label, sublabel }: { icon?: any; label: string; sublabel: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg border bg-muted/60 p-4 opacity-80">
      <div className="flex items-center gap-3">
        {Icon && <Icon className="h-5 w-5 text-muted-foreground" />}
        <div>
          <p className="text-sm font-semibold">{label}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{sublabel}</p>
        </div>
      </div>
      <span className="flex items-center gap-1 text-xs font-semibold text-muted-foreground">
        <Shield className="w-3 h-3" /> Enforced
      </span>
    </div>
  );
}

export default async function SettingsPage() {
  const user = await requireUser();
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const currentSessionId = session?.access_token ? sessionIdFromToken(session.access_token) : null;
  
  const [sessions, preference] = await Promise.all([
    prisma.userSession.findMany({ where: { userId: user.id, revokedAt: null }, orderBy: { lastSeenAt: "desc" } }),
    prisma.learningPreference.findUnique({ where: { userId: user.id } }),
  ]);

  return (
    <>
      <PageHeader
        title="Profile Hub"
        description="Manage your professional identity and workspace preferences."
      />

      <div className="max-w-5xl space-y-8 pb-20">
        
        {/* Premium Corporate Hero Banner */}
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          {/* Banner background */}
          <div className="h-32 bg-gradient-to-r from-slate-900 via-[#10202D] to-primary/80" />
          
          <div className="px-6 pb-6 pt-4 sm:flex sm:items-end sm:gap-5">
            <div className="-mt-14 relative z-10">
              <AvatarUpload name={user.name} currentAvatarUrl={user.avatarUrl} />
            </div>
            
            <div className="mt-4 sm:flex-1 sm:min-w-0 sm:flex sm:items-center sm:justify-end sm:gap-6 sm:pb-1">
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl font-bold truncate text-foreground">{user.name}</h1>
                <p className="text-sm font-medium text-muted-foreground flex items-center gap-1.5 mt-1">
                  <Building2 className="size-3.5" />
                  {user.department ?? "No Department Set"} • {user.role}
                  {user.employeeId && <span className="opacity-75">({user.employeeId})</span>}
                </p>
              </div>
              
              <div className="mt-5 flex flex-col justify-stretch gap-3 sm:flex-row sm:mt-0 sm:gap-4">
                <div className="inline-flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-1.5 text-sm font-medium text-muted-foreground">
                  <CalendarDays className="size-4" />
                  Joined {user.createdAt.getFullYear()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabbed Interface */}
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="mb-6 grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="learning">Learning</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          {/* General Tab */}
          <TabsContent value="general" className="space-y-6 animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
            <SettingPanel
              title="Personal Information"
              description="Update your corporate details. Note that role and email are locked by IT."
            >
              <form action={updateProfileAction} className="space-y-5 max-w-xl">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label className="text-sm font-semibold">Full Name</Label>
                    <Input name="name" defaultValue={user.name} required />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-semibold">Department / Title</Label>
                    <Input name="department" defaultValue={user.department ?? ""} placeholder="e.g. Engineering" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-semibold">Employee ID</Label>
                    <Input name="employeeId" defaultValue={user.employeeId ?? ""} placeholder="e.g. EMP-12345" />
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label className="flex items-center justify-between text-sm font-semibold">
                      Email Address
                      <Shield className="w-3.5 h-3.5 text-muted-foreground" />
                    </Label>
                    <Input value={user.email} disabled className="bg-muted" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="flex items-center justify-between text-sm font-semibold">
                      Account Role
                      <Shield className="w-3.5 h-3.5 text-muted-foreground" />
                    </Label>
                    <Input value={user.role} disabled className="capitalize bg-muted" />
                  </div>
                </div>
                
                <SubmitButton pendingText="Saving...">Save Changes</SubmitButton>
              </form>
            </SettingPanel>

            <SettingPanel title="Appearance" description="Choose how Darion Academy looks across your signed-in devices.">
              <AppearanceSettings initialTheme={preference?.theme ?? "SYSTEM"} initialSidebarCollapsed={preference?.sidebarCollapsed ?? false} />
            </SettingPanel>
          </TabsContent>

          {/* Learning Tab */}
          <TabsContent value="learning" className="space-y-6 animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
            <SettingPanel
              title="Learning Preferences"
              description="Customise your learning environment and behaviors."
            >
              <form action={updatePreferencesAction} className="space-y-6 max-w-xl">
                <div className="space-y-1.5">
                  <Label className="font-semibold">Default Lesson View</Label>
                  <Select name="defaultLessonView" defaultValue={preference?.defaultLessonView ?? "STANDARD"}>
                    <option value="STANDARD">Standard Interface</option>
                    <option value="FOCUS">Focus Mode (No distractions)</option>
                  </Select>
                  <p className="text-xs text-muted-foreground">Focus mode hides the sidebar and expands video width.</p>
                </div>
                
                <div className="space-y-4 pt-4 border-t border-border">
                  <label className="flex items-start gap-3 text-sm">
                    <input type="checkbox" name="resumeLastLesson" defaultChecked={preference?.resumeLastLesson ?? true} className="mt-0.5 accent-primary" /> 
                    <span className="block">
                      <span className="block font-semibold">Auto-resume lessons</span>
                      <span className="block text-xs text-muted-foreground">Jump right back to where you left off when opening a course.</span>
                    </span>
                  </label>
                  
                  <label className="flex items-start gap-3 text-sm">
                    <input type="checkbox" name="courseReminders" defaultChecked={preference?.courseReminders ?? true} className="mt-0.5 accent-primary" /> 
                    <span className="block">
                      <span className="block font-semibold">Course Due Reminders</span>
                      <span className="block text-xs text-muted-foreground">Receive alerts when mandatory training is approaching its deadline.</span>
                    </span>
                  </label>

                  <label className="flex items-start gap-3 text-sm">
                    <input type="checkbox" name="reviewUpdates" defaultChecked={preference?.reviewUpdates ?? true} className="mt-0.5 accent-primary" /> 
                    <span className="block">
                      <span className="block font-semibold">Mentor Review Updates</span>
                      <span className="block text-xs text-muted-foreground">Get notified when a mentor grades your assignment.</span>
                    </span>
                  </label>
                </div>
                
                <SubmitButton pendingText="Saving...">Save Preferences</SubmitButton>
              </form>
            </SettingPanel>

            <SettingPanel
              title="Notifications Delivery"
              description="Manage how critical communications reach you."
            >
              <div className="space-y-3 max-w-xl">
                <LockedRow icon={Bell} label="Verified email delivery" sublabel="Security and mandatory account emails are always enabled." />
              </div>
            </SettingPanel>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6 animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
            <div className="grid gap-6 md:grid-cols-2">
              <SettingPanel
                title="Account Security"
                description="Update your password."
              >
                <div className="mb-6 flex items-center gap-4 rounded-lg bg-muted p-4">
                  <div className="rounded-full bg-primary/10 p-2">
                    <KeyRound className="size-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Password Authentication</p>
                    <p className="text-xs text-muted-foreground">Last changed {user.updatedAt.toLocaleDateString()}</p>
                  </div>
                </div>
                <PasswordForm />
              </SettingPanel>

              <SettingPanel
                title="Active Sessions"
                description="Devices currently logged into your account."
              >
                <div className="space-y-3">
                  {sessions.map((item) => {
                    const current = item.sessionId === currentSessionId;
                    return (
                      <div key={item.id} className="flex items-start gap-4 rounded-lg border border-border bg-card p-4 transition-colors hover:bg-muted/30">
                        <MonitorSmartphone className="mt-0.5 h-6 w-6 shrink-0 text-muted-foreground" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold">{item.browser ?? "Browser"} on {item.operatingSystem ?? "Unknown OS"}</p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {current ? <span className="font-medium text-emerald-600 dark:text-emerald-400">Current session</span> : `Last active ${item.lastSeenAt.toLocaleDateString()}`}
                          </p>
                        </div>
                        {!current && (
                          <form action={revokeSessionAction}>
                            <input type="hidden" name="sessionId" value={item.sessionId} />
                            <SubmitButton variant="outline" size="sm" pendingText="Revoking...">Revoke</SubmitButton>
                          </form>
                        )}
                      </div>
                    );
                  })}
                  
                  {sessions.length > 1 && (
                    <div className="pt-4 mt-4 border-t border-border">
                      <form action={logoutOtherSessionsAction}>
                        <SubmitButton variant="destructive" className="w-full" pendingText="Signing out...">Sign out all other devices</SubmitButton>
                      </form>
                    </div>
                  )}
                </div>
              </SettingPanel>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
