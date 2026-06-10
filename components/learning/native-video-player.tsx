"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize, Settings, CheckCircle2, LoaderCircle } from "lucide-react";
import { saveVideoProgressAction } from "@/app/actions/learning";
import { useLesson } from "./lesson-context";

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function NativeVideoPlayer({
  lessonId,
  videoUrl,
  canComplete,
  initiallyCompleted,
  initialProgress = 0,
  onProgress,
}: {
  lessonId: string;
  videoUrl: string;
  canComplete: boolean;
  initiallyCompleted: boolean;
  initialProgress?: number;
  initialMaxProgress?: number;
  onProgress?: (time: number) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
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
  const [completed, setCompleted] = useState(initiallyCompleted);
  const [isPending, startTransition] = useTransition();
  const { setCurrentTimestamp, registerSeekCallback } = useLesson();

  // Auto-resume on mount
  useEffect(() => {
    if (videoRef.current && initialProgress > 0) {
      videoRef.current.currentTime = initialProgress;
    }
  }, [initialProgress]);

  useEffect(() => {
    registerSeekCallback((time) => {
      setProgress(time);
      if (videoRef.current) {
        videoRef.current.currentTime = time;
      }
    });
  }, [registerSeekCallback]);

  // Handle Play/Pause
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const current = videoRef.current.currentTime;
    setProgress(current);
    setCurrentTimestamp(current);
    setMaxWatched(prev => Math.max(prev, current));
    if (onProgress) onProgress(current);
  };

  // Debounced auto-save every 10 seconds
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

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newTime = parseFloat(e.target.value);
    if (newTime > maxWatched) {
      newTime = maxWatched; // Prevent seeking forward past what has been watched
    }
    setProgress(newTime);
    if (videoRef.current) videoRef.current.currentTime = newTime;
    if (onProgress) onProgress(newTime);
  };

  const handleEnded = () => {
    setIsPlaying(false);
    if (!completed && canComplete) {
      const formData = new FormData();
      formData.set("lessonId", lessonId);
      formData.set("timestamp", Math.floor(progress).toString());
      formData.set("maxTimestamp", Math.floor(maxWatched).toString());
      formData.set("completed", "true");
      startTransition(async () => {
        await saveVideoProgressAction(formData);
        setCompleted(true);
      });
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const changeSpeed = (speed: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
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

  return (
    <div className="bg-black flex flex-col h-full w-full" ref={containerRef}>
      <div className="relative group w-full flex-1 flex items-center justify-center bg-black">
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full max-h-full aspect-video object-contain cursor-pointer"
          onClick={togglePlay}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
          onEnded={handleEnded}
        />

        {/* Custom Controls */}
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent pt-10 pb-2 px-4 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-2">
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
      </div>
      
      {canComplete && (
        <div className="flex items-center gap-2 border-t border-slate-800 bg-slate-950 px-4 py-3 text-sm text-muted-foreground">
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
