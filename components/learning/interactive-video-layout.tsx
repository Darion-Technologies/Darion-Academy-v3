"use client";

import { useState } from "react";
import { NativeVideoPlayer } from "./native-video-player";

export function InteractiveVideoLayout({
  lessonId,
  videoUrl,
  canComplete,
  initiallyCompleted,
  initialProgress = 0,
  initialMaxProgress = 0,
  videoStartTime,
  videoEndTime,
}: {
  lessonId: string;
  videoUrl: string;
  canComplete: boolean;
  initiallyCompleted: boolean;
  initialProgress?: number;
  initialMaxProgress?: number;
  videoStartTime?: number | null;
  videoEndTime?: number | null;
}) {
  const [currentTime, setCurrentTime] = useState(initialProgress);

  return (
    <div className="border border-border bg-black shadow-sm overflow-hidden aspect-video relative w-full rounded-xl">
      <NativeVideoPlayer
          lessonId={lessonId}
          videoUrl={videoUrl}
          canComplete={canComplete}
          initiallyCompleted={initiallyCompleted}
        initialProgress={initialProgress}
        initialMaxProgress={initialMaxProgress}
        videoStartTime={videoStartTime}
        videoEndTime={videoEndTime}
        onProgress={setCurrentTime}
      />
    </div>
  );
}
