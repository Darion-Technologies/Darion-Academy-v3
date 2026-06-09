"use server";

import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendPushNotification } from "@/lib/push";

export async function sendManualNotificationAction(formData: FormData) {
  const user = await requireUser();
  
  if (user.role !== "ADMIN" && user.role !== "MENTOR") {
    throw new Error("Unauthorized: Only admins and mentors can send notifications.");
  }

  const targetUserId = String(formData.get("userId") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (!targetUserId || !title || !message) {
    throw new Error("Missing required fields.");
  }

  if (user.role === "MENTOR") {
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        mentorId: user.id,
        learnerId: targetUserId,
      },
    });

    if (!enrollment) {
      throw new Error("Unauthorized: You can only notify learners assigned to you.");
    }
  }

  const notification = await prisma.notification.create({
    data: {
      userId: targetUserId,
      type: "GENERAL",
      title,
      message,
    },
  });

  await prisma.activityLog.create({
    data: {
      actorId: user.id,
      action: "Sent manual notification",
      entityType: "Notification",
      entityId: notification.id,
      metadata: { targetUserId },
    },
  });

  await sendPushNotification(targetUserId, {
    title,
    body: message,
    url: "/notifications",
  });

  return { success: true };
}
