"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Users, User, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
    <div className="flex w-full flex-col border-r border-border bg-card sm:w-[280px] shrink-0 h-full antialiased">
      <div className="flex flex-col p-3 gap-3 border-b border-border">
        {/* Search */}
        <div className="relative">
          <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          <Input placeholder="Search" className="pl-8 bg-background border-border rounded-none h-8 text-xs" />
        </div>

        {/* Tabs */}
        <div className="flex p-0.5 bg-muted/30 border border-border">
          <button className="flex-1 flex items-center justify-center gap-1.5 py-1 bg-background border border-border text-xs font-semibold text-foreground rounded-none">
            <User className="size-3.5" />
            Inbox
            <span className="flex items-center justify-center size-4 bg-primary text-primary-foreground text-[9px] font-bold rounded-none">24</span>
          </button>
          <button className="flex-1 flex items-center justify-center gap-1.5 py-1 text-xs font-semibold text-muted-foreground hover:text-foreground rounded-none">
            <svg className="size-3.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"/></svg>
            Explore
            <span className="flex items-center justify-center size-4 bg-muted text-muted-foreground border border-border text-[9px] font-bold rounded-none">10</span>
          </button>
        </div>

        <h2 className="text-sm font-bold text-foreground mt-1">Messages</h2>

        <Button 
          onClick={() => setDialogOpen(true)} 
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-none text-xs font-bold h-8"
        >
          Create New Group
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
                    "flex items-start gap-2.5 border-b border-border p-2.5 transition-colors hover:bg-muted/30 w-full text-left relative rounded-none",
                    isActive && "bg-muted/50"
                  )}
                >
                  <div className="relative size-10 shrink-0">
                    <div className="flex size-full items-center justify-center bg-secondary text-secondary-foreground border border-border rounded-none overflow-hidden">
                      {isGroup ? (
                        <div className="flex size-full items-center justify-center bg-muted text-foreground">
                          <Users className="size-4" />
                        </div>
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
                      <span className="absolute bottom-0 right-0 block size-2.5 bg-green-500 border border-card z-10 rounded-none"></span>
                    )}
                  </div>
                  
                  <div className="flex flex-1 flex-col overflow-hidden pt-0.5">
                    <div className="flex justify-between items-center mb-0.5">
                      <span className={cn("truncate text-[12px]", conv.unreadCount ? "font-bold text-foreground" : "font-semibold")}>
                        {displayName}
                      </span>
                      <span className={cn("text-[9px] shrink-0", conv.unreadCount ? "font-bold text-foreground" : "text-muted-foreground")}>
                        {conv.messages[0] ? new Date(conv.messages[0].createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={cn("truncate text-[10px] pr-2 leading-tight", conv.unreadCount ? "font-bold text-foreground" : "text-muted-foreground")}>
                        {lastMessage}
                      </span>
                      {conv.unreadCount ? (
                        <div className="flex size-4 shrink-0 items-center justify-center bg-primary text-primary-foreground text-[9px] font-bold rounded-none">
                          {conv.unreadCount > 99 ? "99+" : conv.unreadCount}
                        </div>
                      ) : null}
                    </div>
                  </div>
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
