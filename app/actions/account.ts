"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
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
  const department = String(formData.get("department") ?? "").trim();
  const employeeId = String(formData.get("employeeId") ?? "").trim();
  if (name.length < 2) throw new Error("Name is required.");
  
  await prisma.user.update({ 
    where: { id: user.id }, 
    data: { name, department: department || null, employeeId: employeeId || null } 
  });
  
  await prisma.activityLog.create({ 
    data: { actorId: user.id, action: "Updated profile", entityType: "User", entityId: user.id } 
  });
  revalidatePath("/settings");
}

export async function uploadAvatarAction(formData: FormData) {
  const user = await requireUser();
  const file = formData.get("avatar") as File | null;
  
  if (!file || file.size === 0) {
    throw new Error("No file uploaded.");
  }
  if (!file.type.startsWith("image/")) {
    throw new Error("File must be an image.");
  }
  if (file.size > 5 * 1024 * 1024) { // 5MB limit
    throw new Error("Avatar must be under 5MB.");
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  
  // Dynamically import node native modules to prevent Turbopack client-side bundling errors
  const { writeFile, mkdir } = await import("fs/promises");
  const { join } = await import("path");
  
  // Save locally to public/avatars folder
  const uploadDir = join(process.cwd(), "public", "avatars");
  await mkdir(uploadDir, { recursive: true });
  
  // Create a unique filename
  const extension = file.type.split("/")[1] || "jpg";
  const filename = `${user.id}-${Date.now()}.${extension}`;
  const filePath = join(uploadDir, filename);
  
  await writeFile(filePath, buffer);
  
  const avatarUrl = `/avatars/${filename}`;
  
  await prisma.user.update({
    where: { id: user.id },
    data: { avatarUrl }
  });
  
  revalidatePath("/settings");
  return { success: true, avatarUrl };
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
