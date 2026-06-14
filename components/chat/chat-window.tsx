"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { markConversationAsReadAction, markConversationAsDeliveredAction } from "@/app/actions/chat";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { format } from "date-fns";
import { ArrowDown, Check, CheckCheck } from "lucide-react";

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
  participantMap,
  initialRecipientStatus,
}: {
  conversationId: string;
  initialMessages: Message[];
  currentUserId: string;
  participantMap: Record<string, { id: string; name: string; avatarUrl: string | null }>;
  initialRecipientStatus?: { lastReadAt: Date | null; lastDeliveredAt: Date | null } | null;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const supabase = createClient();
  const [typingUsers, setTypingUsers] = useState<Map<string, string>>(new Map());
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [showNewMessageIndicator, setShowNewMessageIndicator] = useState(false);
  const [liveMessages, setLiveMessages] = useState<Message[]>(initialMessages);
  const [optimisticMessages, setOptimisticMessages] = useState<Message[]>([]);
  const [recipientStatus, setRecipientStatus] = useState(initialRecipientStatus || { lastReadAt: null, lastDeliveredAt: null });

  useEffect(() => {
    const handleOptimisticMsg = (e: Event) => {
      const customEvent = e as CustomEvent<Message>;
      if (customEvent.detail) {
        setOptimisticMessages((prev) => [...prev, customEvent.detail]);
      }
    };
    window.addEventListener("optimistic_chat_message", handleOptimisticMsg);
    return () => window.removeEventListener("optimistic_chat_message", handleOptimisticMsg);
  }, []);

  useEffect(() => {
    // Sync liveMessages when initialMessages change (e.g. from server action revalidation)
    setLiveMessages(initialMessages);
    // Clear optimistic messages when the real messages update from the server
    setOptimisticMessages([]);
  }, [initialMessages]);

  const allMessages = [...liveMessages, ...optimisticMessages];

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    // Clear optimistic messages when the real messages update from the server
    setOptimisticMessages([]);
    
    if (isAtBottom) {
      scrollToBottom();
    } else if (allMessages.length > 0) {
      const lastMsg = allMessages[allMessages.length - 1];
      if (lastMsg.senderId !== currentUserId) {
        setShowNewMessageIndicator(true);
      }
    }
    
    // Mark as read and delivered when we view new messages
    if (allMessages.length > 0) {
      const lastMsg = allMessages[allMessages.length - 1];
      if (lastMsg.senderId !== currentUserId && !lastMsg.id.startsWith("opt-")) {
        markConversationAsReadAction(conversationId, lastMsg.id).catch(() => {});
      }
    }
  }, [liveMessages, conversationId, currentUserId]);

  useEffect(() => {
    const channel = supabase
      .channel(`chat_${conversationId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "Message", filter: `conversationId=eq.${conversationId}` },
        (payload) => {
          const newMsg = payload.new as any;
          // Build full message from payload
          const fullMessage: Message = {
            id: newMsg.id,
            senderId: newMsg.senderId,
            content: newMsg.content,
            attachmentUrl: newMsg.attachmentUrl,
            attachmentType: newMsg.attachmentType,
            createdAt: new Date(newMsg.createdAt),
            sender: participantMap[newMsg.senderId] || { id: newMsg.senderId, name: "Unknown", avatarUrl: null },
          };
          
          setLiveMessages(prev => {
            if (prev.find(m => m.id === fullMessage.id)) return prev; // Avoid duplicates
            return [...prev, fullMessage];
          });
          
          // Silently trigger delivery receipt
          if (newMsg.senderId !== currentUserId) {
            markConversationAsDeliveredAction(conversationId).catch(() => {});
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "ConversationParticipant", filter: `conversationId=eq.${conversationId}` },
        (payload) => {
          const updatedParticipant = payload.new as any;
          if (updatedParticipant.userId !== currentUserId) {
            setRecipientStatus({
              lastReadAt: updatedParticipant.lastReadAt ? new Date(updatedParticipant.lastReadAt) : null,
              lastDeliveredAt: updatedParticipant.lastDeliveredAt ? new Date(updatedParticipant.lastDeliveredAt) : null,
            });
          }
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
      {allMessages.length === 0 ? (
        <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
          No messages here yet. Say hello!
        </div>
      ) : (
        allMessages.map((msg, index) => {
          const isMe = msg.senderId === currentUserId;
          const prevMsg = index > 0 ? allMessages[index - 1] : null;
          
          const timeDiff = prevMsg ? new Date(msg.createdAt).getTime() - new Date(prevMsg.createdAt).getTime() : 0;
          const showTimestamp = !prevMsg || timeDiff > 5 * 60 * 1000; // 5 minutes
          const showAvatar = !isMe && (!prevMsg || prevMsg.senderId !== msg.senderId || showTimestamp);

          const isOptimistic = msg.id.startsWith("opt-");
          
          // Determine ticks
          let tickIcon = null;
          if (isMe) {
            if (isOptimistic) {
              tickIcon = <Check className="size-3 text-muted-foreground opacity-50" />;
            } else if (recipientStatus.lastReadAt && new Date(msg.createdAt) <= recipientStatus.lastReadAt) {
              tickIcon = <CheckCheck className="size-3 text-blue-500" />;
            } else if (recipientStatus.lastDeliveredAt && new Date(msg.createdAt) <= recipientStatus.lastDeliveredAt) {
              tickIcon = <CheckCheck className="size-3 text-muted-foreground" />;
            } else {
              tickIcon = <Check className="size-3 text-muted-foreground" />;
            }
          }

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

                <div className="flex flex-col gap-1 items-end max-w-full">
                  <div
                    className={cn(
                      "flex flex-col gap-2 px-4 py-3 text-sm border rounded-none w-full",
                      isMe
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted text-foreground border-border",
                      isOptimistic && "opacity-70"
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
                  {isMe && tickIcon && (
                    <div className="mt-0.5 px-1">{tickIcon}</div>
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
