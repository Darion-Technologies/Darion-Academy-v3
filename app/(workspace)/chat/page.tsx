import { MessageSquare } from "lucide-react";

export default function ChatPage() {
  return (
    <div className="flex h-full flex-col items-center justify-center text-muted-foreground p-8">
      <div className="flex size-16 items-center justify-center rounded-none bg-muted mb-4 border border-border">
        <MessageSquare className="size-8 text-foreground" />
      </div>
      <h3 className="text-lg font-bold text-foreground">Your Messages</h3>
      <p className="text-sm mt-2 text-center max-w-sm">
        Select a conversation from the sidebar to start chatting or create a new one.
      </p>
    </div>
  );
}
