import { useState, useEffect, useRef } from "react";

interface UseGavelChargeResult {
  chargeProgress: number;
  isScreenShaking: boolean;
  isStriking: boolean;
  isRippling: boolean;
  handleGavelMouseDown: (e: React.MouseEvent) => void;
  handleGavelMouseUp: (e: React.MouseEvent) => void;
  handleGavelMouseLeave: () => void;
}

export const useGavelCharge = (
  isSmiling: boolean,
  dialogues: string[],
  setBubbleText: React.Dispatch<React.SetStateAction<string>>,
  isCharging: boolean,
  setIsCharging: React.Dispatch<React.SetStateAction<boolean>>
): UseGavelChargeResult => {
  const [chargeProgress, setChargeProgress] = useState(0);
  const [isScreenShaking, setIsScreenShaking] = useState(false);
  const [isStriking, setIsStriking] = useState(false);
  const [isRippling, setIsRippling] = useState(false);

  const chargeIntervalRef = useRef<number | null>(null);
  const chargeStartTimeRef = useRef<number>(0);

  // Periodic gavel striking (every 8 seconds) - disabled when sạc/interacted to avoid conflict
  useEffect(() => {
    if (isCharging) return;
    const strikeInterval = setInterval(() => {
      if (isCharging || isStriking) return;
      setIsStriking(true);
      setIsRippling(true);
      setTimeout(() => {
        setIsStriking(false);
        setIsRippling(false);
      }, 1200);
    }, 8000);

    return () => clearInterval(strikeInterval);
  }, [isCharging, isStriking]);

  const handleGavelMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isStriking) return;
    setIsCharging(true);
    setChargeProgress(0);
    chargeStartTimeRef.current = Date.now();
    setBubbleText("Charging quantum gavel force... xD");

    const updateCharge = () => {
      const elapsed = Date.now() - chargeStartTimeRef.current;
      const progress = Math.min((elapsed / 1200) * 100, 100); // 1.2s to fully charge
      setChargeProgress(progress);
      if (progress < 100) {
        chargeIntervalRef.current = requestAnimationFrame(updateCharge);
      } else {
        setBubbleText("MAX CHARGE LOADED! Release to lock bid! :v");
      }
    };
    chargeIntervalRef.current = requestAnimationFrame(updateCharge);
  };

  const handleGavelMouseUp = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isCharging) return;
    setIsCharging(false);
    if (chargeIntervalRef.current) {
      cancelAnimationFrame(chargeIntervalRef.current);
    }

    const finalProgress = chargeProgress;
    setIsStriking(true);
    setIsRippling(true);

    if (finalProgress >= 90) {
      setBubbleText("QUANTUM BID CONFIRMED! TO THE MOON! =))");
      setIsScreenShaking(true);
      setTimeout(() => {
        setIsScreenShaking(false);
      }, 450);
      setTimeout(() => {
        setIsStriking(false);
        setIsRippling(false);
        setBubbleText(isSmiling ? dialogues[1] : dialogues[0]);
        setChargeProgress(0);
      }, 1400);
    } else {
      setBubbleText(dialogues[3]);
      setTimeout(() => {
        setIsStriking(false);
        setIsRippling(false);
        setBubbleText(isSmiling ? dialogues[1] : dialogues[0]);
        setChargeProgress(0);
      }, 1200);
    }
  };

  const handleGavelMouseLeave = () => {
    if (isCharging) {
      setIsCharging(false);
      setChargeProgress(0);
      if (chargeIntervalRef.current) {
        cancelAnimationFrame(chargeIntervalRef.current);
      }
      setBubbleText(isSmiling ? dialogues[1] : dialogues[0]);
    }
  };

  return {
    chargeProgress,
    isScreenShaking,
    isStriking,
    isRippling,
    handleGavelMouseDown,
    handleGavelMouseUp,
    handleGavelMouseLeave
  };
};
