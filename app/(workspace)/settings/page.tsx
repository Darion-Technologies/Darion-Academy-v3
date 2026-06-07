import { logoutOtherSessionsAction, revokeSessionAction, updatePreferencesAction, updateProfileAction } from "@/app/actions/account";
import { PasswordForm } from "@/components/auth/password-form";
import { PageHeader } from "@/components/page-header";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requireUser } from "@/lib/auth";
import { Shield, Bell, Laptop } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { sessionIdFromToken } from "@/lib/session";
import { Select } from "@/components/ui/select";
import { AppearanceSettings } from "@/components/appearance-settings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function SettingPanel({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader className="border-b"><CardTitle>{title}</CardTitle>{description && <p className="text-sm text-muted-foreground">{description}</p>}</CardHeader>
      <CardContent>{children}</CardContent>
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
        <Shield className="w-3 h-3" /> Enforced On
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
        title="Account Settings"
        description="Manage your profile, preferences, and security."
      />

      <div className="grid gap-6 max-w-5xl">
        <SettingPanel title="Appearance" description="Choose how Darion Academy looks across your signed-in devices.">
          <AppearanceSettings initialTheme={preference?.theme ?? "SYSTEM"} initialSidebarCollapsed={preference?.sidebarCollapsed ?? false} />
        </SettingPanel>
        {/* Profile */}
        <SettingPanel
          title="Profile Information"
          description="Update your personal details. Some fields are managed by Darion IT."
        >
          <form action={updateProfileAction} className="space-y-4 max-w-md">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">
                Full Name
              </Label>
              <Input name="name" defaultValue={user.name} required />
            </div>
            <div className="space-y-1.5">
              <Label className="flex items-center justify-between text-sm font-medium">
                Email Address
                <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                  <Shield className="w-3 h-3" /> Managed by Admin
                </span>
              </Label>
              <Input value={user.email} disabled />
            </div>
            <div className="space-y-1.5">
              <Label className="flex items-center justify-between text-sm font-medium">
                Account Role
                <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                  <Shield className="w-3 h-3" /> Managed by Admin
                </span>
              </Label>
              <Input value={user.role} disabled className="capitalize" />
            </div>
            <SubmitButton pendingText="Saving...">Save Changes</SubmitButton>
          </form>
        </SettingPanel>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Security */}
          <SettingPanel
            title="Account Security"
            description="Update your password to keep your account secure."
          >
            <PasswordForm />
          </SettingPanel>

          {/* Active Sessions */}
          <SettingPanel
            title="Active Sessions"
            description="Devices currently logged into your account."
          >
            <div className="space-y-3">
              {sessions.map((item) => {
                const current = item.sessionId === currentSessionId;
                return (
                  <div key={item.id} className="flex items-center gap-4 rounded-lg border bg-muted/50 p-4">
                    <Laptop className="h-7 w-7 text-muted-foreground" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold">{item.browser ?? "Browser"} on {item.operatingSystem ?? "Unknown OS"}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{current ? "Current session" : `Last active ${item.lastSeenAt.toLocaleString()}`}</p>
                    </div>
                    {!current && <form action={revokeSessionAction}><input type="hidden" name="sessionId" value={item.sessionId} /><SubmitButton variant="outline" size="sm" pendingText="Revoking...">Revoke</SubmitButton></form>}
                  </div>
                );
              })}
              <form action={logoutOtherSessionsAction}>
                <SubmitButton variant="outline" pendingText="Signing out...">Sign out other devices</SubmitButton>
              </form>
            </div>
          </SettingPanel>

          {/* Learning Preferences */}
          <SettingPanel
            title="Learning Preferences"
            description="Customise your LMS experience."
          >
            <form action={updatePreferencesAction} className="space-y-4">
              <div><Label>Default lesson view</Label><Select name="defaultLessonView" defaultValue={preference?.defaultLessonView ?? "STANDARD"}><option value="STANDARD">Standard</option><option value="FOCUS">Focus mode</option></Select></div>
              <label className="flex items-center gap-3 text-sm font-semibold"><input type="checkbox" name="resumeLastLesson" defaultChecked={preference?.resumeLastLesson ?? true} /> Resume the last lesson automatically</label>
              <label className="flex items-center gap-3 text-sm font-semibold"><input type="checkbox" name="courseReminders" defaultChecked={preference?.courseReminders ?? true} /> Course due reminders</label>
              <label className="flex items-center gap-3 text-sm font-semibold"><input type="checkbox" name="reviewUpdates" defaultChecked={preference?.reviewUpdates ?? true} /> Mentor review updates</label>
              <label className="flex items-center gap-3 text-sm font-semibold"><input type="checkbox" name="certificateAlerts" defaultChecked={preference?.certificateAlerts ?? true} /> Certificate alerts</label>
              <SubmitButton pendingText="Saving...">Save preferences</SubmitButton>
            </form>
          </SettingPanel>

          {/* Notification Preferences */}
          <SettingPanel
            title="Notifications"
            description="Manage how we contact you."
          >
            <div className="space-y-3">
              <LockedRow icon={Bell} label="Verified email delivery" sublabel="Security and account emails are always enabled." />
            </div>
          </SettingPanel>
        </div>
      </div>
    </>
  );
}
