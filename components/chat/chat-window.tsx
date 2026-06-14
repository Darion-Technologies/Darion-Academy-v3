"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { markConversationAsReadAction } from "@/app/actions/chat";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { format } from "date-fns";
import { ArrowDown } from "lucide-react";

type Message = {
  id: string;
  senderId: string;
  content: string;
  attachmentUrl?: string | null;
  attachmentType?: string | null;
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
  const [typingUsers, setTypingUsers] = useState<Map<string, string>>(new Map());
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [showNewMessageIndicator, setShowNewMessageIndicator] = useState(false);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    if (isAtBottom) {
      scrollToBottom();
    } else if (initialMessages.length > 0) {
      const lastMsg = initialMessages[initialMessages.length - 1];
      if (lastMsg.senderId !== currentUserId) {
        setShowNewMessageIndicator(true);
      }
    }
    
    // Mark as read when we view new messages
    if (initialMessages.length > 0) {
      const lastMsg = initialMessages[initialMessages.length - 1];
      if (lastMsg.senderId !== currentUserId) {
        markConversationAsReadAction(conversationId, lastMsg.id).catch(() => {});
      }
    }
  }, [initialMessages, conversationId, currentUserId]);

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

    const typingChannel = supabase.channel(`typing_${conversationId}`)
      .on('broadcast', { event: 'typing' }, ({ payload }) => {
        if (payload.userId !== currentUserId) {
          setTypingUsers(prev => {
            const newMap = new Map(prev);
            newMap.set(payload.userId, payload.userName);
            return newMap;
          });
        }
      })
      .on('broadcast', { event: 'stop_typing' }, ({ payload }) => {
        if (payload.userId !== currentUserId) {
          setTypingUsers(prev => {
            const newMap = new Map(prev);
            newMap.delete(payload.userId);
            return newMap;
          });
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(typingChannel);
    };
  }, [conversationId, supabase, router]);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    // Consider "at bottom" if within 50px of the bottom
    const atBottom = scrollHeight - scrollTop - clientHeight < 50;
    setIsAtBottom(atBottom);
    if (atBottom) setShowNewMessageIndicator(false);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 relative" ref={scrollRef} onScroll={handleScroll}>
      {initialMessages.length === 0 ? (
        <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
          No messages here yet. Say hello!
        </div>
      ) : (
        initialMessages.map((msg, index) => {
          const isMe = msg.senderId === currentUserId;
          const prevMsg = index > 0 ? initialMessages[index - 1] : null;
          
          const timeDiff = prevMsg ? new Date(msg.createdAt).getTime() - new Date(prevMsg.createdAt).getTime() : 0;
          const showTimestamp = !prevMsg || timeDiff > 5 * 60 * 1000; // 5 minutes
          const showAvatar = !isMe && (!prevMsg || prevMsg.senderId !== msg.senderId || showTimestamp);

          return (
            <div key={msg.id} className="flex flex-col w-full">
              {showTimestamp && (
                <div className="flex justify-center my-4">
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground bg-muted/30 px-2 py-1 rounded-none border border-border">
                    {format(new Date(msg.createdAt), "MMM d, h:mm a")}
                  </span>
                </div>
              )}
              <div className={cn("flex w-full mt-1", isMe ? "justify-end" : "justify-start")}>
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
                    "flex flex-col gap-2 px-4 py-3 text-sm border rounded-none max-w-full",
                    isMe
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted text-foreground border-border"
                  )}
                >
                  {msg.attachmentUrl && msg.attachmentType === "image" && (
                    <a href={msg.attachmentUrl} target="_blank" rel="noopener noreferrer" className="block max-w-sm cursor-zoom-in">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={msg.attachmentUrl} 
                        alt="Attachment" 
                        className="rounded-none border border-border object-contain max-h-64"
                      />
                    </a>
                  )}
                  {msg.content && (
                    <div className={cn("prose prose-sm max-w-none dark:prose-invert", isMe && "prose-invert")}>
                      <MarkdownRenderer content={msg.content} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          );
        })
      )}
      
      {Array.from(typingUsers.values()).length > 0 && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground animate-pulse">
          <div className="flex gap-1">
            <span className="size-1.5 rounded-full bg-primary/60"></span>
            <span className="size-1.5 rounded-full bg-primary/60"></span>
            <span className="size-1.5 rounded-full bg-primary/60"></span>
          </div>
          <span>
            {Array.from(typingUsers.values()).join(", ")} {typingUsers.size === 1 ? "is" : "are"} typing...
          </span>
        </div>
      )}
      
      {showNewMessageIndicator && (
        <div className="sticky bottom-4 flex justify-center mt-4">
          <button
            onClick={() => {
              scrollToBottom();
              setShowNewMessageIndicator(false);
            }}
            className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-lg hover:bg-primary/90 transition-transform animate-bounce"
          >
            New message <ArrowDown className="size-3" />
          </button>
        </div>
      )}
    </div>
  );
}
