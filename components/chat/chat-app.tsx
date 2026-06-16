"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ChatSidebar } from "@/components/chat/chat-sidebar";
import { ChatWindow } from "@/components/chat/chat-window";
import { ChatInput } from "@/components/chat/chat-input";
import { ChatInfoSidebar } from "@/components/chat/chat-info-sidebar";
import { getMessagesAction, markConversationAsDeliveredAction, getConversationsAction } from "@/app/actions/chat";
import { MessageSquare, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { IncomingCallToast } from "@/components/chat/incoming-call-toast";
import { CallOverlay } from "@/components/chat/call-overlay";

export function ChatApp({
  initialConversations,
  currentUserId,
  currentUserName,
}: {
  initialConversations: any[];
  currentUserId: string;
  currentUserName: string;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [infoSidebarOpen, setInfoSidebarOpen] = useState(false);
  
  // Read initial ID from URL, if any
  const urlId = searchParams.get("id");
  const [activeConversationId, setActiveConversationId] = useState<string | null>(urlId || null);
  
  const [liveConversations, setLiveConversations] = useState<any[]>(initialConversations);
  
  // Cache of messages per conversation
  const [messagesCache, setMessagesCache] = useState<Record<string, any[]>>({});
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  // Call State
  const [activeCall, setActiveCall] = useState<{
    conversationId: string;
    recipientId: string;
    recipientName: string;
    recipientAvatar?: string;
    isInitiator: boolean;
    isVideoCall: boolean;
  } | null>(null);

  const startCall = (isVideo: boolean) => {
    // activeConversation gets derived later, but we can find it
    const activeConv = liveConversations.find(c => c.id === activeConversationId);
    if (!activeConv) return;
    
    const recip = activeConv.participants.find((p: any) => p.userId !== currentUserId)?.user;
    if (!recip) return;

    // Set UI state first so it feels instant
    setActiveCall({
      conversationId: activeConv.id,
      recipientId: recip.id,
      recipientName: recip.name,
      recipientAvatar: recip.avatarUrl,
      isInitiator: true,
      isVideoCall: isVideo
    });

    const supabase = createClient();
    const channel = supabase.channel(`user:${recip.id}`, { config: { broadcast: { ack: true } } });
    channel.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        await channel.send({
          type: "broadcast",
          event: "incoming-call",
          payload: { 
            conversationId: activeConv.id, 
            from: currentUserId, 
            isVideo 
          }
        });
      }
    });
  };

  const handleAcceptCall = (conversationId: string, initiatorId: string, isVideo: boolean) => {
    const conv = liveConversations.find(c => c.id === conversationId);
    if (!conv) return;
    
    const caller = conv.participants.find((p: any) => p.userId === initiatorId)?.user;
    if (!caller) return;

    setActiveCall({
      conversationId,
      recipientId: caller.id,
      recipientName: caller.name,
      recipientAvatar: caller.avatarUrl,
      isInitiator: false,
      isVideoCall: isVideo
    });
  };

  const handleDeclineCall = (conversationId: string, initiatorId: string) => {
    const supabase = createClient();
    const channel = supabase.channel(`call:${conversationId}`);
    channel.subscribe((status) => {
      if (status === "SUBSCRIBED") {
        channel.send({
          type: "broadcast",
          event: "webrtc-signal",
          payload: { type: "end-call", to: initiatorId, from: currentUserId }
        });
      }
    });
  };

  // Sync URL when activeConversationId changes
  useEffect(() => {
    if (activeConversationId) {
      if (searchParams.get("id") !== activeConversationId) {
        // Use shallow routing to update URL without triggering a full page reload
        window.history.pushState(null, '', `/chat?id=${activeConversationId}`);
      }
    } else {
      if (searchParams.has("id")) {
        window.history.pushState(null, '', `/chat`);
      }
    }
  }, [activeConversationId, searchParams]);

  // Sync state if user uses browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      setActiveConversationId(params.get("id") || null);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Fetch messages if not in cache
  useEffect(() => {
    if (!activeConversationId) return;

    if (!messagesCache[activeConversationId]) {
      let isMounted = true;
      setIsLoadingMessages(true);
      
      getMessagesAction(activeConversationId)
        .then((messages) => {
          if (isMounted) {
            setMessagesCache((prev) => ({
              ...prev,
              [activeConversationId]: messages,
            }));
            setIsLoadingMessages(false);
          }
        })
        .catch((err) => {
          console.error("Failed to fetch messages", err);
          if (isMounted) setIsLoadingMessages(false);
        });
        
      return () => {
        isMounted = false;
        };
    }
  }, [activeConversationId, messagesCache]);

  // GLOBAL REALTIME MULTIPLEXER
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase.channel(`global_user_${currentUserId}`);

    // Listen for new messages across ALL conversations
    liveConversations.forEach(conv => {
      // 1. Message Insert
      channel.on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "Message", filter: `conversationId=eq.${conv.id}` },
        (payload) => {
          const newMsg = payload.new as any;
          
          // Build full message from payload (we need sender details)
          // We can try to find the sender in the conversation participants
          const senderParticipant = conv.participants.find((p: any) => p.userId === newMsg.senderId);
          const fullMessage = {
            id: newMsg.id,
            senderId: newMsg.senderId,
            content: newMsg.content,
            attachmentUrl: newMsg.attachmentUrl,
            attachmentType: newMsg.attachmentType,
            createdAt: new Date(newMsg.createdAt),
            sender: senderParticipant?.user || { id: newMsg.senderId, name: "Unknown", avatarUrl: null },
          };

          // Update messages cache silently in the background
          setMessagesCache(prev => {
            const current = prev[conv.id] || [];
            if (current.find(m => m.id === fullMessage.id)) return prev;
            return { ...prev, [conv.id]: [...current, fullMessage] };
          });

          // Move conversation to top and update unread count
          setLiveConversations(prev => {
            const updated = prev.map(c => {
              if (c.id === conv.id) {
                const isBackground = activeConversationId !== conv.id;
                const isFromOther = newMsg.senderId !== currentUserId;
                return {
                  ...c,
                  messages: [fullMessage], // Update preview
                  updatedAt: new Date(newMsg.createdAt),
                  unreadCount: (isBackground && isFromOther) ? (c.unreadCount || 0) + 1 : c.unreadCount
                };
              }
              return c;
            });
            // Sort by updatedAt descending
            return updated.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
          });

          // Global Delivery Receipt: If we receive a background message, mark it as delivered!
          if (newMsg.senderId !== currentUserId) {
            markConversationAsDeliveredAction(conv.id).catch(() => {});
          }
        }
      );

      // 2. ConversationParticipant Update (For Read/Delivered Receipts)
      channel.on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "ConversationParticipant", filter: `conversationId=eq.${conv.id}` },
        (payload) => {
          const updatedParticipant = payload.new as any;
          
          setLiveConversations(prev => prev.map(c => {
            if (c.id === conv.id) {
              const newParticipants = c.participants.map((p: any) => {
                if (p.userId === updatedParticipant.userId) {
                  return {
                    ...p,
                    lastReadAt: updatedParticipant.lastReadAt,
                    lastDeliveredAt: updatedParticipant.lastDeliveredAt,
                  };
                }
                return p;
              });
              return { ...c, participants: newParticipants };
            }
            return c;
          }));
        }
      );
    });

    // 3. Listen for new ConversationParticipant rows for US (Added to a new group/chat)
    channel.on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "ConversationParticipant", filter: `userId=eq.${currentUserId}` },
      () => {
        // We were added to a new conversation, re-fetch the list!
        getConversationsAction().then(setLiveConversations).catch(() => {});
      }
    );

    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [liveConversations, currentUserId, activeConversationId]);

  const activeConversation = liveConversations.find(c => c.id === activeConversationId);
  
  const participantMap = activeConversation?.participants.reduce((acc: any, p: any) => {
    acc[p.userId] = p.user;
    return acc;
  }, {} as Record<string, any>) || {};
  
  const recipient = activeConversation?.participants.find((p: any) => p.userId !== currentUserId);
  const initialRecipientStatus = recipient ? {
    lastReadAt: recipient.lastReadAt,
    lastDeliveredAt: recipient.lastDeliveredAt
  } : null;

  return (
    <>
      <ChatSidebar 
        initialConversations={liveConversations} 
        currentUserId={currentUserId} 
        activeConversationId={activeConversationId}
        onSelectConversation={(id) => setActiveConversationId(id)}
      />
      
      <div className="flex flex-1 flex-col overflow-hidden relative bg-card">
        {!activeConversationId ? (
          <div className="flex h-full flex-col items-center justify-center text-muted-foreground p-8">
            <div className="flex size-16 items-center justify-center rounded-none bg-muted mb-4 border border-border">
              <MessageSquare className="size-8 text-foreground" />
            </div>
            <h3 className="text-lg font-bold text-foreground">Your Messages</h3>
            <p className="text-sm mt-2 text-center max-w-sm">
              Select a conversation from the sidebar to start chatting or create a new one.
            </p>
          </div>
        ) : isLoadingMessages && !messagesCache[activeConversationId] ? (
          <div className="flex h-full flex-col items-center justify-center text-muted-foreground p-8">
            <Loader2 className="size-8 animate-spin text-primary mb-4" />
            <p className="text-sm">Loading conversation...</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between border-b border-border px-3 py-2 bg-card h-12 shrink-0 z-10">
              <button 
                className="flex items-center gap-2.5 hover:bg-muted/50 p-1 -ml-1 rounded transition-colors text-left"
                onClick={() => setInfoSidebarOpen(!infoSidebarOpen)}
              >
                <div className="relative size-8 rounded-none overflow-hidden border border-border bg-secondary">
                  {activeConversation?.type === "GROUP" ? (
                    <div className="flex size-full items-center justify-center bg-muted text-foreground">
                      <svg className="size-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                    </div>
                  ) : recipient?.user?.avatarUrl ? (
                    <img src={recipient.user.avatarUrl} alt="" className="size-full object-cover" />
                  ) : (
                    <div className="flex size-full items-center justify-center bg-muted text-foreground font-bold text-xs">
                      {(recipient?.user?.name || "C").substring(0, 2).toUpperCase()}
                    </div>
                  )}
                  {activeConversation?.type !== "GROUP" && (
                    <span className="absolute bottom-0 right-0 block size-2 rounded-none bg-green-500 border border-card"></span>
                  )}
                </div>
                <div className="flex flex-col">
                  <h2 className="text-[12px] font-bold text-foreground leading-tight">
                    {activeConversation?.type === "GROUP" ? (activeConversation.name || "Group Chat") : recipient?.user?.name || "Chat"}
                  </h2>
                  <span className="text-[9px] text-muted-foreground leading-tight mt-0.5">
                    {activeConversation?.type === "GROUP" ? `${activeConversation.participants.length} members` : "Active now"}
                  </span>
                </div>
              </button>
              <div className="flex items-center gap-1.5">
                <button 
                  onClick={() => startCall(false)}
                  className="size-7 rounded-none flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors border border-border"
                >
                  <svg className="size-3.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                </button>
                <button 
                  onClick={() => startCall(true)}
                  className="size-7 rounded-none flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors border border-border"
                >
                  <svg className="size-3.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5"/><rect x="2" y="6" width="14" height="12" rx="2" ry="2"/></svg>
                </button>
                <button className="size-7 rounded-none flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors border border-border">
                  <svg className="size-3.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
                </button>
                <button 
                  onClick={() => setInfoSidebarOpen(!infoSidebarOpen)}
                  className="size-7 rounded-none flex items-center justify-center text-foreground bg-muted hover:bg-muted/80 transition-colors border border-border xl:hidden"
                >
                  <svg className="size-3.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="15" x2="15" y1="3" y2="21"/></svg>
                </button>
              </div>
            </div>
            
            {/* The key forces a fresh mount if we switch conversations, but keeps the DOM intact for speed */}
            <ChatWindow
              key={activeConversationId}
              conversationId={activeConversationId}
              initialMessages={messagesCache[activeConversationId] || []}
              currentUserId={currentUserId}
              participantMap={participantMap}
              initialRecipientStatus={initialRecipientStatus}
              onUpdateCache={(updater) => {
                setMessagesCache(prev => {
                  const current = prev[activeConversationId] || [];
                  const updated = typeof updater === 'function' ? updater(current) : updater;
                  return { ...prev, [activeConversationId]: updated };
                });
              }}
            />
            
            <div className="px-3 pb-3 bg-card">
              <ChatInput 
                key={`input-${activeConversationId}`}
                conversationId={activeConversationId} 
                currentUserId={currentUserId} 
                currentUserName={currentUserName} 
              />
            </div>

            {/* Calling Overlays (Scored to Chat Pane) */}
            <IncomingCallToast 
              currentUserId={currentUserId} 
              onAccept={handleAcceptCall} 
              onDecline={handleDeclineCall} 
            />
            
            {activeCall && (
              <CallOverlay
                {...activeCall}
                currentUserId={currentUserId}
                onEndCall={() => setActiveCall(null)}
              />
            )}
          </>
        )}
      </div>

      {infoSidebarOpen && activeConversationId && activeConversation && (
        <ChatInfoSidebar 
          activeConversation={activeConversation}
          messages={messagesCache[activeConversationId] || []}
          participantMap={participantMap}
          currentUserId={currentUserId}
        />
      )}
    </>
  );
}
