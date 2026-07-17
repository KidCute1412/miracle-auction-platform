import { useState, useEffect, useRef } from "react";

interface UseIdleGlanceResult {
  idleMouth: string | null;
  idleEyeOffset: { x: number; y: number } | null;
  isGlancingRef: React.RefObject<boolean>;
}

export const useIdleGlance = (
  isHovered: boolean,
  isCheeksHovered: boolean,
  winkEye: "left" | "right" | null
): UseIdleGlanceResult => {
  const [idleMouth, setIdleMouth] = useState<string | null>(null);
  const [idleEyeOffset, setIdleEyeOffset] = useState<{ x: number; y: number } | null>(null);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isGlancingRef = useRef(false);

  // Keep latest interaction state available to the global idle handler
  const isHoveredRef = useRef(isHovered);
  const isCheeksHoveredRef = useRef(isCheeksHovered);
  const winkEyeRef = useRef(winkEye);

  useEffect(() => {
    isHoveredRef.current = isHovered;
  }, [isHovered]);

  useEffect(() => {
    isCheeksHoveredRef.current = isCheeksHovered;
  }, [isCheeksHovered]);

  useEffect(() => {
    winkEyeRef.current = winkEye;
  }, [winkEye]);

  useEffect(() => {
    const triggerGlance = () => {
      if (isGlancingRef.current) return;
      if (isHoveredRef.current || isCheeksHoveredRef.current || winkEyeRef.current) {
        scheduleIdleGlance();
        return;
      }
      isGlancingRef.current = true;
      const rx = (Math.random() * 2 - 1) * 1.8;
      const ry = (Math.random() * 2 - 1) * 1.0;
      setIdleEyeOffset({ x: rx, y: ry });
      const mouthShapes = [
        "M 48.5 59 A 1.5 1.5 0 1 1 51.5 59 A 1.5 1.5 0 1 1 48.5 59",
        "M 45 58 Q 50 55 55 58"
      ];
      setIdleMouth(mouthShapes[Math.floor(Math.random() * mouthShapes.length)]);
      setTimeout(() => {
        setIdleEyeOffset(null);
        setIdleMouth(null);
        isGlancingRef.current = false;
        scheduleIdleGlance();
      }, 1800);
    };

    const scheduleIdleGlance = () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      idleTimerRef.current = setTimeout(triggerGlance, 3000);
    };

    const handleGlobalMouseMove = () => {
      if (isGlancingRef.current) return;
      scheduleIdleGlance();
    };

    window.addEventListener("mousemove", handleGlobalMouseMove);
    scheduleIdleGlance();

    return () => {
      window.removeEventListener("mousemove", handleGlobalMouseMove);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, []);

  return { idleMouth, idleEyeOffset, isGlancingRef };
};
