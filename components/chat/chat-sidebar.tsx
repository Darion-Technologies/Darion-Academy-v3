"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Users, User, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NewChatDialog } from "@/components/chat/new-chat-dialog";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

type Conversation = {
  id: string;
  type: "DIRECT" | "GROUP";
  name: string | null;
  updatedAt: Date;
  messages: Array<{ content: string; createdAt: Date }>;
  participants: Array<{ user: { id: string; name: string; avatarUrl: string | null } }>;
  unreadCount?: number;
};

export function ChatSidebar({ 
  initialConversations, 
  currentUserId,
  activeConversationId,
  onSelectConversation
}: { 
  initialConversations: Conversation[];
  currentUserId: string;
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const supabase = createClient();

  useEffect(() => {
    // In Darion Academy, we might have a global presence channel, 
    // but here we can just create a "global_chat_presence" channel.
    const channel = supabase.channel("global_chat_presence", {
      config: { presence: { key: currentUserId } },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        const users = new Set<string>();
        for (const id of Object.keys(state)) {
          users.add(id);
        }
        setOnlineUsers(users);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({ online_at: new Date().toISOString() });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId, supabase]);

  return (
    <div className="flex w-full flex-col border-r border-border bg-muted/20 sm:w-80 shrink-0">
      <div className="flex items-center justify-between border-b border-border p-4">
        <h2 className="text-sm font-bold tracking-tight uppercase text-foreground">Messages</h2>
        <Button variant="ghost" size="icon-sm" onClick={() => setDialogOpen(true)} className="rounded-none">
          <Plus className="size-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {initialConversations.length === 0 ? (
          <div className="p-4 text-center text-xs text-muted-foreground">
            No conversations yet. Start a new chat!
          </div>
        ) : (
          <div className="flex flex-col">
            {initialConversations.map((conv) => {
              const isGroup = conv.type === "GROUP";
              // Filter out the current user to find the other participant
              const otherP = conv.participants.find(p => p.user.id !== currentUserId)?.user || conv.participants[0].user;
              
              const displayName = isGroup ? (conv.name || "Group Chat") : otherP.name;
              const isActive = activeConversationId === conv.id;
              const lastMessage = conv.messages[0]?.content || "No messages yet";

              return (
                <button
                  key={conv.id}
                  onClick={() => onSelectConversation(conv.id)}
                  className={cn(
                    "flex items-center gap-3 border-b border-border p-3 transition-colors hover:bg-muted/50 w-full text-left",
                    isActive && "bg-muted"
                  )}
                >
                  <div className="relative size-10 shrink-0">
                    <div className="flex size-full items-center justify-center bg-secondary text-secondary-foreground border border-border rounded-none overflow-hidden">
                      {isGroup ? (
                        <Users className="size-5" />
                      ) : otherP?.avatarUrl ? (
                        <img 
                          src={otherP.avatarUrl} 
                          alt={otherP.name} 
                          className="size-full object-cover" 
                          onError={(e) => { e.currentTarget.style.display = 'none'; }} 
                        />
                      ) : (
                        <span className="text-xs font-bold">{otherP?.name?.substring(0, 2).toUpperCase()}</span>
                      )}
                    </div>
                    {!isGroup && otherP && onlineUsers.has(otherP.id) && (
                      <span className="absolute -bottom-1 -right-1 block size-3 rounded-full bg-green-500 border-2 border-card z-10"></span>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col overflow-hidden">
                    <span className={cn("truncate text-sm", conv.unreadCount ? "font-bold text-foreground" : "font-semibold")}>
                      {displayName}
                    </span>
                    <span className={cn("truncate text-xs", conv.unreadCount ? "font-bold text-foreground" : "text-muted-foreground")}>
                      {lastMessage}
                    </span>
                  </div>
                  {conv.unreadCount ? (
                    <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                      {conv.unreadCount > 99 ? "99+" : conv.unreadCount}
                    </div>
                  ) : null}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <NewChatDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen} 
        onSelectConversation={onSelectConversation}
      />
    </div>
  );
}
