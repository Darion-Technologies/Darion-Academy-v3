"use client";

import { CheckCircle2, LoaderCircle, Play } from "lucide-react";
import { useEffect, useRef, useState, useTransition } from "react";
import { completeLessonAction } from "@/app/actions/learning";

type YouTubePlayerInstance = {
  destroy: () => void;
  playVideo: () => void;
};

type YouTubePlayerEvent = {
  data: number;
};

type YouTubeApi = {
  Player: new (
    element: HTMLElement,
    options: {
      videoId: string;
      playerVars: Record<string, number>;
      events: { 
        onReady?: (event: { target: YouTubePlayerInstance }) => void;
        onStateChange?: (event: YouTubePlayerEvent) => void;
      };
    },
  ) => YouTubePlayerInstance;
  PlayerState: { ENDED: number; PLAYING: number; PAUSED: number; CUED: number; };
};

declare global {
  interface Window {
    YT?: YouTubeApi;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let apiPromise: Promise<YouTubeApi> | null = null;

function loadYouTubeApi() {
  if (window.YT) return Promise.resolve(window.YT);
  if (apiPromise) return apiPromise;

  apiPromise = new Promise((resolve) => {
    const previousCallback = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previousCallback?.();
      if (window.YT) resolve(window.YT);
    };

    if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      script.async = true;
      document.head.appendChild(script);
    }
  });

  return apiPromise;
}

export function YouTubePlayer({
  lessonId,
  videoId,
  canComplete,
  initiallyCompleted,
}: {
  lessonId: string;
  videoId: string;
  canComplete: boolean;
  initiallyCompleted: boolean;
}) {
  const playerRoot = useRef<HTMLDivElement>(null);
  const ytPlayerRef = useRef<YouTubePlayerInstance | null>(null);
  const completionStarted = useRef(false);
  const [completed, setCompleted] = useState(initiallyCompleted);
  const [isPending, startTransition] = useTransition();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let player: YouTubePlayerInstance | null = null;
    let cancelled = false;

    loadYouTubeApi().then((YT) => {
      if (cancelled || !playerRoot.current) return;
      player = new YT.Player(playerRoot.current, {
        videoId,
        playerVars: {
          controls: 0,
          disablekb: 1,
          fs: 1,
          modestbranding: 1,
          playsinline: 1,
          rel: 0,
        },
        events: {
          onReady(event) {
            ytPlayerRef.current = event.target;
            setIsReady(true);
          },
          onStateChange(event) {
            if (event.data === YT.PlayerState.PLAYING) setIsPlaying(true);
            if (event.data === YT.PlayerState.PAUSED || event.data === YT.PlayerState.ENDED) setIsPlaying(false);

            if (
              event.data !== YT.PlayerState.ENDED ||
              !canComplete ||
              completed ||
              completionStarted.current
            ) return;

            completionStarted.current = true;
            const formData = new FormData();
            formData.set("lessonId", lessonId);
            formData.set("videoCompleted", "true");
            startTransition(async () => {
              await completeLessonAction(formData);
              setCompleted(true);
            });
          },
        },
      });
    });

    return () => {
      cancelled = true;
      player?.destroy();
    };
  }, [canComplete, completed, lessonId, videoId]);

  return (
    <div className="mx-auto w-full max-w-[1920px] bg-black overflow-hidden rounded-xl shadow-md border border-border">
      <div className="relative w-full aspect-video group">
        <div className="absolute inset-0 size-full border-0" ref={playerRoot} />
        
        {/* Custom Overlay */}
        {!isPlaying && (
          <div 
            className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/60 backdrop-blur-md cursor-pointer transition-all hover:bg-black/50"
            onClick={() => ytPlayerRef.current?.playVideo()}
          >
            <div className="flex flex-col items-center gap-5 transform transition-transform duration-300 group-hover:scale-105">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/20 transition-transform duration-300 group-hover:scale-110 hover:bg-primary-hover">
                <Play className="h-8 w-8 ml-1 fill-white" />
              </div>
              <span className="text-white font-medium tracking-wide drop-shadow-md">
                {isReady ? "Click to Play Video" : "Loading Player..."}
              </span>
            </div>
          </div>
        )}
      </div>
      {canComplete && (
        <div className="flex items-center gap-2 border-t border-slate-800 bg-slate-950 px-4 py-3 text-sm text-muted-foreground">
          {completed ? (
            <><CheckCircle2 className="size-4 text-emerald-400" />Video completed. Lesson marked complete.</>
          ) : isPending ? (
            <><LoaderCircle className="size-4 animate-spin" />Saving completion...</>
          ) : (
            "Watch to the end to complete this lesson. Skipping is disabled."
          )}
        </div>
      )}
    </div>
  );
}
