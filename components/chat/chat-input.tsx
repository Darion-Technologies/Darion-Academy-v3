"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { sendMessageAction } from "@/app/actions/chat";
import { toast } from "sonner";

export function ChatInput({ conversationId }: { conversationId: string }) {
  const [content, setContent] = useState("");
  const [isPending, setIsPending] = useState(false);

  async function handleSend() {
    if (!content.trim() || isPending) return;
    
    setIsPending(true);
    try {
      await sendMessageAction(conversationId, content);
      setContent("");
    } catch (err: any) {
      toast.error(err.message || "Failed to send message");
    } finally {
      setIsPending(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="border-t border-border bg-card p-3 sm:p-4">
      <div className="flex items-end gap-2">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="max-h-32 min-h-[44px] w-full resize-none bg-muted/50 p-3 text-sm text-foreground outline-none border border-border focus:border-primary rounded-none transition-colors"
          rows={1}
        />
        <Button
          onClick={handleSend}
          disabled={!content.trim() || isPending}
          size="icon"
          className="h-[44px] w-[44px] shrink-0 rounded-none"
        >
          <Send className="size-4" />
        </Button>
      </div>
    </div>
  );
}
