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
    <div className="flex w-full flex-col border-l border-gray-100 bg-gray-50/30 sm:w-[320px] shrink-0 h-full overflow-y-auto hidden xl:flex font-sans">
      <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-white/50">
        <h2 className="text-[13px] font-bold text-gray-900">{isGroup ? "Group Info" : "Contact Info"}</h2>
      </div>

      <div className="p-6 flex flex-col items-center border-b border-gray-100 bg-white/50">
        <div className="relative size-20 rounded-full border-4 border-white shadow-sm overflow-hidden mb-3">
          {isGroup ? (
            <div className="flex size-full items-center justify-center bg-primary/10 text-primary">
              <Users className="size-8" />
            </div>
          ) : otherP?.avatarUrl ? (
            <img 
              src={otherP.avatarUrl} 
              alt={otherP.name} 
              className="size-full object-cover" 
              onError={(e) => { e.currentTarget.style.display = 'none'; }} 
            />
          ) : (
            <div className="flex size-full items-center justify-center bg-gray-100 text-gray-500 font-bold text-2xl">
              {otherP?.name?.substring(0, 2).toUpperCase()}
            </div>
          )}
        </div>
        <h3 className="text-[18px] font-bold text-gray-900 mb-1">{displayName}</h3>
        
        <div className="flex gap-4 mt-5 w-full justify-center">
          <div className="flex flex-col items-center gap-1.5 cursor-pointer group">
            <div className="size-10 rounded-full border border-gray-100 flex items-center justify-center group-hover:bg-gray-100 transition-colors bg-white shadow-sm">
              <Bell className="size-4 text-gray-700" />
            </div>
            <span className="text-[10px] text-gray-500 font-medium">Notification</span>
          </div>
          <div className="flex flex-col items-center gap-1.5 cursor-pointer group">
            <div className="size-10 rounded-full border border-gray-100 flex items-center justify-center group-hover:bg-gray-100 transition-colors bg-white shadow-sm">
              <Pin className="size-4 text-gray-700" />
            </div>
            <span className="text-[10px] text-gray-500 font-medium">Pin Group</span>
          </div>
          <div className="flex flex-col items-center gap-1.5 cursor-pointer group">
            <div className="size-10 rounded-full border border-gray-100 flex items-center justify-center group-hover:bg-gray-100 transition-colors bg-white shadow-sm">
              <Users className="size-4 text-gray-700" />
            </div>
            <span className="text-[10px] text-gray-500 font-medium">Member</span>
          </div>
          <div className="flex flex-col items-center gap-1.5 cursor-pointer group">
            <div className="size-10 rounded-full border border-gray-100 flex items-center justify-center group-hover:bg-gray-100 transition-colors bg-white shadow-sm">
              <Settings className="size-4 text-gray-700" />
            </div>
            <span className="text-[10px] text-gray-500 font-medium">Setting</span>
          </div>
        </div>
      </div>

      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[14px] font-bold text-gray-900">{isGroup ? "Members" : "Contact Info"}</h3>
        </div>
        
        {isGroup ? (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 mb-2">
              <Users className="size-4 text-gray-400" />
              <span className="text-[12px] font-medium text-gray-500">{activeConversation.participants.length} members</span>
            </div>
            {activeConversation.participants.map((p: any) => (
              <div key={p.userId} className="flex items-center gap-3">
                <div className="size-8 shrink-0 rounded-full border border-gray-100 bg-gray-50 overflow-hidden flex items-center justify-center text-[10px] font-bold text-gray-500 shadow-sm">
                  {p.user.avatarUrl ? (
                    <img src={p.user.avatarUrl} alt="" className="size-full object-cover" />
                  ) : (
                    p.user.name.substring(0, 2).toUpperCase()
                  )}
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-[13px] font-semibold text-gray-900 truncate">{p.user.name}</span>
                  <span className="text-[11px] text-gray-500 capitalize truncate">{p.user.role?.toLowerCase() || "Member"}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Email</span>
              <span className="text-[13px] font-semibold text-gray-900 truncate">{otherP?.email || "Unknown"}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Role</span>
              <span className="text-[13px] font-semibold text-gray-900 capitalize truncate">{otherP?.role?.toLowerCase() || "User"}</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[14px] font-bold text-gray-900">Images</h3>
          <button className="text-[12px] font-bold text-primary hover:underline">View All</button>
        </div>
        {imageMessages.length > 0 ? (
          <div className="grid grid-cols-3 gap-2">
            {imageMessages.map((msg, i) => (
              <a key={i} href={msg.attachmentUrl} target="_blank" rel="noopener noreferrer" className="block aspect-square rounded-xl bg-gray-50 border border-gray-100 shadow-sm overflow-hidden hover:opacity-80 transition-opacity">
                <img src={msg.attachmentUrl} alt="Attachment" className="size-full object-cover" />
              </a>
            ))}
          </div>
        ) : (
          <p className="text-[12px] text-gray-500 font-medium">No images shared yet.</p>
        )}
      </div>

      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[14px] font-bold text-gray-900">Files</h3>
          <button className="text-[12px] font-bold text-primary hover:underline">View All</button>
        </div>
        {fileMessages.length > 0 ? (
          <div className="space-y-3">
            {fileMessages.map((file, i) => (
              <a key={i} href={file.attachmentUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:bg-gray-50 p-1.5 -mx-1.5 rounded-xl transition-colors">
                <div className="size-10 rounded-xl flex items-center justify-center shrink-0 bg-gray-50 border border-gray-100 shadow-sm">
                  <FileText className="size-4 text-gray-600" />
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-[13px] font-semibold text-gray-900 truncate">Document</span>
                  <span className="text-[11px] text-gray-500">Attachment</span>
                </div>
                <span className="text-[10px] text-gray-400 font-medium shrink-0">{new Date(file.createdAt).toLocaleDateString()}</span>
              </a>
            ))}
          </div>
        ) : (
          <p className="text-[12px] text-gray-500 font-medium">No files shared yet.</p>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[14px] font-bold text-gray-900">Links</h3>
          <button className="text-[12px] font-bold text-primary hover:underline">View All</button>
        </div>
        {linkItems.length > 0 ? (
          <div className="space-y-3">
            {linkItems.map((link, i) => (
              <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:bg-gray-50 p-1.5 -mx-1.5 rounded-xl transition-colors">
                <div className="size-9 rounded-xl shrink-0 border border-gray-100 bg-gray-50 flex items-center justify-center shadow-sm">
                  <LinkIcon className="size-4 text-gray-600" />
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-[13px] font-semibold text-gray-900 truncate">{link.url}</span>
                  <span className="text-[11px] text-gray-500 font-medium">{link.domain}</span>
                </div>
                <span className="text-[10px] text-gray-400 font-medium shrink-0">{link.date}</span>
              </a>
            ))}
          </div>
        ) : (
          <p className="text-[12px] text-gray-500 font-medium">No links shared yet.</p>
        )}
      </div>

    </div>
  );
}
