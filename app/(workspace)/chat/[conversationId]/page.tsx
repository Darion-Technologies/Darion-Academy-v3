import { getMessagesAction } from "@/app/actions/chat";
import { ChatWindow } from "@/components/chat/chat-window";
import { ChatInput } from "@/components/chat/chat-input";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function ConversationPage(props: { params: Promise<{ conversationId: string }> }) {
  const params = await props.params;
  const { conversationId } = params;
  const user = await requireUser();
  const messages = await getMessagesAction(conversationId);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center border-b border-border p-4 bg-muted/20">
        <h2 className="text-sm font-bold tracking-tight text-foreground">Conversation</h2>
      </div>
      <ChatWindow
        conversationId={conversationId}
        initialMessages={messages}
        currentUserId={user.id}
      />
      <ChatInput conversationId={conversationId} />
    </div>
  );
}
