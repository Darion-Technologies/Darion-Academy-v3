"use server";

import { loginSchema, loginWithEmployeeIdSchema } from "@/lib/validations";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { roleHome } from "@/lib/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { after } from "next/server";
import { UserRole } from "@/generated/prisma";
import { recordSession, sessionIdFromToken } from "@/lib/session";
import { enforceRateLimit } from "@/lib/rate-limit";

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
  const ip = (await headers()).get("x-forwarded-for") ?? "127.0.0.1";
  
  // Fire off rate limit check in background while parsing
  const rateLimitPromise = enforceRateLimit(`login_${ip}`);
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Enter a valid email and password." };

  const { success: rateLimitSuccess } = await rateLimitPromise;
  if (!rateLimitSuccess) return { error: "Too many login attempts. Please try again later." };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error || !data.user) return { error: error?.message ?? "Unable to sign in." };
  
  const role = (data.user.user_metadata?.role as UserRole) || "EMPLOYEE";
  
  // Offload database updates completely out of the request lifecycle using after
  after(async () => {
    const updatePromises: Promise<any>[] = [recordLoginStreak(data.user.id)];
    if (data.session?.access_token) {
      updatePromises.push(recordSession(data.user.id, data.session.access_token));
    }
    await Promise.allSettled(updatePromises);
  });
  
  redirect(roleHome[role]);
}

export async function loginWithEmployeeIdAction(_state: AuthState, formData: FormData): Promise<AuthState> {
  const ip = (await headers()).get("x-forwarded-for") ?? "127.0.0.1";
  const { success: rateLimitSuccess } = await enforceRateLimit(`login_${ip}`);
  if (!rateLimitSuccess) return { error: "Too many login attempts. Please try again later." };

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

  after(async () => {
    const updatePromises: Promise<any>[] = [recordLoginStreak(user.id)];
    if (data.session?.access_token) {
      updatePromises.push(recordSession(user.id, data.session.access_token));
    }
    await Promise.allSettled(updatePromises);
  });
  
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
  const confirmPassword = String(formData.get("confirmPassword") ?? "");
  if (password.length < 8) return { error: "Password must contain at least 8 characters." };
  if (password !== confirmPassword) return { error: "Passwords do not match." };
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: error.message };
  const { data: { user } } = await supabase.auth.getUser();
  if (user) await prisma.activityLog.create({ data: { actorId: user.id, action: "Updated password", entityType: "User" } });
  return { success: "Password updated. You can continue to the academy." };
}
