"use client";

import { CheckCircle2, LoaderCircle, Play, Pause, Volume2, VolumeX, Maximize, Settings, Subtitles } from "lucide-react";
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
  loadModule: (name: string) => void;
  unloadModule: (name: string) => void;
  setOption: (module: string, option: string, value: any) => void;
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
  videoStartTime,
  videoEndTime,
}: {
  lessonId: string;
  videoId: string;
  canComplete: boolean;
  initiallyCompleted: boolean;
  initialProgress?: number;
  initialMaxProgress?: number;
  videoStartTime?: number | null;
  videoEndTime?: number | null;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRoot = useRef<HTMLDivElement>(null);
  const ytPlayerRef = useRef<YouTubePlayerInstance | null>(null);
  const completionStarted = useRef(false);
  const [completed, setCompleted] = useState(initiallyCompleted);
  const [isPending, startTransition] = useTransition();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const [progress, setProgress] = useState(Math.max(initialProgress, videoStartTime || 0));
  const [maxWatched, setMaxWatched] = useState(Math.max(initialMaxProgress || initialProgress, videoStartTime || 0));
  const progressRef = useRef(progress);
  const maxWatchedRef = useRef(maxWatched);
  useEffect(() => { progressRef.current = progress; }, [progress]);
  useEffect(() => { maxWatchedRef.current = maxWatched; }, [maxWatched]);

  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const [captionsEnabled, setCaptionsEnabled] = useState(false);
  const { setCurrentTimestamp, registerSeekCallback } = useLesson();

  useEffect(() => {
    registerSeekCallback((time) => {
      let newTime = time;
      if (!completed && newTime > maxWatchedRef.current) {
        newTime = maxWatchedRef.current;
      }
      setProgress(newTime);
      if (ytPlayerRef.current) {
        ytPlayerRef.current.seekTo(newTime, true);
      }
    });
  }, [registerSeekCallback, completed]);

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
          ...(videoStartTime ? { start: videoStartTime } : {}),
          ...(videoEndTime ? { end: videoEndTime } : {}),
        },
        events: {
          onReady(event) {
            ytPlayerRef.current = event.target;
            setDuration(event.target.getDuration());
            setIsReady(true);
            if (initialProgress > 0 && (!videoStartTime || initialProgress > videoStartTime)) {
              event.target.seekTo(initialProgress, true);
            } else if (videoStartTime) {
              // the start param handles starting at the right time, but we update our state
              setProgress(videoStartTime);
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

  const toggleCaptions = () => {
    if (ytPlayerRef.current) {
      try {
        if (captionsEnabled) {
          ytPlayerRef.current.unloadModule("captions");
        } else {
          ytPlayerRef.current.loadModule("captions");
          ytPlayerRef.current.setOption("captions", "track", { languageCode: "en" });
        }
      } catch (e) {
        console.error("Captions module not available", e);
      }
      setCaptionsEnabled(!captionsEnabled);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement && containerRef.current) {
      containerRef.current.requestFullscreen();
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  };

  const effectiveStartTime = videoStartTime || 0;
  const effectiveEndTime = videoEndTime || duration;
  const effectiveDuration = Math.max(0, effectiveEndTime - effectiveStartTime);
  const displayProgress = Math.max(0, progress - effectiveStartTime);

  const handleSeekRelative = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDisplayTime = parseFloat(e.target.value);
    let newTime = newDisplayTime + effectiveStartTime;
    
    // Enforce bounds
    if (videoStartTime && newTime < videoStartTime) {
      newTime = videoStartTime;
    }
    if (videoEndTime && newTime > videoEndTime) {
      newTime = videoEndTime;
    }

    // Prevent skipping ahead of what has been watched
    if (!completed && newTime > maxWatched) {
      newTime = maxWatched;
    }

    setProgress(newTime);
    if (ytPlayerRef.current) {
      ytPlayerRef.current.seekTo(newTime, true);
    }
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!ytPlayerRef.current) return;
      
      const activeTag = document.activeElement?.tagName;
      const activeType = (document.activeElement as HTMLInputElement)?.type;
      
      // Ignore if typing in a text input or textarea
      if (
        activeTag === "TEXTAREA" || 
        (activeTag === "INPUT" && activeType !== "range" && activeType !== "button")
      ) {
        return;
      }

      switch (e.key) {
        case " ":
        case "k":
        case "K":
          e.preventDefault();
          e.stopPropagation();
          togglePlay();
          break;
        case "ArrowRight":
        case "l":
        case "L": {
          e.preventDefault();
          e.stopPropagation();
          let newTime = ytPlayerRef.current.getCurrentTime() + 10;
          if (videoEndTime && newTime > videoEndTime) newTime = videoEndTime;
          
          if (!completed && newTime > maxWatchedRef.current) {
            newTime = maxWatchedRef.current;
          }
          
          ytPlayerRef.current.seekTo(newTime, true);
          setProgress(newTime);
          break;
        }
        case "ArrowLeft":
        case "j":
        case "J": {
          e.preventDefault();
          e.stopPropagation();
          let newTime = ytPlayerRef.current.getCurrentTime() - 10;
          if (videoStartTime && newTime < videoStartTime) newTime = videoStartTime;
          else if (newTime < 0) newTime = 0;
          ytPlayerRef.current.seekTo(newTime, true);
          setProgress(newTime);
          break;
        }
        case "m":
        case "M":
          e.preventDefault();
          e.stopPropagation();
          toggleMute();
          break;
        case "f":
        case "F":
          e.preventDefault();
          e.stopPropagation();
          toggleFullscreen();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown, { capture: true });
    return () => window.removeEventListener("keydown", handleKeyDown, { capture: true });
  }, [isPlaying, isMuted, videoStartTime, videoEndTime, completed]);

  return (
    <div className="mx-auto w-full max-w-[1920px] bg-black overflow-hidden border border-border flex flex-col" ref={containerRef}>
      <div className="relative w-full aspect-video group bg-black">
        <div className="absolute inset-0 size-full border-0 pointer-events-none" ref={playerRoot} />
        
        {/* Custom Overlay (Play state) */}
        {!isPlaying ? (
          <div 
            className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/60 backdrop-blur-md cursor-pointer transition-all hover:bg-black/50"
            onClick={togglePlay}
          >
            <div className="flex flex-col items-center gap-5 transform transition-transform duration-300 group-hover:scale-105">
              <div className="flex h-20 w-20 items-center justify-center bg-primary text-white shadow-lg shadow-primary/20 transition-transform duration-300 group-hover:scale-110 hover:bg-primary-hover">
                <Play className="h-8 w-8 ml-1 fill-white" />
              </div>
              <span className="text-white font-medium tracking-wide drop-shadow-md">
                {isReady ? "Click to Play Video" : "Loading Player..."}
              </span>
            </div>
          </div>
        ) : (
          <div 
            className="absolute inset-0 z-10 cursor-pointer" 
            onClick={togglePlay} 
          />
        )}

        {/* Custom Controls (Active when playing or ready) */}
        {isReady && (
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent pt-10 pb-2 px-4 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-2 z-20">
            {/* Timeline scrubber */}
            <input
              type="range"
              min={0}
              max={effectiveDuration || 100}
              value={displayProgress}
              onChange={handleSeekRelative}
              className="w-full h-1 bg-white/30 appearance-none cursor-pointer accent-blue-500 hover:h-2 transition-all"
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
                    {formatTime(displayProgress)} / {formatTime(effectiveDuration)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4 relative">
                <button 
                  onClick={toggleCaptions} 
                  className={`transition-colors ${captionsEnabled ? 'text-blue-400' : 'hover:text-blue-400'}`}
                  title="Toggle Captions"
                >
                  <Subtitles className="size-4" />
                </button>
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
