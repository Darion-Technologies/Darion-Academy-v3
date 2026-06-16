"use client";

import { Bell, Pin, Users, Settings, FileText, Image as ImageIcon, Link as LinkIcon, Download, Video, File, ChevronRight, Play } from "lucide-react";
import { cn } from "@/lib/utils";

type Participant = { user: { id: string; name: string; avatarUrl: string | null } };

export function ChatInfoSidebar({
  activeConversation,
  messages,
  participantMap,
  currentUserId,
}: {
  activeConversation: any | null;
  messages: any[];
  participantMap: Record<string, any>;
  currentUserId: string;
}) {
  if (!activeConversation) return null;

  const isGroup = activeConversation.type === "GROUP";
  const otherP = activeConversation.participants.find((p: any) => p.userId !== currentUserId)?.user || activeConversation.participants[0].user;
  const displayName = isGroup ? (activeConversation.name || "Group Chat") : otherP.name;
  // Extract real data from messages
  const imageMessages = messages.filter(m => m.attachmentUrl && m.attachmentType?.startsWith('image')).reverse().slice(0, 6);
  const fileMessages = messages.filter(m => m.attachmentUrl && !m.attachmentType?.startsWith('image')).reverse().slice(0, 3);
  
  const linkRegex = /(https?:\/\/[^\s]+)/g;
  const linkItems = messages
    .filter(m => m.content && linkRegex.test(m.content))
    .flatMap(m => {
      const urls = m.content.match(linkRegex) || [];
      return urls.map((url: string) => ({
        url,
        domain: new URL(url).hostname.replace('www.', ''),
        date: new Date(m.createdAt).toLocaleDateString()
      }));
    })
    .reverse()
    .slice(0, 3);
    
  return (
    <div className="flex w-full flex-col border-l border-border bg-card sm:w-[280px] shrink-0 h-full overflow-y-auto hidden xl:flex">
      <div className="flex items-center justify-between p-3 border-b border-border">
        <h2 className="text-[12px] font-bold text-foreground">{isGroup ? "Group Info" : "Contact Info"}</h2>
      </div>

      <div className="p-4 flex flex-col items-center border-b border-border">
        <div className="relative size-12 rounded-none overflow-hidden mb-2 border border-border">
          {isGroup ? (
            <div className="flex size-full items-center justify-center bg-muted text-foreground">
              <Users className="size-6" />
            </div>
          ) : otherP?.avatarUrl ? (
            <img 
              src={otherP.avatarUrl} 
              alt={otherP.name} 
              className="size-full object-cover" 
              onError={(e) => { e.currentTarget.style.display = 'none'; }} 
            />
          ) : (
            <div className="flex size-full items-center justify-center bg-muted text-foreground font-bold text-xl">
              {otherP?.name?.substring(0, 2).toUpperCase()}
            </div>
          )}
        </div>
        <h3 className="text-base font-bold text-foreground mb-1">{displayName}</h3>
        
        <div className="flex gap-4 mt-4 w-full justify-center">
          <div className="flex flex-col items-center gap-1 cursor-pointer">
            <div className="size-8 rounded-none border border-border flex items-center justify-center hover:bg-muted transition-colors bg-card">
              <Bell className="size-3.5 text-foreground" />
            </div>
            <span className="text-[9px] text-muted-foreground font-medium">Notification</span>
          </div>
          <div className="flex flex-col items-center gap-1 cursor-pointer">
            <div className="size-8 rounded-none border border-border flex items-center justify-center hover:bg-muted transition-colors bg-card">
              <Pin className="size-3.5 text-foreground" />
            </div>
            <span className="text-[9px] text-muted-foreground font-medium">Pin Group</span>
          </div>
          <div className="flex flex-col items-center gap-1 cursor-pointer">
            <div className="size-8 rounded-none border border-border flex items-center justify-center hover:bg-muted transition-colors bg-card">
              <Users className="size-3.5 text-foreground" />
            </div>
            <span className="text-[9px] text-muted-foreground font-medium">Member</span>
          </div>
          <div className="flex flex-col items-center gap-1 cursor-pointer">
            <div className="size-8 rounded-none border border-border flex items-center justify-center hover:bg-muted transition-colors bg-card">
              <Settings className="size-3.5 text-foreground" />
            </div>
            <span className="text-[9px] text-muted-foreground font-medium">Setting</span>
          </div>
        </div>
      </div>

      <div className="p-3 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[12px] font-semibold text-foreground">{isGroup ? "Members" : "Contact Info"}</h3>
        </div>
        
        {isGroup ? (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 mb-1">
              <Users className="size-3.5 text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground">{activeConversation.participants.length} members</span>
            </div>
            {activeConversation.participants.map((p: any) => (
              <div key={p.userId} className="flex items-center gap-2">
                <div className="size-6 shrink-0 rounded-none border border-border bg-muted overflow-hidden flex items-center justify-center text-[8px] font-bold text-foreground">
                  {p.user.avatarUrl ? (
                    <img src={p.user.avatarUrl} alt="" className="size-full object-cover" />
                  ) : (
                    p.user.name.substring(0, 2).toUpperCase()
                  )}
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-[11px] font-semibold text-foreground truncate">{p.user.name}</span>
                  <span className="text-[9px] text-muted-foreground capitalize truncate">{p.user.role?.toLowerCase() || "Member"}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="flex flex-col">
              <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider mb-0.5">Email</span>
              <span className="text-[11px] font-semibold text-foreground truncate">{otherP?.email || "Unknown"}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider mb-0.5">Role</span>
              <span className="text-[11px] font-semibold text-foreground capitalize truncate">{otherP?.role?.toLowerCase() || "User"}</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-3 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[12px] font-semibold text-foreground">Images</h3>
          <button className="text-[10px] font-bold text-foreground hover:underline">View All</button>
        </div>
        {imageMessages.length > 0 ? (
          <div className="grid grid-cols-3 gap-1.5">
            {imageMessages.map((msg, i) => (
              <a key={i} href={msg.attachmentUrl} target="_blank" rel="noopener noreferrer" className="block aspect-square rounded-none bg-muted border border-border overflow-hidden hover:opacity-80 transition-opacity">
                <img src={msg.attachmentUrl} alt="Attachment" className="size-full object-cover" />
              </a>
            ))}
          </div>
        ) : (
          <p className="text-[10px] text-muted-foreground">No images shared yet.</p>
        )}
      </div>

      <div className="p-3 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[12px] font-semibold text-foreground">Files</h3>
          <button className="text-[10px] font-bold text-foreground hover:underline">View All</button>
        </div>
        {fileMessages.length > 0 ? (
          <div className="space-y-2.5">
            {fileMessages.map((file, i) => (
              <a key={i} href={file.attachmentUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 hover:bg-muted/30 p-1 -mx-1 transition-colors">
                <div className="size-8 rounded-none flex items-center justify-center shrink-0 bg-muted border border-border">
                  <FileText className="size-4 text-foreground" />
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-[11px] font-semibold text-foreground truncate">Document</span>
                  <span className="text-[9px] text-muted-foreground">Attachment</span>
                </div>
                <span className="text-[9px] text-muted-foreground shrink-0">{new Date(file.createdAt).toLocaleDateString()}</span>
              </a>
            ))}
          </div>
        ) : (
          <p className="text-[10px] text-muted-foreground">No files shared yet.</p>
        )}
      </div>

      <div className="p-3">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[12px] font-semibold text-foreground">Links</h3>
          <button className="text-[10px] font-bold text-foreground hover:underline">View All</button>
        </div>
        {linkItems.length > 0 ? (
          <div className="space-y-2.5">
            {linkItems.map((link, i) => (
              <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 hover:bg-muted/30 p-1 -mx-1 transition-colors">
                <div className="size-7 rounded-none shrink-0 border border-border bg-muted flex items-center justify-center">
                  <LinkIcon className="size-3.5 text-foreground" />
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-[11px] font-semibold text-foreground truncate">{link.url}</span>
                  <span className="text-[9px] text-muted-foreground">{link.domain}</span>
                </div>
                <span className="text-[9px] text-muted-foreground shrink-0">{link.date}</span>
              </a>
            ))}
          </div>
        ) : (
          <p className="text-[10px] text-muted-foreground">No links shared yet.</p>
        )}
      </div>

    </div>
  );
}
