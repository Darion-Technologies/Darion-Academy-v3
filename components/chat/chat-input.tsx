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
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    
    // Dispatch optimistic message
    const optimisticMsg = {
      id: `opt-${Date.now()}`,
      senderId: currentUserId,
      content: content.trim(),
      attachmentUrl: attachmentPreview,
      attachmentType: attachmentFile ? 'image' : null,
      createdAt: new Date(),
      sender: { id: currentUserId, name: currentUserName, avatarUrl: null }
    };
    
    window.dispatchEvent(new CustomEvent("optimistic_chat_message", { detail: optimisticMsg }));
    
    // Clear input immediately for better UX
    const savedContent = content;
    const savedFile = attachmentFile;
    const savedPreview = attachmentPreview;
    
    setContent("");
    setAttachmentFile(null);
    setAttachmentPreview(null);
    setIsPending(true);
    
    try {
      let attachmentUrl = undefined;
      let attachmentType = undefined;
      
      if (savedFile) {
        const formData = new FormData();
        formData.set("file", savedFile);
        const result = await uploadChatAttachmentAction(formData);
        if (result.error) {
          toast.error(result.error);
          setIsPending(false);
          // Revert optimistic update by restoring input
          setContent(savedContent);
          setAttachmentFile(savedFile);
          setAttachmentPreview(savedPreview);
          return;
        }
        attachmentUrl = result.attachmentUrl;
        attachmentType = result.attachmentType;
      }
      
      await sendMessageAction(conversationId, savedContent, attachmentUrl, attachmentType);
    } catch (err: any) {
      toast.error(err.message || "Failed to send message");
      // Revert optimistic update by restoring input
      setContent(savedContent);
      setAttachmentFile(savedFile);
      setAttachmentPreview(savedPreview);
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
    <div className="w-full relative px-2">
      {attachmentPreview && (
        <div className="mb-3 relative inline-block pl-4">
          <div className="relative h-24 w-24 rounded-xl border border-gray-200 overflow-hidden bg-gray-50">
            <img src={attachmentPreview} alt="Attachment preview" className="h-full w-full object-cover" />
          </div>
          <button
            onClick={removeAttachment}
            className="absolute -top-2 -right-2 flex size-6 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600 border-2 border-white shadow-sm"
          >
            <X className="size-3" />
          </button>
        </div>
      )}
      <div className="flex items-center w-full bg-gray-100 border border-transparent rounded-full pr-1.5 pl-4 py-1.5 focus-within:ring-1 focus-within:ring-primary/30 focus-within:bg-white transition-all shadow-sm">
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept="image/*" 
          className="hidden" 
        />
        <input
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            handleTyping();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Aa"
          className="flex-1 bg-transparent border-none text-[12px] text-foreground outline-none placeholder:text-muted-foreground/70 h-8"
        />
        
        <div className="flex items-center gap-0.5 shrink-0 ml-1 text-gray-400">
          <button className="size-8 flex items-center justify-center hover:text-gray-700 transition-colors hover:bg-gray-200 rounded-full">
            <svg className="size-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" x2="9.01" y1="9" y2="9"/><line x1="15" x2="15.01" y1="9" y2="9"/></svg>
          </button>
          <button className="size-8 flex items-center justify-center hover:text-gray-700 transition-colors hover:bg-gray-200 rounded-full">
            <svg className="size-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
          </button>
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isPending || isUploading}
            className="size-8 flex items-center justify-center hover:text-gray-700 transition-colors hover:bg-gray-200 rounded-full"
          >
            <ImageIcon className="size-4" />
          </button>
          
          {(content.trim() || attachmentFile) && (
            <button
              onClick={handleSend}
              disabled={isPending || isUploading}
              className="ml-1 flex items-center justify-center size-8 bg-primary text-white rounded-full hover:bg-primary/90 transition-transform active:scale-95 shadow-sm"
            >
              {isPending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4 ml-0.5" />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
