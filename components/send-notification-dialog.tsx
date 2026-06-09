"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Bell } from "lucide-react";
import { sendManualNotificationAction } from "@/app/actions/notifications";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function SendNotificationDialog({ userId, userName }: { userId: string; userName: string }) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  async function onSubmit(formData: FormData) {
    setPending(true);
    try {
      await sendManualNotificationAction(formData);
      toast.success("Notification sent!");
      setOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to send notification");
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" title="Send notification">
          <Bell className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Notify {userName}</DialogTitle>
          <DialogDescription>
            Send a direct message. They will receive an in-app alert and a push notification if subscribed.
          </DialogDescription>
        </DialogHeader>
        <form action={onSubmit} className="space-y-4 mt-4">
          <input type="hidden" name="userId" value={userId} />
          
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" required placeholder="e.g. Action Required" />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea 
              id="message" 
              name="message" 
              required 
              placeholder="Type your message here..."
              className="min-h-[100px]"
            />
          </div>
          
          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={pending}>
              {pending ? "Sending..." : "Send Notification"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
