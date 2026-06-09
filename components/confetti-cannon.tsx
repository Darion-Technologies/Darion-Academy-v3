"use client";

import { useEffect } from "react";
import confetti from "canvas-confetti";

export function ConfettiCannon({ fire }: { fire: boolean }) {
  useEffect(() => {
    if (!fire) return;

    const duration = 3 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ["#008CBB", "#E6D5B8", "#10202D"]
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ["#008CBB", "#E6D5B8", "#10202D"]
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    frame();
  }, [fire]);

  return null;
}
