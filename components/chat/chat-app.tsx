"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ChatSidebar } from "@/components/chat/chat-sidebar";
import { ChatWindow } from "@/components/chat/chat-window";
import { ChatInput } from "@/components/chat/chat-input";
import { getMessagesAction, markConversationAsDeliveredAction, getConversationsAction } from "@/app/actions/chat";
import { MessageSquare, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

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
  
  // Read initial ID from URL, if any
  const urlId = searchParams.get("id");
  const [activeConversationId, setActiveConversationId] = useState<string | null>(urlId || null);
  
  const [liveConversations, setLiveConversations] = useState<any[]>(initialConversations);
  
  // Cache of messages per conversation
  const [messagesCache, setMessagesCache] = useState<Record<string, any[]>>({});
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

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
            <div className="flex items-center border-b border-border p-4 bg-muted/20">
              <h2 className="text-sm font-bold tracking-tight text-foreground">
                {activeConversation?.type === "GROUP" ? (activeConversation.name || "Group Chat") : recipient?.user?.name || "Chat"}
              </h2>
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
            
            <ChatInput 
              key={`input-${activeConversationId}`}
              conversationId={activeConversationId} 
              currentUserId={currentUserId} 
              currentUserName={currentUserName} 
            />
          </>
        )}
      </div>
    </>
  );
}
