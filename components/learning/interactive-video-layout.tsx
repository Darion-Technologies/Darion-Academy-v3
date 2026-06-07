"use client";

import { useState } from "react";
import { NativeVideoPlayer } from "./native-video-player";
import { VideoNotes, VideoNoteItem } from "./video-notes";

export function InteractiveVideoLayout({
  lessonId,
  videoUrl,
  canComplete,
  initiallyCompleted,
  initialProgress = 0,
  notes,
}: {
  lessonId: string;
  videoUrl: string;
  canComplete: boolean;
  initiallyCompleted: boolean;
  initialProgress?: number;
  notes: VideoNoteItem[];
}) {
  const [currentTime, setCurrentTime] = useState(initialProgress);
  const [seekToTime, setSeekToTime] = useState<number | null>(null);

  const handleSeek = (time: number) => {
    setSeekToTime(time);
    // Reset seekToTime so the player can consume it once
    setTimeout(() => setSeekToTime(null), 100);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] border border-border bg-card shadow-sm overflow-hidden">
      <div className="flex flex-col border-b lg:border-b-0 lg:border-r border-border">
        <NativeVideoPlayer
          lessonId={lessonId}
          videoUrl={videoUrl}
          canComplete={canComplete}
          initiallyCompleted={initiallyCompleted}
          initialProgress={seekToTime !== null ? seekToTime : initialProgress}
          onProgress={setCurrentTime}
        />
      </div>
      <div className="h-[400px] lg:h-auto">
        <VideoNotes
          lessonId={lessonId}
          currentProgress={currentTime}
          notes={notes}
          onSeekTo={handleSeek}
        />
      </div>
    </div>
  );
}
