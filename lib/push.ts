import webpush from "web-push";
import { prisma } from "@/lib/prisma";

const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || "";
const vapidSubject = process.env.VAPID_SUBJECT || "mailto:admin@darion.in";

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
}

const EXPO_PUSH_API = "https://exp.host/--/api/v2/push/send";

/** Send to both Web Push subscribers and Expo mobile devices */
export async function sendPushNotification(
  userId: string,
  payload: { title: string; body: string; url?: string; icon?: string }
) {
  await Promise.allSettled([
    sendWebPush(userId, payload),
    sendExpoPush(userId, payload),
  ]);
}

async function sendWebPush(
  userId: string,
  payload: { title: string; body: string; url?: string; icon?: string }
) {
  if (!vapidPublicKey || !vapidPrivateKey) return;

  const subscriptions = await prisma.pushSubscription.findMany({ where: { userId } });
  if (subscriptions.length === 0) return;

  const pushPayload = JSON.stringify(payload);

  await Promise.allSettled(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          pushPayload
        );
      } catch (error: any) {
        if (error.statusCode === 404 || error.statusCode === 410) {
          await prisma.pushSubscription.delete({ where: { id: sub.id } });
        } else {
          console.error("Web push error:", error);
        }
      }
    })
  );
}

async function sendExpoPush(
  userId: string,
  payload: { title: string; body: string; url?: string }
) {
  const tokens = await prisma.expoPushToken.findMany({ where: { userId } });
  if (tokens.length === 0) return;

  const messages = tokens.map((t) => ({
    to: t.token,
    sound: "default" as const,
    title: payload.title,
    body: payload.body,
    data: payload.url ? { url: payload.url } : {},
    priority: "high" as const,
  }));

  try {
    const res = await fetch(EXPO_PUSH_API, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(messages),
    });

    if (!res.ok) {
      console.error("Expo push error:", await res.text());
      return;
    }

    const data = await res.json();

    // Clean up invalid/unregistered tokens automatically
    const results: any[] = data.data ?? [];
    await Promise.allSettled(
      results.map(async (result, i) => {
        if (result.status === "error" && result.details?.error === "DeviceNotRegistered") {
          const token = tokens[i]?.token;
          if (token) await prisma.expoPushToken.deleteMany({ where: { token } });
        }
      })
    );
  } catch (err) {
    console.error("Expo push fetch error:", err);
  }
}
