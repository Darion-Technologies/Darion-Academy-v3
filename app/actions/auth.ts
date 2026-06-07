"use server";

import { loginSchema, loginWithEmployeeIdSchema } from "@/lib/validations";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { roleHome } from "@/lib/auth";
import { redirect } from "next/navigation";
import { recordSession, sessionIdFromToken } from "@/lib/session";

type AuthState = { error?: string; success?: string };

/** Record a login streak entry for the given user (at most once per calendar day). */
async function recordLoginStreak(userId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  await prisma.loginStreak.upsert({
    where: { userId_date: { userId, date: today } },
    update: {},
    create: { userId, date: today },
  });
  await prisma.user.update({
    where: { id: userId },
    data: { lastLoginAt: new Date() },
  });
}

export async function loginAction(_state: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Enter a valid email and password." };
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error || !data.user) return { error: error?.message ?? "Unable to sign in." };
  const profile = await prisma.user.findUnique({ where: { id: data.user.id } });
  if (!profile || !profile.active) {
    await supabase.auth.signOut();
    return { error: "Your Darion Academy profile is not active." };
  }
  await recordLoginStreak(profile.id);
  if (data.session?.access_token) await recordSession(profile.id, data.session.access_token);
  redirect(roleHome[profile.role]);
}

export async function loginWithEmployeeIdAction(_state: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = loginWithEmployeeIdSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Enter a valid Employee ID and password." };

  // Look up the user by Employee ID to get their email
  const user = await prisma.user.findUnique({
    where: { employeeId: parsed.data.employeeId },
    select: { id: true, email: true, active: true, role: true },
  });
  if (!user) return { error: "No account found with that Employee ID." };
  if (!user.active) return { error: "Your Darion Academy profile is not active." };

  // Authenticate with Supabase using the resolved email
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: parsed.data.password,
  });
  if (error || !data.user) return { error: error?.message ?? "Unable to sign in." };

  await recordLoginStreak(user.id);
  if (data.session?.access_token) await recordSession(user.id, data.session.access_token);
  redirect(roleHome[user.role]);
}

export async function logoutAction() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const sessionId = session?.access_token ? sessionIdFromToken(session.access_token) : null;
  if (sessionId) await prisma.userSession.updateMany({ where: { sessionId }, data: { revokedAt: new Date() } });
  await supabase.auth.signOut();
  redirect("/login");
}

export async function logoutOtherSessionsAction() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: { session } } = await supabase.auth.getSession();
  if (!user || !session) redirect("/login");
  const currentSessionId = sessionIdFromToken(session.access_token);
  const { error } = await supabase.auth.signOut({ scope: "others" });
  if (error) throw new Error(error.message);
  await prisma.userSession.updateMany({
    where: { userId: user.id, sessionId: { not: currentSessionId ?? "" }, revokedAt: null },
    data: { revokedAt: new Date() },
  });
  await prisma.activityLog.create({ data: { actorId: user.id, action: "Revoked other sessions", entityType: "UserSession" } });
}

export async function requestPasswordResetAction(_state: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email.includes("@")) return { error: "Enter a valid work email." };
  const profile = await prisma.user.findUnique({ where: { email }, select: { active: true } });
  if (!profile?.active) return { success: "If the account exists, a recovery email has been sent." };
  const supabase = await createClient();
  const redirectTo = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/auth/callback?next=/reset-password`;
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
  return error ? { error: error.message } : { success: "If the account exists, a recovery email has been sent." };
}

export async function updatePasswordAction(_state: AuthState, formData: FormData): Promise<AuthState> {
  const password = String(formData.get("password") ?? "");
  if (password.length < 8) return { error: "Password must contain at least 8 characters." };
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: error.message };
  const { data: { user } } = await supabase.auth.getUser();
  if (user) await prisma.activityLog.create({ data: { actorId: user.id, action: "Updated password", entityType: "User" } });
  return { success: "Password updated. You can continue to the academy." };
}
