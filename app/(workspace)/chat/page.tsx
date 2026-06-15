import { getConversationsAction } from "@/app/actions/chat";
import { requireUser } from "@/lib/auth";
import { ChatApp } from "@/components/chat/chat-app";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

export default async function ChatPage() {
  const user = await requireUser();
  const conversations = await getConversationsAction();

  return (
    <Suspense fallback={
      <div className="flex h-full w-full items-center justify-center bg-card">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    }>
      <ChatApp 
        initialConversations={conversations} 
        currentUserId={user.id} 
        currentUserName={user.name} 
      />
    </Suspense>
  );
}
