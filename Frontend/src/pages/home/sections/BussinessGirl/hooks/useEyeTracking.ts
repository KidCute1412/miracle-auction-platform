import { useState, useEffect } from "react";

export const useEyeTracking = (
  containerRef: React.RefObject<HTMLDivElement | null>,
  idleEyeOffset: { x: number; y: number } | null,
  isGlancingRef: React.RefObject<boolean>
) => {
  const [eyeOffset, setEyeOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let animationFrameId: number;
    let hasMoved = false;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;

      const clamp = (val: number, min: number, max: number) => Math.min(Math.max(val, min), max);
      targetX = clamp(x, -1, 1) * 2.0;
      targetY = clamp(y, -1, 1) * 1.5;
      hasMoved = true;
    };

    const updatePosition = () => {
      let tx = 0;
      let ty = 0;

      if (hasMoved) {
        tx = targetX;
        ty = targetY;
      } else if (isGlancingRef.current && idleEyeOffset) {
        tx = idleEyeOffset.x;
        ty = idleEyeOffset.y;
      }

      const dx = tx - currentX;
      const dy = ty - currentY;

      currentX += dx * 0.12;
      currentY += dy * 0.12;

      setEyeOffset({ x: currentX, y: currentY });
      animationFrameId = requestAnimationFrame(updatePosition);
    };

    window.addEventListener("mousemove", handleMouseMove);
    animationFrameId = requestAnimationFrame(updatePosition);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [containerRef, idleEyeOffset, isGlancingRef]);

  return eyeOffset;
};
