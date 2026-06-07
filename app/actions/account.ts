"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logoutOtherSessionsAction } from "@/app/actions/auth";
import { parseAppearancePreference } from "@/lib/appearance";

export async function markNotificationReadAction(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  await prisma.notification.updateMany({ where: { id, userId: user.id }, data: { read: true } });
  revalidatePath("/notifications");
}

export async function updateProfileAction(formData: FormData) {
  const user = await requireUser();
  const name = String(formData.get("name") ?? "").trim();
  if (name.length < 2) throw new Error("Name is required.");
  await prisma.user.update({ where: { id: user.id }, data: { name } });
  await prisma.activityLog.create({ data: { actorId: user.id, action: "Updated profile", entityType: "User", entityId: user.id } });
  revalidatePath("/settings");
}

export async function updatePreferencesAction(formData: FormData) {
  const user = await requireUser();
  await prisma.learningPreference.upsert({
    where: { userId: user.id },
    update: {
      resumeLastLesson: formData.get("resumeLastLesson") === "on",
      defaultLessonView: String(formData.get("defaultLessonView") ?? "STANDARD"),
      courseReminders: formData.get("courseReminders") === "on",
      reviewUpdates: formData.get("reviewUpdates") === "on",
      certificateAlerts: formData.get("certificateAlerts") === "on",
    },
    create: {
      userId: user.id,
      resumeLastLesson: formData.get("resumeLastLesson") === "on",
      defaultLessonView: String(formData.get("defaultLessonView") ?? "STANDARD"),
      courseReminders: formData.get("courseReminders") === "on",
      reviewUpdates: formData.get("reviewUpdates") === "on",
      certificateAlerts: formData.get("certificateAlerts") === "on",
    },
  });
  revalidatePath("/settings");
}

export async function updateAppearanceAction(formData: FormData) {
  const user = await requireUser();
  const { theme, sidebarCollapsed } = parseAppearancePreference({
    theme: formData.get("theme")?.toString(),
    sidebarCollapsed: formData.get("sidebarCollapsed")?.toString(),
  });
  await prisma.learningPreference.upsert({
    where: { userId: user.id },
    update: {
      ...(theme ? { theme } : {}),
      ...(sidebarCollapsed === null ? {} : { sidebarCollapsed }),
    },
    create: {
      userId: user.id,
      ...(theme ? { theme } : {}),
      ...(sidebarCollapsed === null ? {} : { sidebarCollapsed }),
    },
  });
  revalidatePath("/settings");
}

export async function revokeSessionAction(formData: FormData) {
  const user = await requireUser();
  const sessionId = String(formData.get("sessionId") ?? "");
  await prisma.userSession.updateMany({
    where: { sessionId, userId: user.id },
    data: { revokedAt: new Date() },
  });
  revalidatePath("/settings");
}

export { logoutOtherSessionsAction };
