"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type Message = {
  id: string;
  senderId: string;
  content: string;
  createdAt: Date;
  sender: { id: string; name: string; avatarUrl: string | null };
};

export function ChatWindow({
  conversationId,
  initialMessages,
  currentUserId,
}: {
  conversationId: string;
  initialMessages: Message[];
  currentUserId: string;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [initialMessages]);

  useEffect(() => {
    const channel = supabase
      .channel(`chat_${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "Message",
          filter: `conversationId=eq.${conversationId}`,
        },
        () => {
          router.refresh(); // Refresh the page data from server
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, supabase, router]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
      {initialMessages.length === 0 ? (
        <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
          No messages here yet. Say hello!
        </div>
      ) : (
        initialMessages.map((msg, index) => {
          const isMe = msg.senderId === currentUserId;
          const showAvatar = !isMe && (index === 0 || initialMessages[index - 1].senderId !== msg.senderId);

          return (
            <div key={msg.id} className={cn("flex w-full", isMe ? "justify-end" : "justify-start")}>
              <div className={cn("flex max-w-[80%] items-end gap-2", isMe ? "flex-row-reverse" : "flex-row")}>
                {!isMe && (
                  <div className="w-8 shrink-0">
                    {showAvatar ? (
                      <div className="relative size-8 overflow-hidden rounded-none bg-muted border border-border">
                        <div className="absolute inset-0 flex h-full items-center justify-center text-[10px] font-bold text-foreground">
                          {msg.sender.name.substring(0, 2).toUpperCase()}
                        </div>
                        {msg.sender.avatarUrl && (
                          <img 
                            src={msg.sender.avatarUrl} 
                            alt="" 
                            width={32} 
                            height={32} 
                            className="relative z-10 size-full object-cover" 
                            onError={(e) => { e.currentTarget.style.display = 'none'; }} 
                          />
                        )}
                      </div>
                    ) : (
                      <div className="size-8" />
                    )}
                  </div>
                )}

                <div
                  className={cn(
                    "flex flex-col gap-1 px-4 py-2 text-sm border rounded-none",
                    isMe
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted text-foreground border-border"
                  )}
                >
                  <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
