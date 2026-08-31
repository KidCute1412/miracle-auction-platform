import { useState, useEffect, useRef, useCallback } from "react";
import type { SawakoWalkDirection } from "../types";

export interface UseSawakoRoamingOptions {
  basePosX: number;
  isDragging: boolean;
  minimized: boolean;
}

export interface UseSawakoRoamingResult {
  roamingOffsetX: number;
  isWalking: boolean;
  walkDirection: SawakoWalkDirection;
  walkDurationSec: number;
  resetRoaming: () => void;
}

export function useSawakoRoaming({
  basePosX,
  isDragging,
  minimized,
}: UseSawakoRoamingOptions): UseSawakoRoamingResult {
  const [roamingOffsetX, setRoamingOffsetX] = useState(0);
  const [isWalking, setIsWalking] = useState(false);
  const [walkDirection, setWalkDirection] = useState<SawakoWalkDirection>("left");
  const [walkDurationSec, setWalkDurationSec] = useState(3.5);

  const roamingOffsetRef = useRef(roamingOffsetX);
  roamingOffsetRef.current = roamingOffsetX;

  const basePosXRef = useRef(basePosX);
  basePosXRef.current = basePosX;

  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const walkCompleteTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearAllTimers = useCallback(() => {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
    }
    if (walkCompleteTimerRef.current) {
      clearTimeout(walkCompleteTimerRef.current);
      walkCompleteTimerRef.current = null;
    }
  }, []);

  const resetRoaming = useCallback(() => {
    clearAllTimers();
    setIsWalking(false);
    setRoamingOffsetX(0);
    roamingOffsetRef.current = 0;
  }, [clearAllTimers]);

  useEffect(() => {
    if (isDragging || minimized) {
      clearAllTimers();
      setIsWalking((prev) => (prev ? false : prev));
      return;
    }

    const scheduleNextRoam = () => {
      clearAllTimers();

      // Relaxed idle duration between 8s (8000ms) and 16s (16000ms)
      const restDelay = 8000 + Math.random() * 8000;

      idleTimerRef.current = setTimeout(() => {
        const windowWidth = typeof window !== "undefined" && window.innerWidth >= 320 ? window.innerWidth : 1280;

        // Boundaries relative to the default right-4 anchor
        // Minimum X prevents walking off the left edge (leaving space for sidebar/margin)
        const minXBound = -(windowWidth - 220);
        // Maximum X prevents walking off the right edge past base
        const maxXBound = 10;

        const currentTotalX = basePosXRef.current + roamingOffsetRef.current;
        const roomToLeft = currentTotalX - minXBound;
        const roomToRight = maxXBound - currentTotalX;

        // Determine direction based on available boundary room
        let direction: SawakoWalkDirection;
        if (roomToLeft < 100) {
          direction = "right";
        } else if (roomToRight < 100) {
          direction = "left";
        } else {
          // 65% chance to wander leftwards towards main screen, 35% rightwards
          direction = Math.random() < 0.65 ? "left" : "right";
        }

        // Random walking distance between 80px and 220px
        const maxAvailable = direction === "left" ? roomToLeft : roomToRight;
        const desiredDistance = 80 + Math.random() * 140;
        const actualDistance = Math.min(desiredDistance, Math.max(0, maxAvailable - 30));

        // Skip walk if confined to tiny space
        if (actualDistance < 40) {
          scheduleNextRoam();
          return;
        }

        // Gentle walking speed: ~36px per second
        const durationSec = Math.max(2.5, Math.min(5.5, actualDistance / 36));
        const deltaX = direction === "left" ? -actualDistance : actualDistance;
        const nextOffset = roamingOffsetRef.current + deltaX;

        setWalkDirection(direction);
        setWalkDurationSec(durationSec);
        setIsWalking(true);
        setRoamingOffsetX(nextOffset);
        roamingOffsetRef.current = nextOffset;

        // When walking animation finishes, pause and schedule next idle rest
        walkCompleteTimerRef.current = setTimeout(() => {
          setIsWalking(false);
          scheduleNextRoam();
        }, durationSec * 1000);
      }, restDelay);
    };

    scheduleNextRoam();

    return () => {
      clearAllTimers();
    };
  }, [basePosX, isDragging, minimized, clearAllTimers]);

  return {
    roamingOffsetX,
    isWalking,
    walkDirection,
    walkDurationSec,
    resetRoaming,
  };
}
