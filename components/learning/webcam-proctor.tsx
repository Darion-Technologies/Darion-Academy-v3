"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";

type WebcamProctorProps = {
  onWarning: (message: string) => void;
  onModelLoaded: () => void;
  onCameraDenied: (errorMsg?: string) => void;
};

export function WebcamProctor({ onWarning, onModelLoaded, onCameraDenied }: WebcamProctorProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [modelLoading, setModelLoading] = useState(true);

  useEffect(() => {
    let active = true;
    let detectionInterval: NodeJS.Timeout;
    let worker: Worker | null = null;

    async function initProctoring() {
      try {
        console.log("[Proctor] Requesting camera...");
        let stream: MediaStream;
        try {
          stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
        } catch (initialErr) {
          console.warn("[Proctor] Failed to get user-facing camera, falling back to default...", initialErr);
          stream = await navigator.mediaDevices.getUserMedia({ video: true });
        }

        if (!active || !videoRef.current) return;
        
        // Optimization: Remember that the user granted camera access
        document.cookie = "camera_granted=1; path=/; max-age=31536000; SameSite=Lax";
        
        console.log("[Proctor] Camera acquired, setting video source...");
        videoRef.current.srcObject = stream;
        
        await new Promise((resolve) => {
          videoRef.current!.onloadedmetadata = resolve;
          // Fallback just in case onloadedmetadata doesn't fire
          setTimeout(resolve, 2000); 
        });
        
        console.log("[Proctor] Playing video...");
        try {
          await videoRef.current.play();
        } catch (playErr) {
          console.warn("[Proctor] Play interrupted, but ignoring:", playErr);
        }

        console.log("[Proctor] Spawning AI Web Worker...");
        worker = new Worker(new URL("./proctor.worker.ts", import.meta.url));
        
        worker.onmessage = (e) => {
          if (e.data.type === 'loaded') {
            if (!active) return;
            console.log("[Proctor] AI Model loaded in Worker successfully.");
            setModelLoading(false);
            onModelLoaded();
          } else if (e.data.type === 'result') {
            const predictions = e.data.predictions;
            let personCount = 0;
            let cellPhoneDetected = false;

            for (const p of predictions) {
              if (p.class === "person") personCount++;
              if (p.class === "cell phone") cellPhoneDetected = true;
            }

            if (cellPhoneDetected) {
              onWarning("Mobile phone detected in frame.");
            } else if (personCount > 1) {
              onWarning("Multiple people detected in frame.");
            } else if (personCount === 0) {
              onWarning("Face not visible in frame.");
            }
          }
        };

        worker.postMessage({ type: 'load' });

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        detectionInterval = setInterval(() => {
          if (!videoRef.current || videoRef.current.paused || videoRef.current.ended || !ctx || !worker) return;
          const video = videoRef.current;
          
          if (video.videoWidth === 0 || video.videoHeight === 0) return;
          
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          
          worker.postMessage({ type: 'detect', imageData });
        }, 3000); 

      } catch (err: any) {
        console.error("[Proctor] Initialization error:", err);
        if (active) onCameraDenied(err?.message || "Unknown camera error");
      }
    }

    initProctoring();

    return () => {
      active = false;
      clearInterval(detectionInterval);
      if (worker) worker.terminate();
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [onWarning, onModelLoaded, onCameraDenied]);

  return (
    <div className="relative overflow-hidden border border-border bg-slate-900 shadow-sm" style={{ width: 160, height: 120 }}>
      {modelLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/80 text-white z-10">
          <Loader2 className="size-5 animate-spin mb-1 text-blue-400" />
          <span className="text-[10px] font-medium uppercase tracking-wider">Loading AI</span>
        </div>
      )}
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="h-full w-full object-cover"
        style={{ transform: "scaleX(-1)" }} // Mirror effect
      />
      <div className="absolute top-1.5 left-1.5 flex items-center gap-1.5 rounded bg-black/60 px-1.5 py-0.5 backdrop-blur-sm">
        <div className="size-1.5 bg-red-500 animate-pulse" />
        <span className="text-[9px] font-bold text-white tracking-widest uppercase">REC</span>
      </div>
    </div>
  );
}
