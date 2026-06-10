"use client";

import React, { createContext, useContext, useState, useCallback, useRef } from "react";

type LessonContextType = {
  currentTimestamp: number;
  setCurrentTimestamp: (time: number) => void;
  seekTo: (time: number) => void;
  registerSeekCallback: (callback: (time: number) => void) => void;
};

const LessonContext = createContext<LessonContextType | null>(null);

export function LessonProvider({ children }: { children: React.ReactNode }) {
  const [currentTimestamp, setCurrentTimestamp] = useState(0);
  const seekCallbackRef = useRef<((time: number) => void) | null>(null);

  const registerSeekCallback = useCallback((callback: (time: number) => void) => {
    seekCallbackRef.current = callback;
  }, []);

  const seekTo = useCallback((time: number) => {
    if (seekCallbackRef.current) {
      seekCallbackRef.current(time);
    }
  }, []);

  return (
    <LessonContext.Provider value={{ currentTimestamp, setCurrentTimestamp, seekTo, registerSeekCallback }}>
      {children}
    </LessonContext.Provider>
  );
}

export function useLesson() {
  const context = useContext(LessonContext);
  if (!context) {
    throw new Error("useLesson must be used within a LessonProvider");
  }
  return context;
}
