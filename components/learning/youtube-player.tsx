"use client";

import { CheckCircle2, LoaderCircle } from "lucide-react";
import { useEffect, useRef, useState, useTransition } from "react";
import { completeLessonAction } from "@/app/actions/learning";

type YouTubePlayerInstance = {
  destroy: () => void;
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
      events: { onStateChange: (event: YouTubePlayerEvent) => void };
    },
  ) => YouTubePlayerInstance;
  PlayerState: { ENDED: number };
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
  const completionStarted = useRef(false);
  const [completed, setCompleted] = useState(initiallyCompleted);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let player: YouTubePlayerInstance | null = null;
    let cancelled = false;

    loadYouTubeApi().then((YT) => {
      if (cancelled || !playerRoot.current) return;
      player = new YT.Player(playerRoot.current, {
        videoId,
        playerVars: {
          controls: 1,
          disablekb: 0,
          fs: 1,
          modestbranding: 1,
          playsinline: 1,
          rel: 0,
        },
        events: {
          onStateChange(event) {
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
    <div className="bg-black">
      <div className="aspect-video w-full [&_iframe]:size-full [&_iframe]:border-0" ref={playerRoot} />
      {canComplete && (
        <div className="flex items-center gap-2 border-t border-slate-800 bg-slate-950 px-4 py-3 text-sm text-muted-foreground">
          {completed ? (
            <><CheckCircle2 className="size-4 text-emerald-400" />Video completed. Lesson marked complete.</>
          ) : isPending ? (
            <><LoaderCircle className="size-4 animate-spin" />Saving completion...</>
          ) : (
            "Watch to the end to complete this lesson. Seeking is available."
          )}
        </div>
      )}
    </div>
  );
}
