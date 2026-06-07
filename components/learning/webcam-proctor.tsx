"use client";

import { useEffect, useRef, useState } from "react";
import * as tf from "@tensorflow/tfjs";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
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

    async function initProctoring() {
      try {
        console.log("[Proctor] Requesting camera...");
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
        if (!active || !videoRef.current) return;
        
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

        console.log("[Proctor] Waiting for tfjs ready...");
        await tf.ready();
        
        console.log("[Proctor] Loading coco-ssd...");
        const model = await cocoSsd.load({ base: "lite_mobilenet_v2" });
        if (!active) return;
        
        console.log("[Proctor] AI Model loaded successfully.");
        setModelLoading(false);
        onModelLoaded();

        detectionInterval = setInterval(async () => {
          if (!videoRef.current || videoRef.current.paused || videoRef.current.ended) return;
          
          try {
            // Lower threshold to 0.4 to catch more phones, even at bad angles
            const predictions = await model.detect(videoRef.current, 10, 0.4);
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
          } catch (e) {
          }
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
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [onWarning, onModelLoaded, onCameraDenied]);

  return (
    <div className="relative overflow-hidden rounded-md border border-border bg-slate-900 shadow-sm" style={{ width: 160, height: 120 }}>
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
        <div className="size-1.5 rounded-full bg-red-500 animate-pulse" />
        <span className="text-[9px] font-bold text-white tracking-widest uppercase">REC</span>
      </div>
    </div>
  );
}
