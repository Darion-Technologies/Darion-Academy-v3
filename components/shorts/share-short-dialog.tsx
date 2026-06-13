"use client";

import { useState, useEffect, useTransition } from "react";
import { Search, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getAvailableUsersAction, createConversationAction, sendMessageAction } from "@/app/actions/chat";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import Image from "next/image";

type AvailableUser = {
  id: string;
  name: string;
  avatarUrl: string | null;
  role: string;
};

export function ShareShortDialog({ 
  open, 
  onOpenChange, 
  shortId, 
  shortTitle 
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
  shortId: string;
  shortTitle: string;
}) {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<AvailableUser[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<AvailableUser[]>([]);
  const [isPendingSearch, startTransition] = useTransition();
  const [isSharing, setIsSharing] = useState(false);

  useEffect(() => {
    if (open) {
      startTransition(async () => {
        try {
          const res = await getAvailableUsersAction(query);
          setUsers(res);
        } catch (err) {
          console.error(err);
        }
      });
    }
  }, [query, open]);

  function toggleUser(user: AvailableUser) {
    if (selectedUsers.find((u) => u.id === user.id)) {
      setSelectedUsers(selectedUsers.filter((u) => u.id !== user.id));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  }

  async function handleShare() {
    if (selectedUsers.length === 0 || isSharing) return;
    setIsSharing(true);

    const type = selectedUsers.length > 1 ? "GROUP" : "DIRECT";
    const userIds = selectedUsers.map((u) => u.id);

    try {
      const conversationId = await createConversationAction(userIds, type, type === "GROUP" ? "Shared Video Group" : undefined);
      
      const shareUrl = `${window.location.origin}/dashboard/shorts/${shortId}`;
      const messageContent = `Check out this video: ${shortTitle}\n${shareUrl}`;
      
      await sendMessageAction(conversationId, messageContent);
      
      onOpenChange(false);
      setSelectedUsers([]);
      setQuery("");
      toast.success("Video shared successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to share video");
    } finally {
      setIsSharing(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-none border border-border bg-card p-0 overflow-hidden">
        <DialogHeader className="p-4 border-b border-border">
          <DialogTitle className="text-foreground font-bold">Share Video</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col h-[60vh] max-h-[500px]">
          <div className="relative border-b border-border p-2">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search users..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-muted/50 py-2 pl-9 pr-4 text-sm outline-none border border-border focus:border-primary rounded-none"
            />
          </div>

          {selectedUsers.length > 0 && (
            <div className="flex flex-wrap gap-2 p-3 border-b border-border bg-muted/20">
              {selectedUsers.map((u) => (
                <div key={u.id} className="flex items-center gap-1 bg-secondary text-secondary-foreground px-2 py-1 text-xs font-semibold rounded-none">
                  {u.name}
                  <button onClick={() => toggleUser(u)} className="hover:text-destructive">
                    <X className="size-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-2">
            {isPendingSearch ? (
              <div className="p-4 text-center text-xs text-muted-foreground">Searching...</div>
            ) : users.length === 0 ? (
              <div className="p-4 text-center text-xs text-muted-foreground">No users found.</div>
            ) : (
              <div className="flex flex-col gap-1">
                {users.map((user) => {
                  const isSelected = selectedUsers.some((u) => u.id === user.id);
                  return (
                    <button
                      key={user.id}
                      onClick={() => toggleUser(user)}
                      className={cn(
                        "flex items-center justify-between p-2 text-left transition-colors hover:bg-muted rounded-none border border-transparent",
                        isSelected && "border-primary bg-primary/5"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className="size-8 overflow-hidden rounded-none bg-muted border border-border">
                          {user.avatarUrl ? (
                            <Image src={user.avatarUrl} alt="" width={32} height={32} className="size-full object-cover" />
                          ) : (
                            <div className="flex h-full items-center justify-center text-[10px] font-bold text-foreground">
                              {user.name.substring(0, 2).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold">{user.name}</span>
                          <span className="text-[10px] text-muted-foreground uppercase">{user.role}</span>
                        </div>
                      </div>
                      {isSelected && <Check className="size-4 text-primary" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="border-t border-border p-3 flex justify-end gap-2 bg-muted/20">
            <Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-none">
              Cancel
            </Button>
            <Button onClick={handleShare} disabled={selectedUsers.length === 0 || isSharing} className="rounded-none">
              {isSharing ? "Sharing..." : "Share"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
