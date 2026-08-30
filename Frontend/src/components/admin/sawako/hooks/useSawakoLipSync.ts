import { useState, useEffect } from "react";

export function useSawakoLipSync(isSpeaking: boolean): { mouthOpenRatio: number } {
  const [mouthOpenRatio, setMouthOpenRatio] = useState(0);

  useEffect(() => {
    if (!isSpeaking) {
      setMouthOpenRatio(0);
      return;
    }

    // Natural speech cadence oscillating at ~4Hz
    let frameId: number;
    const startTime = performance.now();

    const updateCadence = (now: number) => {
      const elapsed = (now - startTime) / 1000;
      // Multi-frequency wave for natural speech modulation
      const raw = Math.sin(elapsed * 24) * 0.5 + Math.sin(elapsed * 14) * 0.3 + 0.2;
      setMouthOpenRatio(Math.max(0, Math.min(1, raw)));
      frameId = requestAnimationFrame(updateCadence);
    };

    frameId = requestAnimationFrame(updateCadence);
    return () => cancelAnimationFrame(frameId);
  }, [isSpeaking]);

  return { mouthOpenRatio };
}
