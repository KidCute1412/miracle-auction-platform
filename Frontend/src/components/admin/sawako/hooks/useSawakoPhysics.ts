import { useState, useEffect } from "react";
import type { SawakoPhysics } from "../types";

export function useSawakoPhysics(
  eyeOffset: { x: number; y: number },
  isHovered: boolean,
  isDragging: boolean
): SawakoPhysics {
  const [isBlinking, setIsBlinking] = useState(false);

  // Periodic natural eye blinking cycle
  useEffect(() => {
    let blinkTimer: ReturnType<typeof setTimeout>;
    let openTimer: ReturnType<typeof setTimeout>;

    const scheduleBlink = () => {
      // Blink every 3.5 to 6.5 seconds randomly
      const delay = 3500 + Math.random() * 3000;
      blinkTimer = setTimeout(() => {
        setIsBlinking(true);
        openTimer = setTimeout(() => {
          setIsBlinking(false);
          scheduleBlink();
        }, 150); // Eyelids stay closed for 150ms
      }, delay);
    };

    scheduleBlink();
    return () => {
      clearTimeout(blinkTimer);
      clearTimeout(openTimer);
    };
  }, []);

  // Compute clamped pupil tracking
  const pupilX = Math.max(-5, Math.min(5, eyeOffset.x * 5));
  const pupilY = Math.max(-3.5, Math.min(3.5, eyeOffset.y * 3.5));

  // Compute head tilt based on cursor position and drag momentum
  let headRotate = Math.max(-6, Math.min(6, eyeOffset.x * 6));
  if (isDragging) {
    headRotate *= 1.4;
  } else if (isHovered) {
    headRotate *= 0.8;
  }

  return {
    pupilX,
    pupilY,
    headRotate,
    isBlinking,
  };
}
