import { getConversationsAction } from "@/app/actions/chat";
import { requireUser } from "@/lib/auth";
import { ChatApp } from "@/components/chat/chat-app";

export default async function ChatPage() {
  const user = await requireUser();
  const conversations = await getConversationsAction();

  return (
    <ChatApp 
      initialConversations={conversations} 
      currentUserId={user.id} 
      currentUserName={user.name} 
    />
  );
}
