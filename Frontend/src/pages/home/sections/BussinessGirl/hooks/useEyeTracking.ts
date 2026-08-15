import { useState, useEffect } from "react";

export const useEyeTracking = (
  containerRef: React.RefObject<HTMLDivElement | null>,
  idleEyeOffset: { x: number; y: number } | null,
  isGlancingRef: React.RefObject<boolean>
) => {
  const [eyeOffset, setEyeOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // Disable on touch devices to conserve CPU
    if (window.matchMedia("(pointer: coarse)").matches) return;

    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let animationFrameId: number | null = null;
    let hasMoved = false;
    let isRunning = false;

    const clamp = (val: number, min: number, max: number) => Math.min(Math.max(val, min), max);

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

      // Only update if movement is significant
      if (Math.abs(dx) > 0.002 || Math.abs(dy) > 0.002) {
        currentX += dx * 0.15;
        currentY += dy * 0.15;
        setEyeOffset({ x: currentX, y: currentY });
        animationFrameId = requestAnimationFrame(updatePosition);
      } else {
        currentX = tx;
        currentY = ty;
        setEyeOffset({ x: currentX, y: currentY });
        isRunning = false;
        animationFrameId = null;
      }
    };

    const startLoop = () => {
      if (!isRunning) {
        isRunning = true;
        animationFrameId = requestAnimationFrame(updatePosition);
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;

      targetX = clamp(x, -1, 1) * 0.6;
      targetY = clamp(y, -1, 1) * 0.4;
      hasMoved = true;
      startLoop();
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    startLoop();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [containerRef, idleEyeOffset, isGlancingRef]);

  return eyeOffset;
};
