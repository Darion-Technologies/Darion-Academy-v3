"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

export function RealtimeSync({ userId }: { userId: string }) {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`academy-user-${userId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "Notification", filter: `userId=eq.${userId}` },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const notification = payload.new as { title?: string; message?: string };
            toast.info(notification.title ?? "Academy update", { description: notification.message });
          }
          router.refresh();
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "Enrollment", filter: `learnerId=eq.${userId}` },
        () => router.refresh(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "Certificate", filter: `userId=eq.${userId}` },
        () => router.refresh(),
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [router, userId]);

  return null;
}
