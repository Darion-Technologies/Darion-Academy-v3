"use server";

import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function savePushSubscriptionAction(subscription: any) {
  const user = await requireUser();

  if (!subscription || !subscription.endpoint || !subscription.keys) {
    throw new Error("Invalid subscription object");
  }

  // Prevent duplicate subscriptions for the exact same endpoint
  await prisma.pushSubscription.upsert({
    where: { endpoint: subscription.endpoint },
    update: {
      userId: user.id,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
    },
    create: {
      userId: user.id,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
    },
  });

  return { success: true };
}

export async function removePushSubscriptionAction(endpoint: string) {
  const user = await requireUser();

  await prisma.pushSubscription.deleteMany({
    where: {
      endpoint,
      userId: user.id,
    },
  });

  return { success: true };
}

export async function testPushNotificationAction() {
  const user = await requireUser();
  const { sendPushNotification } = await import("@/lib/push");
  
  await sendPushNotification(user.id, {
    title: "Test Notification",
    body: "Web Push Notifications are working correctly!",
    url: "/settings",
  });
  
  return { success: true };
}
