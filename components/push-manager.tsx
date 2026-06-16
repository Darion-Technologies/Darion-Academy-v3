"use client";

import { useEffect, useState } from "react";
import { Bell, BellRing, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { savePushSubscriptionAction } from "@/app/actions/push";
import { urlBase64ToUint8Array } from "@/lib/utils";

export function PushManager() {
  const [isSupported, setIsSupported] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      setIsSupported(true);
      checkSubscription();
    } else {
      setLoading(false);
    }
  }, []);

  async function checkSubscription() {
    try {
      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.getSubscription();
      setSubscription(sub);
      
      // If we have a subscription, make sure the server has it too
      if (sub) {
        await savePushSubscriptionAction(JSON.parse(JSON.stringify(sub)));
      }
    } catch (err) {
      console.error("Error checking push subscription:", err);
    } finally {
      setLoading(false);
    }
  }

  async function subscribe() {
    setLoading(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        toast.error("You need to allow notifications to use this feature.");
        setLoading(false);
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      
      if (!vapidPublicKey) {
        throw new Error("Missing VAPID public key");
      }

      const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);
      
      const newSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey,
      });

      await savePushSubscriptionAction(JSON.parse(JSON.stringify(newSubscription)));
      setSubscription(newSubscription);
      toast.success("Push notifications enabled!");
    } catch (err) {
      console.error("Failed to subscribe to push notifications:", err);
      toast.error("Failed to enable notifications. Please check your browser settings.");
    } finally {
      setLoading(false);
    }
  }

  if (!isSupported) return null;

  if (loading) {
    return (
      <Button variant="ghost" size="icon" disabled className="relative h-8 w-8 rounded-full">
        <Loader2 className="size-4 animate-spin text-muted-foreground" />
      </Button>
    );
  }

  if (subscription) {
    return (
      <Button variant="ghost" size="icon" className="relative h-8 w-8 rounded-full text-primary" title="Notifications Enabled">
        <BellRing className="size-4" />
      </Button>
    );
  }

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={subscribe}
      className="h-8 gap-2 text-xs rounded-full border-primary/20 text-primary hover:bg-primary/10 transition-colors"
    >
      <Bell className="size-3.5" />
      Enable Push
    </Button>
  );
}
