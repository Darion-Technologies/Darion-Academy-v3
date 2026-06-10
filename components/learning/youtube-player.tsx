"use client";

import { CheckCircle2, LoaderCircle, Play, Pause, Volume2, VolumeX, Maximize, Settings } from "lucide-react";
import { useEffect, useRef, useState, useTransition } from "react";
import { completeLessonAction, saveVideoProgressAction } from "@/app/actions/learning";
import { useLesson } from "./lesson-context";

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

type YouTubePlayerInstance = {
  destroy: () => void;
  playVideo: () => void;
  pauseVideo: () => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  isMuted: () => boolean;
  mute: () => void;
  unMute: () => void;
  getPlaybackRate: () => number;
  setPlaybackRate: (rate: number) => void;
};

type YouTubePlayerEvent = {
  data: number;
  target: YouTubePlayerInstance;
};

type YouTubeApi = {
  Player: new (
    element: HTMLElement,
    options: {
      videoId: string;
      playerVars: Record<string, number>;
      events: { 
        onReady?: (event: YouTubePlayerEvent) => void;
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
  initialProgress = 0,
  initialMaxProgress = 0,
}: {
  lessonId: string;
  videoId: string;
  canComplete: boolean;
  initiallyCompleted: boolean;
  initialProgress?: number;
  initialMaxProgress?: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRoot = useRef<HTMLDivElement>(null);
  const ytPlayerRef = useRef<YouTubePlayerInstance | null>(null);
  const completionStarted = useRef(false);
  const [completed, setCompleted] = useState(initiallyCompleted);
  const [isPending, startTransition] = useTransition();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const [progress, setProgress] = useState(initialProgress);
  const [maxWatched, setMaxWatched] = useState(initialMaxProgress || initialProgress);
  const progressRef = useRef(progress);
  const maxWatchedRef = useRef(maxWatched);
  useEffect(() => { progressRef.current = progress; }, [progress]);
  useEffect(() => { maxWatchedRef.current = maxWatched; }, [maxWatched]);

  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const { setCurrentTimestamp, registerSeekCallback } = useLesson();

  useEffect(() => {
    registerSeekCallback((time) => {
      setProgress(time);
      if (ytPlayerRef.current) {
        ytPlayerRef.current.seekTo(time, true);
      }
    });
  }, [registerSeekCallback]);

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
          fs: 0,
          modestbranding: 1,
          playsinline: 1,
          rel: 0,
        },
        events: {
          onReady(event) {
            ytPlayerRef.current = event.target;
            setDuration(event.target.getDuration());
            setIsReady(true);
            if (initialProgress > 0) {
              event.target.seekTo(initialProgress, true);
            }
          },
          onStateChange(event) {
            if (event.data === YT.PlayerState.PLAYING) setIsPlaying(true);
            if (event.data === YT.PlayerState.PAUSED || event.data === YT.PlayerState.ENDED) setIsPlaying(false);

            if (event.data === YT.PlayerState.ENDED) {
              if (!completed && canComplete && !completionStarted.current) {
                completionStarted.current = true;
                const formData = new FormData();
                formData.set("lessonId", lessonId);
                formData.set("videoCompleted", "true");
                startTransition(async () => {
                  await completeLessonAction(formData);
                  setCompleted(true);
                });
              }
            }
          },
        },
      });
    });

    return () => {
      cancelled = true;
      player?.destroy();
    };
  }, [canComplete, completed, lessonId, videoId, initialProgress]);

  // Polling for progress update
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      if (ytPlayerRef.current) {
        const current = ytPlayerRef.current.getCurrentTime();
        setProgress(current);
        setCurrentTimestamp(current);
        setMaxWatched((prev) => Math.max(prev, current));
      }
    }, 500);
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Auto-save every 10 seconds
  useEffect(() => {
    if (!isPlaying || completed || !canComplete) return;
    const interval = setInterval(() => {
      const formData = new FormData();
      formData.set("lessonId", lessonId);
      formData.set("timestamp", Math.floor(progressRef.current).toString());
      formData.set("maxTimestamp", Math.floor(maxWatchedRef.current).toString());
      startTransition(() => {
        saveVideoProgressAction(formData);
      });
    }, 10000);
    return () => clearInterval(interval);
  }, [isPlaying, lessonId, canComplete, completed]);

  const togglePlay = () => {
    if (ytPlayerRef.current) {
      if (isPlaying) ytPlayerRef.current.pauseVideo();
      else ytPlayerRef.current.playVideo();
    }
  };

  const toggleMute = () => {
    if (ytPlayerRef.current) {
      const currentlyMuted = ytPlayerRef.current.isMuted();
      if (currentlyMuted) ytPlayerRef.current.unMute();
      else ytPlayerRef.current.mute();
      setIsMuted(!currentlyMuted);
    }
  };

  const changeSpeed = (speed: number) => {
    if (ytPlayerRef.current) {
      ytPlayerRef.current.setPlaybackRate(speed);
      setPlaybackRate(speed);
      setShowSettings(false);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement && containerRef.current) {
      containerRef.current.requestFullscreen();
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newTime = parseFloat(e.target.value);
    if (newTime > maxWatched) {
      newTime = maxWatched;
    }
    setProgress(newTime);
    if (ytPlayerRef.current) {
      ytPlayerRef.current.seekTo(newTime, true);
    }
  };

  return (
    <div className="mx-auto w-full max-w-[1920px] bg-black overflow-hidden rounded-none border border-border flex flex-col" ref={containerRef}>
      <div className="relative w-full aspect-video group bg-black">
        <div className="absolute inset-0 size-full border-0 pointer-events-none" ref={playerRoot} />
        
        {/* Custom Overlay */}
        {!isPlaying && (
          <div 
            className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/60 backdrop-blur-md cursor-pointer transition-all hover:bg-black/50"
            onClick={togglePlay}
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

        {/* Custom Controls (Active when playing or ready) */}
        {isReady && (
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent pt-10 pb-2 px-4 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-2 z-20">
            {/* Timeline scrubber */}
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={progress}
              onChange={handleSeek}
              className="w-full h-1 bg-white/30 rounded-full appearance-none cursor-pointer accent-blue-500 hover:h-2 transition-all"
            />
            
            <div className="flex items-center justify-between text-white text-sm">
              <div className="flex items-center gap-4">
                <button onClick={togglePlay} className="hover:text-blue-400 transition-colors">
                  {isPlaying ? <Pause className="size-5" /> : <Play className="size-5" />}
                </button>
                
                <div className="flex items-center gap-2">
                  <button onClick={toggleMute} className="hover:text-blue-400 transition-colors">
                    {isMuted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
                  </button>
                  <span className="font-mono text-xs">
                    {formatTime(progress)} / {formatTime(duration)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4 relative">
                <div className="relative">
                  <button onClick={() => setShowSettings(!showSettings)} className="hover:text-blue-400 transition-colors flex items-center gap-1">
                    <span className="text-xs font-semibold">{playbackRate}x</span>
                    <Settings className="size-4" />
                  </button>
                  {showSettings && (
                    <div className="absolute bottom-full right-0 mb-2 bg-slate-900 border border-slate-700 rounded shadow-xl overflow-hidden flex flex-col z-50">
                      {[0.5, 1, 1.25, 1.5, 2].map(speed => (
                        <button 
                          key={speed} 
                          onClick={() => changeSpeed(speed)}
                          className={`px-4 py-2 text-xs text-left hover:bg-slate-800 ${playbackRate === speed ? "text-blue-400 font-bold" : "text-white"}`}
                        >
                          {speed}x
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                
                <button onClick={toggleFullscreen} className="hover:text-blue-400 transition-colors">
                  <Maximize className="size-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {canComplete && (
        <div className="flex items-center gap-2 border-t border-slate-800 bg-slate-950 px-4 py-3 text-sm text-muted-foreground z-20 relative">
          {completed ? (
            <><CheckCircle2 className="size-4 text-emerald-400" />Video completed. Lesson marked complete.</>
          ) : isPending ? (
            <><LoaderCircle className="size-4 animate-spin" />Saving completion...</>
          ) : (
            "Watch to the end to complete this lesson."
          )}
        </div>
      )}
    </div>
  );
}
