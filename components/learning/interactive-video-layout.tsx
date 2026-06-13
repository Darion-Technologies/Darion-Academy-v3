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
}: {
  lessonId: string;
  videoUrl: string;
  canComplete: boolean;
  initiallyCompleted: boolean;
  initialProgress?: number;
  initialMaxProgress?: number;
}) {
  const [currentTime, setCurrentTime] = useState(initialProgress);

  return (
    <div className="border border-border bg-black shadow-sm overflow-hidden">
      <NativeVideoPlayer
          lessonId={lessonId}
          videoUrl={videoUrl}
          canComplete={canComplete}
          initiallyCompleted={initiallyCompleted}
          initialProgress={initialProgress}
        initialMaxProgress={initialMaxProgress}
        onProgress={setCurrentTime}
      />
    </div>
  );
}
