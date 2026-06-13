import { getConversationsAction } from "@/app/actions/chat";
import { ChatSidebar } from "@/components/chat/chat-sidebar";

export const dynamic = "force-dynamic";

export default async function ChatLayout({ children }: { children: React.ReactNode }) {
  const conversations = await getConversationsAction();

  return (
    <div className="flex h-[calc(100vh-130px)] w-full overflow-hidden border border-border shadow-sm rounded-none bg-card">
      <ChatSidebar initialConversations={conversations} />
      <div className="flex flex-1 flex-col overflow-hidden relative">
        {children}
      </div>
    </div>
  );
}
