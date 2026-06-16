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
    <div className="flex w-full flex-col border-r border-gray-100 bg-white sm:w-[280px] shrink-0 h-full antialiased font-sans">
      <div className="flex flex-col p-3 gap-3">
        {/* Search */}
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          <Input placeholder="Search" className="pl-9 bg-gray-50 border-transparent rounded-xl h-10 text-[13px] hover:bg-gray-100 focus-visible:bg-white focus-visible:ring-1 focus-visible:ring-primary/30 transition-all shadow-sm" />
        </div>

        {/* Tabs */}
        <div className="flex p-1 bg-gray-100/80 rounded-xl">
          <button className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-white text-[13px] font-semibold text-gray-900 rounded-lg shadow-sm">
            <User className="size-4 text-primary" />
            Inbox
            <span className="flex items-center justify-center h-4 px-1.5 min-w-[16px] bg-primary/10 text-primary text-[10px] font-bold rounded-full">24</span>
          </button>
          <button className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-[13px] font-medium text-gray-500 hover:text-gray-900 transition-colors rounded-lg">
            <svg className="size-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"/></svg>
            Explore
          </button>
        </div>

        <div className="flex items-center justify-between mt-1">
          <h2 className="text-[13px] font-bold text-gray-900">Messages</h2>
          <Button 
            onClick={() => setDialogOpen(true)} 
            variant="ghost"
            size="icon"
            className="size-7 rounded-full text-gray-500 hover:text-primary hover:bg-primary/5"
          >
            <Plus className="size-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-2 scrollbar-thin">
        {initialConversations.length === 0 ? (
          <div className="p-4 text-center text-[13px] text-gray-500">
            No conversations yet. Start a new chat!
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {initialConversations.map((conv) => {
              const isGroup = conv.type === "GROUP";
              const otherP = conv.participants.find(p => p.user.id !== currentUserId)?.user || conv.participants[0].user;
              
              const displayName = isGroup ? (conv.name || "Group Chat") : otherP.name;
              const isActive = activeConversationId === conv.id;
              const lastMessage = conv.messages[0]?.content || "No messages yet";

              return (
                <button
                  key={conv.id}
                  onClick={() => onSelectConversation(conv.id)}
                  className={cn(
                    "flex items-center gap-3 p-2.5 transition-all w-full text-left relative rounded-xl border border-transparent",
                    isActive ? "bg-white shadow-sm border-gray-100 ring-1 ring-black/5" : "hover:bg-gray-50"
                  )}
                >
                  <div className="relative size-10 shrink-0">
                    <div className="flex size-full items-center justify-center bg-gray-100 text-gray-500 rounded-full overflow-hidden border border-gray-200/50">
                      {isGroup ? (
                        <div className="flex size-full items-center justify-center bg-primary/10 text-primary">
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
                        <span className="text-[13px] font-bold">{otherP?.name?.substring(0, 2).toUpperCase()}</span>
                      )}
                    </div>
                    {!isGroup && otherP && onlineUsers.has(otherP.id) && (
                      <span className="absolute bottom-0 right-0 block size-2.5 bg-green-500 border-2 border-white z-10 rounded-full"></span>
                    )}
                  </div>
                  
                  <div className="flex flex-1 flex-col overflow-hidden">
                    <div className="flex justify-between items-center mb-0.5">
                      <span className={cn("truncate text-[13px]", conv.unreadCount ? "font-bold text-gray-900" : "font-semibold text-gray-900")}>
                        {displayName}
                      </span>
                      <span className={cn("text-[10px] shrink-0", conv.unreadCount ? "font-bold text-primary" : "text-gray-400 font-medium")}>
                        {conv.messages[0] ? new Date(conv.messages[0].createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={cn("truncate text-[12px] pr-2", conv.unreadCount ? "font-semibold text-gray-700" : "text-gray-500")}>
                        {lastMessage}
                      </span>
                      {conv.unreadCount ? (
                        <div className="flex h-4 px-1.5 min-w-[16px] shrink-0 items-center justify-center bg-primary text-white text-[10px] font-bold rounded-full shadow-sm">
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
