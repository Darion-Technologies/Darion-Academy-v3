import { getMessagesAction } from "@/app/actions/chat";
import { ChatWindow } from "@/components/chat/chat-window";
import { ChatInput } from "@/components/chat/chat-input";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ConversationPage(props: { params: Promise<{ conversationId: string }> }) {
  const params = await props.params;
  const { conversationId } = params;
  const user = await requireUser();
  const messages = await getMessagesAction(conversationId);
  
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      participants: {
        include: { user: { select: { id: true, name: true, avatarUrl: true } } }
      }
    }
  });
  
  const participantMap = conversation?.participants.reduce((acc, p) => {
    acc[p.userId] = p.user;
    return acc;
  }, {} as Record<string, { id: string; name: string; avatarUrl: string | null }>) || {};
  
  const recipient = conversation?.participants.find(p => p.userId !== user.id);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center border-b border-border p-4 bg-muted/20">
        <h2 className="text-sm font-bold tracking-tight text-foreground">Conversation</h2>
      </div>
      <ChatWindow
        conversationId={conversationId}
        initialMessages={messages}
        currentUserId={user.id}
        participantMap={participantMap}
        initialRecipientStatus={recipient ? {
          lastReadAt: recipient.lastReadAt,
          lastDeliveredAt: recipient.lastDeliveredAt
        } : null}
      />
      <ChatInput conversationId={conversationId} currentUserId={user.id} currentUserName={user.name} />
    </div>
  );
}
