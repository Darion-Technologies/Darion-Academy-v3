import webpush from "web-push";
import { prisma } from "@/lib/prisma";

const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || "";
const vapidSubject = process.env.VAPID_SUBJECT || "mailto:admin@darion.in";

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
}

export async function sendPushNotification(userId: string, payload: { title: string; body: string; url?: string; icon?: string }) {
  if (!vapidPublicKey || !vapidPrivateKey) {
    console.warn("VAPID keys not configured. Skipping push notification.");
    return;
  }

  const subscriptions = await prisma.pushSubscription.findMany({
    where: { userId },
  });

  if (subscriptions.length === 0) return;

  const pushPayload = JSON.stringify(payload);

  const sendPromises = subscriptions.map(async (sub) => {
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth,
          },
        },
        pushPayload
      );
    } catch (error: any) {
      if (error.statusCode === 404 || error.statusCode === 410) {
        // Subscription has expired or is no longer valid
        console.log(`Subscription ${sub.id} expired. Removing...`);
        await prisma.pushSubscription.delete({ where: { id: sub.id } });
      } else {
        console.error("Error sending push notification:", error);
      }
    }
  });

  await Promise.allSettled(sendPromises);
}
