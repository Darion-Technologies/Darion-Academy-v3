"use client";

import { useState, useEffect, useCallback, useRef } from "react";

type ProctoringState = {
  warnings: number;
  isTerminated: boolean;
};

export function useProctoring(isStrict: boolean, maxWarnings: number = 3) {
  const [warnings, setWarnings] = useState(0);
  const [isTerminated, setIsTerminated] = useState(false);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  const hasStarted = useRef(false);

  const issueWarning = useCallback(
    (message: string) => {
      if (!isStrict || !hasStarted.current || isTerminated) return;
      
      setWarnings((prev) => {
        const newCount = prev + 1;
        if (newCount >= maxWarnings) {
          setIsTerminated(true);
          setWarningMessage("Quiz terminated due to multiple policy violations.");
        } else {
          setWarningMessage(message);
        }
        return newCount;
      });
    },
    [isStrict, isTerminated, maxWarnings]
  );

  const startProctoring = () => {
    hasStarted.current = true;
    if (isStrict && document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {
        issueWarning("Please allow fullscreen mode to continue.");
      });
    }
  };

  useEffect(() => {
    if (!isStrict || !hasStarted.current || isTerminated) return;

    // Visibility & Window Shift Detection
    const handleVisibilityChange = () => {
      if (document.hidden) {
        issueWarning("You switched tabs or minimized the browser window.");
      }
    };
    
    const handleBlur = () => {
      issueWarning("You clicked outside the quiz window.");
    };

    // Fullscreen Exit Detection
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        issueWarning("You exited fullscreen mode.");
      }
    };

    // Prevent Copy/Paste/Right-Click/Screenshots
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    const handleCopy = (e: ClipboardEvent) => e.preventDefault();
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent PrintScreen
      if (e.key === "PrintScreen") {
        e.preventDefault();
        issueWarning("Taking screenshots is prohibited.");
      }
      
      // Prevent Mac/Windows screenshot shortcuts (Meta+Shift+3/4/5/S)
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && ["3", "4", "5", "s", "S"].includes(e.key)) {
        e.preventDefault();
        issueWarning("Taking screenshots is prohibited.");
      }

      // Prevent Ctrl+C, Ctrl+V, Ctrl+P, F12
      if ((e.ctrlKey || e.metaKey) && ["c", "v", "p"].includes(e.key.toLowerCase())) {
        e.preventDefault();
      }
      if (e.key === "F12") e.preventDefault();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("copy", handleCopy);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isStrict, issueWarning, isTerminated]);

  return {
    warnings,
    isTerminated,
    warningMessage,
    dismissWarning: () => setWarningMessage(null),
    startProctoring,
    issueWarning,
  };
}
