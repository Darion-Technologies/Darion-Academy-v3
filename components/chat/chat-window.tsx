"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { markConversationAsReadAction, markConversationAsDeliveredAction } from "@/app/actions/chat";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { format } from "date-fns";
import { ArrowDown, Check, CheckCheck, User, PhoneMissed, Phone, Video } from "lucide-react";

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
  onUpdateCache,
}: {
  conversationId: string;
  initialMessages: Message[];
  currentUserId: string;
  participantMap: Record<string, { id: string; name: string; avatarUrl: string | null }>;
  initialRecipientStatus?: { lastReadAt: Date | null; lastDeliveredAt: Date | null } | null;
  onUpdateCache?: (updater: Message[] | ((prev: Message[]) => Message[])) => void;
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

  useEffect(() => {
    if (initialRecipientStatus) {
      setRecipientStatus(initialRecipientStatus);
    }
  }, [initialRecipientStatus]);

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
    // postgres_changes for Messages and ConversationParticipant are now handled globally in ChatApp.
    // We only need to listen for typing indicators here.

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
                  <span className="text-[9px] font-semibold text-muted-foreground bg-background px-3 py-1">
                    {format(new Date(msg.createdAt), "MMM d, yyyy")}
                  </span>
                </div>
              )}
              <div className={cn("flex w-full mt-1", isMe ? "justify-end" : "justify-start")}>
                <div className={cn("flex max-w-[80%] items-end gap-2", isMe ? "flex-row-reverse" : "flex-row")}>
                  {!isMe && (
                  <div className="w-8 shrink-0 flex items-start mt-auto mb-1">
                    {showAvatar ? (
                      <div className="relative size-8 overflow-hidden rounded-full border border-gray-100 bg-gray-50 shadow-sm">
                        <div className="absolute inset-0 flex h-full items-center justify-center text-[11px] font-bold text-gray-500">
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

                <div className={cn("flex flex-col gap-0.5 max-w-[75%]", isMe ? "items-end" : "items-start")}>
                  {showTimestamp && (
                    <div className="flex items-center gap-2 mb-1 ml-1">
                      <span className="text-[11px] text-gray-400 font-medium">{format(new Date(msg.createdAt), "EEEE h:mm a")}</span>
                    </div>
                  )}
                  <div className="flex items-end gap-1.5 w-full">
                    <div
                      className={cn(
                        "flex flex-col gap-2 px-4 py-2 w-full text-[15px] leading-[1.5] font-normal shadow-sm",
                        isMe
                          ? "bg-primary text-white rounded-[20px] rounded-br-[4px]"
                          : "bg-gray-100 text-gray-900 border border-gray-200/50 rounded-[20px] rounded-bl-[4px]",
                        isOptimistic && "opacity-70"
                      )}
                    >
                    {msg.attachmentUrl && msg.attachmentType === "image" && (
                      <a href={msg.attachmentUrl} target="_blank" rel="noopener noreferrer" className="block max-w-sm cursor-zoom-in">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={msg.attachmentUrl} 
                          alt="Attachment" 
                          className="rounded-xl border border-gray-200 object-contain max-h-64 mt-1"
                        />
                      </a>
                    )}
                    {msg.attachmentType === "call_log" ? (
                      (() => {
                        const isMissed = msg.content.includes("Missed");
                        const isVideo = msg.content.includes("Video");
                        return (
                          <div className={cn(
                            "flex items-center gap-3",
                            isMe ? "text-white" : "text-gray-900"
                          )}>
                            <div className={cn(
                              "flex size-10 items-center justify-center rounded-full bg-white/20",
                              !isMe && "bg-black/5"
                            )}>
                              {isMissed ? <PhoneMissed className={cn("size-5", isMe ? "text-white" : "text-red-500")} /> : 
                               isVideo ? <Video className="size-5" /> : 
                               <Phone className="size-5" />}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-semibold text-[15px]">{msg.content}</span>
                              <span className="text-xs opacity-80 mt-0.5">
                                {isMissed ? "Missed Call" : isVideo ? "Video Call" : "Audio Call"}
                              </span>
                            </div>
                          </div>
                        );
                      })()
                    ) : msg.content ? (
                      <div className={cn(
                        "whitespace-pre-wrap break-words",
                        isMe ? "[&_a]:text-white [&_a]:underline [&_a]:font-medium" : "[&_a]:text-primary [&_a]:underline [&_a]:font-medium"
                      )}>
                        <MarkdownRenderer content={msg.content} />
                      </div>
                    ) : null}
                    </div>
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
