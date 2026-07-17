import { useState, useEffect } from "react";

export const useBlinking = (): boolean => {
  const [isBlinking, setIsBlinking] = useState(false);

  useEffect(() => {
    let timeoutId: number;

    const triggerBlink = () => {
      setIsBlinking(true);
      setTimeout(() => {
        setIsBlinking(false);
      }, 150);

      const nextBlinkDelay = Math.random() * 3000 + 2000;
      timeoutId = window.setTimeout(triggerBlink, nextBlinkDelay);
    };

    const initialDelay = Math.random() * 3000 + 2000;
    timeoutId = window.setTimeout(triggerBlink, initialDelay);

    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  return isBlinking;
};
