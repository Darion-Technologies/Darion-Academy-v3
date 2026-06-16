"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, MicOff, Video, VideoOff, PhoneOff, MonitorUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

import { logCallAction } from "@/app/actions/call";

interface CallOverlayProps {
  conversationId: string;
  recipientId: string;
  recipientName: string;
  recipientAvatar?: string;
  isInitiator: boolean;
  isVideoCall: boolean;
  onEndCall: () => void;
  currentUserId: string;
}

export function CallOverlay({
  conversationId,
  recipientId,
  recipientName,
  recipientAvatar,
  isInitiator,
  isVideoCall,
  onEndCall,
  currentUserId,
}: CallOverlayProps) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(!isVideoCall);
  const [callStatus, setCallStatus] = useState<"connecting" | "ringing" | "connected">("connecting");
  const [duration, setDuration] = useState(0);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const channelRef = useRef<any>(null);
  const durationRef = useRef(0);
  const localStreamRef = useRef<MediaStream | null>(null);

  // Initialize WebRTC
  useEffect(() => {
    const supabase = createClient();
    
    // Create a unique channel for this call based on conversation ID
    const channel = supabase.channel(`call:${conversationId}`, {
      config: { broadcast: { self: false } }
    });
    channelRef.current = channel;

    const servers = {
      iceServers: [
        { urls: "stun:stun1.l.google.com:19302" },
        { urls: "stun:stun2.l.google.com:19302" },
      ]
    };

    const pc = new RTCPeerConnection(servers);
    peerConnection.current = pc;

    // Handle incoming ICE candidates
    pc.onicecandidate = async (event) => {
      if (event.candidate && channel.state === "joined") {
        await channel.send({
          type: "broadcast",
          event: "webrtc-signal",
          payload: { type: "candidate", candidate: event.candidate, to: recipientId, from: currentUserId }
        });
      }
    };

    // Handle incoming remote stream
    pc.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
      setCallStatus("connected");
    };

    // Get Local Media
    const startMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: isVideoCall,
          audio: true,
        });
        setLocalStream(stream);
        localStreamRef.current = stream;
        
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        stream.getTracks().forEach((track) => {
          pc.addTrack(track, stream);
        });

        // If we are the initiator, we create the offer
        if (isInitiator) {
          setCallStatus("ringing");
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          
          channel.send({
            type: "broadcast",
            event: "webrtc-signal",
            payload: { type: "offer", offer, to: recipientId, from: currentUserId, isVideo: isVideoCall }
          });
        }
      } catch (err) {
        console.error("Failed to get local media", err);
        alert("Microphone or camera permission denied.");
        handleHangup(true);
      }
    };

    // Setup signaling listeners
    channel.on("broadcast", { event: "webrtc-signal" }, async ({ payload }) => {
      // Ignore signals not meant for us
      if (payload.to !== currentUserId) return;

      if (payload.type === "offer" && !isInitiator) {
        await pc.setRemoteDescription(new RTCSessionDescription(payload.offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        
        channel.send({
          type: "broadcast",
          event: "webrtc-signal",
          payload: { type: "answer", answer, to: payload.from, from: currentUserId }
        });
      } 
      else if (payload.type === "answer" && isInitiator) {
        setCallStatus("connected");
        await pc.setRemoteDescription(new RTCSessionDescription(payload.answer));
      } 
      else if (payload.type === "candidate") {
        await pc.addIceCandidate(new RTCIceCandidate(payload.candidate));
      }
      else if (payload.type === "end-call") {
        handleHangup(false); // They hung up
      }
    });

    channel.subscribe((status) => {
      if (status === "SUBSCRIBED") {
        startMedia();
      }
    });

    return () => {
      // In React StrictMode, this runs immediately.
      // We MUST NOT call onEndCall() here, otherwise the call is instantly killed in the parent state.
      localStreamRef.current?.getTracks().forEach(track => track.stop());
      peerConnection.current?.close();
      channelRef.current?.unsubscribe();
    };
  }, []);

  // Duration Timer
  useEffect(() => {
    if (callStatus === "connected") {
      const interval = setInterval(() => {
        setDuration(d => {
          durationRef.current = d + 1;
          return d + 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [callStatus]);

  const handleHangup = async (broadcast = true) => {
    if (broadcast && channelRef.current && channelRef.current.state === "joined") {
      await channelRef.current.send({
        type: "broadcast",
        event: "webrtc-signal",
        payload: { type: "end-call", to: recipientId, from: currentUserId }
      });
    }
    
    // Only the initiator logs the call to prevent duplicates
    if (isInitiator) {
      await logCallAction(conversationId, durationRef.current, isVideoCall).catch(console.error);
    }
    
    localStreamRef.current?.getTracks().forEach(track => track.stop());
    peerConnection.current?.close();
    channelRef.current?.unsubscribe();
    onEndCall();
  };

  const toggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoOff(!isVideoOff);
    }
  };

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="absolute inset-0 z-40 bg-card flex flex-col animate-in fade-in duration-200">
      
      {/* Header Bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/50 h-12 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="size-6 bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-bold">
            {isVideoCall ? <Video className="size-3.5" /> : <Mic className="size-3.5" />}
          </div>
          <h2 className="text-[13px] font-bold text-foreground">
            {callStatus === "connecting" ? "Connecting to" : callStatus === "ringing" ? "Calling" : "Connected with"} {recipientName}
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-mono text-muted-foreground bg-background border border-border px-2 py-0.5">
            {formatDuration(duration)}
          </span>
        </div>
      </div>

      {/* Main Call Area */}
      <div className="flex-1 relative bg-background flex items-center justify-center overflow-hidden">
        {(!remoteStream || (remoteStream && remoteStream.getVideoTracks().length === 0) || !isVideoCall) ? (
          <div className="flex flex-col items-center justify-center">
            <div className="size-24 bg-muted border border-border flex items-center justify-center overflow-hidden mb-4">
              {recipientAvatar ? (
                <img src={recipientAvatar} alt="" className="size-full object-cover" />
              ) : (
                <span className="text-2xl font-bold text-muted-foreground">{recipientName.substring(0, 2).toUpperCase()}</span>
              )}
            </div>
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
              {callStatus === "connected" ? "Audio Only" : "Waiting for connection"}
            </p>
          </div>
        ) : (
          <video 
            ref={remoteVideoRef} 
            autoPlay 
            playsInline 
            className="w-full h-full object-cover"
          />
        )}

        {/* Local Video (Picture in Picture) */}
        {(isVideoCall && !isVideoOff) && (
          <div className="absolute bottom-4 right-4 w-48 aspect-video bg-muted border border-border shadow-2xl overflow-hidden z-10">
            <video 
              ref={localVideoRef} 
              autoPlay 
              playsInline 
              muted 
              className="w-full h-full object-cover mirror-x"
            />
          </div>
        )}
      </div>

      {/* Controls Bar */}
      <div className="h-16 shrink-0 border-t border-border bg-card flex items-center justify-center gap-3">
        <button 
          onClick={toggleMute}
          className={cn("size-10 flex items-center justify-center transition-colors border", isMuted ? "bg-red-500/10 text-red-500 border-red-500/50" : "bg-muted text-foreground border-border hover:bg-muted/80")}
        >
          {isMuted ? <MicOff className="size-4" /> : <Mic className="size-4" />}
        </button>
        
        {isVideoCall && (
          <button 
            onClick={toggleVideo}
            className={cn("size-10 flex items-center justify-center transition-colors border", isVideoOff ? "bg-red-500/10 text-red-500 border-red-500/50" : "bg-muted text-foreground border-border hover:bg-muted/80")}
          >
            {isVideoOff ? <VideoOff className="size-4" /> : <Video className="size-4" />}
          </button>
        )}
        
        <button 
          onClick={() => handleHangup(true)}
          className="h-10 px-6 flex items-center justify-center bg-red-600 text-white hover:bg-red-700 transition-colors border border-red-700 font-bold text-[11px] uppercase tracking-wider ml-4"
        >
          <PhoneOff className="size-4 mr-2" />
          End Call
        </button>
      </div>

    </div>
  );
}
