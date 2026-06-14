import { getConversationsAction } from "@/app/actions/chat";
import { ChatSidebar } from "@/components/chat/chat-sidebar";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function ChatLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const conversations = await getConversationsAction();

  return (
    <div className="flex h-[calc(100vh-130px)] w-full overflow-hidden border border-border shadow-sm rounded-none bg-card">
      <ChatSidebar initialConversations={conversations} currentUserId={user.id} />
      <div className="flex flex-1 flex-col overflow-hidden relative">
        {children}
      </div>
    </div>
  );
}
