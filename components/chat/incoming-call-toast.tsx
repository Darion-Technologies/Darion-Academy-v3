"use client";

import { useEffect, useState } from "react";
import { Phone, PhoneOff, Video } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface IncomingCallToastProps {
  currentUserId: string;
  onAccept: (conversationId: string, initiatorId: string, isVideo: boolean) => void;
  onDecline: (conversationId: string, initiatorId: string) => void;
}

export function IncomingCallToast({ currentUserId, onAccept, onDecline }: IncomingCallToastProps) {
  const [incomingCall, setIncomingCall] = useState<{
    conversationId: string;
    from: string;
    isVideo: boolean;
  } | null>(null);

  useEffect(() => {
    const supabase = createClient();
    
    // We listen on a global channel for our user ID since we don't know which conversation will ring
    // Actually, if we use Supabase realtime, it's easier to listen on a user-specific channel for call notifications
    const channel = supabase.channel(`user:${currentUserId}`, {
      config: { broadcast: { ack: true, self: false } }
    });

    channel.on("broadcast", { event: "incoming-call" }, ({ payload }) => {
      setIncomingCall({
        conversationId: payload.conversationId,
        from: payload.from,
        isVideo: payload.isVideo
      });
      
      // Auto decline if ringing for more than 30s
      setTimeout(() => setIncomingCall(null), 30000);
    });
    
    channel.on("broadcast", { event: "cancel-call" }, () => {
      setIncomingCall(null);
    });

    channel.subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [currentUserId]);

  if (!incomingCall) return null;

  return (
    <div className="absolute top-4 right-4 z-50 animate-in slide-in-from-right-8 fade-in duration-300 shadow-2xl">
      <div className="bg-card border border-border p-3 flex flex-col gap-3 min-w-[280px]">
        <div className="flex items-center gap-3">
          <div className="size-12 rounded-none bg-muted flex items-center justify-center animate-pulse border border-border">
            {incomingCall.isVideo ? <Video className="size-5 text-foreground" /> : <Phone className="size-5 text-foreground" />}
          </div>
          <div className="flex flex-col">
            <h3 className="text-sm font-bold text-foreground">Incoming {incomingCall.isVideo ? "Video " : ""}Call</h3>
            <span className="text-xs text-muted-foreground">Someone is calling you...</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 mt-2">
          <button 
            onClick={() => {
              onDecline(incomingCall.conversationId, incomingCall.from);
              setIncomingCall(null);
            }}
            className="flex-1 bg-red-600/10 text-red-500 border border-red-500/50 hover:bg-red-600 hover:text-white transition-colors h-10 text-xs font-bold uppercase tracking-wider"
          >
            Decline
          </button>
          <button 
            onClick={() => {
              onAccept(incomingCall.conversationId, incomingCall.from, incomingCall.isVideo);
              setIncomingCall(null);
            }}
            className="flex-1 bg-green-600/10 text-green-500 border border-green-500/50 hover:bg-green-600 hover:text-white transition-colors h-10 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2"
          >
            {incomingCall.isVideo ? <Video className="size-3.5" /> : <Phone className="size-3.5" />}
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
