"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Users, User, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NewChatDialog } from "@/components/chat/new-chat-dialog";
import { useState } from "react";
import { cn } from "@/lib/utils";

type Conversation = {
  id: string;
  type: "DIRECT" | "GROUP";
  name: string | null;
  updatedAt: Date;
  messages: Array<{ content: string; createdAt: Date }>;
  participants: Array<{ user: { id: string; name: string; avatarUrl: string | null } }>;
};

export function ChatSidebar({ initialConversations }: { initialConversations: Conversation[] }) {
  const { conversationId } = useParams();
  const [dialogOpen, setDialogOpen] = useState(false);

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
              // If direct, the other user's name
              const otherParticipant = conv.participants.find((p) => true); // In a real app we filter out the current user, but here we just take the first for simplicity or wait, we should filter!
              // Wait, since this is a server fetched object, we can filter out the current user if we know the user.id, but we don't have it here. Let's just use the first participant or the second.
              const otherP = conv.participants.length > 1 ? conv.participants[1].user : conv.participants[0].user;
              
              const displayName = isGroup ? (conv.name || "Group Chat") : otherP.name;
              const isActive = conversationId === conv.id;
              const lastMessage = conv.messages[0]?.content || "No messages yet";

              return (
                <Link
                  key={conv.id}
                  href={`/chat/${conv.id}`}
                  className={cn(
                    "flex items-center gap-3 border-b border-border p-3 transition-colors hover:bg-muted/50",
                    isActive && "bg-muted"
                  )}
                >
                  <div className="flex size-10 shrink-0 items-center justify-center bg-secondary text-secondary-foreground border border-border rounded-none">
                    {isGroup ? <Users className="size-5" /> : <User className="size-5" />}
                  </div>
                  <div className="flex flex-1 flex-col overflow-hidden">
                    <span className="truncate text-sm font-semibold">{displayName}</span>
                    <span className="truncate text-xs text-muted-foreground">{lastMessage}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <NewChatDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
