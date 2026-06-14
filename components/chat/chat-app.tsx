"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ChatSidebar } from "@/components/chat/chat-sidebar";
import { ChatWindow } from "@/components/chat/chat-window";
import { ChatInput } from "@/components/chat/chat-input";
import { getMessagesAction } from "@/app/actions/chat";
import { MessageSquare, Loader2 } from "lucide-react";

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

  const activeConversation = initialConversations.find(c => c.id === activeConversationId);
  
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
        initialConversations={initialConversations} 
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
