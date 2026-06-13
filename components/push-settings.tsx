"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { BellRing, BellOff } from "lucide-react";
import { savePushSubscriptionAction, removePushSubscriptionAction, testPushNotificationAction } from "@/app/actions/push";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function PushSettings() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  async function checkSubscription() {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    } catch (error) {
      console.error("Error checking subscription:", error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      setIsSupported(true);
      checkSubscription();
    } else {
      setIsLoading(false);
    }
  }, []);

  async function handleToggle() {
    setIsLoading(true);
    try {
      if (isSubscribed) {
        await unsubscribe();
      } else {
        await subscribe();
      }
    } catch (error: any) {
      toast.error("Failed to update push settings", { description: error.message });
    } finally {
      setIsLoading(false);
    }
  }

  async function subscribe() {
    if (!VAPID_PUBLIC_KEY) {
      throw new Error("VAPID public key not configured.");
    }
    
    // Request permission explicitly first for better UX
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      throw new Error("Notification permission denied by user.");
    }

    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });

    await savePushSubscriptionAction(JSON.parse(JSON.stringify(subscription)));
    setIsSubscribed(true);
    toast.success("Push notifications enabled!");
  }

  async function unsubscribe() {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    if (subscription) {
      await removePushSubscriptionAction(subscription.endpoint);
      await subscription.unsubscribe();
    }
    setIsSubscribed(false);
    toast.success("Push notifications disabled.");
  }

  async function sendTest() {
    toast.promise(testPushNotificationAction(), {
      loading: "Sending test notification...",
      success: "Test notification sent! Check your device.",
      error: "Failed to send test notification.",
    });
  }

  if (!isSupported) {
    return (
      <div className="border bg-muted/50 p-4 text-sm text-muted-foreground">
        Push notifications are not supported in this browser or device.
        <br />
        <span className="text-xs opacity-80">(On iOS, you must "Add to Home Screen" first)</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label className="text-base">Browser Notifications</Label>
          <p className="text-sm text-muted-foreground">
            Receive native OS alerts for important updates.
          </p>
        </div>
        <Button
          variant={isSubscribed ? "outline" : "default"}
          onClick={handleToggle}
          disabled={isLoading}
        >
          {isSubscribed ? (
            <><BellOff className="mr-2 h-4 w-4" /> Disable</>
          ) : (
            <><BellRing className="mr-2 h-4 w-4" /> Enable</>
          )}
        </Button>
      </div>

      {isSubscribed && (
        <div className="flex items-center justify-between border bg-card p-3">
          <p className="text-sm font-medium">Test Connection</p>
          <Button variant="secondary" size="sm" onClick={sendTest}>
            Send Test Alert
          </Button>
        </div>
      )}
    </div>
  );
}
