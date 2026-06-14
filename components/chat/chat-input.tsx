"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { Send, Image as ImageIcon, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { sendMessageAction, uploadChatAttachmentAction } from "@/app/actions/chat";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

export function ChatInput({ conversationId, currentUserId, currentUserName }: { conversationId: string; currentUserId: string; currentUserName: string }) {
  const [content, setContent] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [attachmentPreview, setAttachmentPreview] = useState<string | null>(null);
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [isUploading, startUpload] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();
  const channelRef = useRef<any>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    channelRef.current = supabase.channel(`typing_${conversationId}`);
    return () => {
      if (channelRef.current) supabase.removeChannel(channelRef.current);
    };
  }, [conversationId, supabase]);

  function handleTyping() {
    if (channelRef.current) {
      channelRef.current.send({
        type: "broadcast",
        event: "typing",
        payload: { userId: currentUserId, userName: currentUserName }
      });
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      if (channelRef.current) {
        channelRef.current.send({
          type: "broadcast",
          event: "stop_typing",
          payload: { userId: currentUserId }
        });
      }
    }, 2000);
  }

  async function handleSend() {
    if ((!content.trim() && !attachmentFile) || isPending || isUploading) return;
    
    setIsPending(true);
    try {
      let attachmentUrl = undefined;
      let attachmentType = undefined;
      
      if (attachmentFile) {
        const formData = new FormData();
        formData.set("file", attachmentFile);
        const result = await uploadChatAttachmentAction(formData);
        if (result.error) {
          toast.error(result.error);
          setIsPending(false);
          return;
        }
        attachmentUrl = result.attachmentUrl;
        attachmentType = result.attachmentType;
      }
      
      await sendMessageAction(conversationId, content, attachmentUrl, attachmentType);
      setContent("");
      setAttachmentFile(null);
      setAttachmentPreview(null);
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

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Only images are supported currently.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be under 10MB");
      return;
    }

    setAttachmentFile(file);
    setAttachmentPreview(URL.createObjectURL(file));
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removeAttachment() {
    setAttachmentFile(null);
    setAttachmentPreview(null);
  }

  return (
    <div className="border-t border-border bg-card p-3 sm:p-4">
      {attachmentPreview && (
        <div className="mb-3 relative inline-block">
          <div className="relative h-24 w-24 rounded-none border border-border overflow-hidden bg-muted">
            <img src={attachmentPreview} alt="Attachment preview" className="h-full w-full object-cover" />
          </div>
          <button
            onClick={removeAttachment}
            className="absolute -top-2 -right-2 flex size-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90"
          >
            <X className="size-3" />
          </button>
        </div>
      )}
      <div className="flex items-end gap-2">
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept="image/*" 
          className="hidden" 
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => fileInputRef.current?.click()}
          disabled={isPending || isUploading}
          className="h-[44px] w-[44px] shrink-0 rounded-none text-muted-foreground hover:text-foreground"
        >
          <ImageIcon className="size-5" />
        </Button>
        <textarea
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            handleTyping();
          }}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="max-h-32 min-h-[44px] w-full resize-none bg-muted/50 p-3 text-sm text-foreground outline-none border border-border focus:border-primary rounded-none transition-colors"
          rows={1}
        />
        <Button
          onClick={handleSend}
          disabled={(!content.trim() && !attachmentFile) || isPending || isUploading}
          size="icon"
          className="h-[44px] w-[44px] shrink-0 rounded-none"
        >
          {isPending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
        </Button>
      </div>
    </div>
  );
}
