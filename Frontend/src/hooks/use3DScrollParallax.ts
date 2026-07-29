import { useState, useEffect, useRef } from "react";

interface ScrollParallaxOptions {
  speed?: number;
  maxRotateX?: number;
  maxTranslateZ?: number;
}

export function use3DScrollParallax(options: ScrollParallaxOptions = {}) {
  const { speed = 0.15, maxRotateX = 8, maxTranslateZ = 120 } = options;
  const [scrollY, setScrollY] = useState(0);
  const [transformStyle, setTransformStyle] = useState<string>("");
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }

      rafRef.current = requestAnimationFrame(() => {
        const currentY = window.scrollY;
        setScrollY(currentY);

        const rotateX = Math.min(maxRotateX, (currentY * speed * 0.05));
        const translateZ = Math.min(maxTranslateZ, (currentY * speed));
        const scale = 1 - Math.min(0.05, currentY * 0.0001);

        setTransformStyle(
          `perspective(1200px) rotateX(${rotateX.toFixed(2)}deg) translate3d(0, ${(-currentY * speed * 0.2).toFixed(2)}px, ${translateZ.toFixed(2)}px) scale(${scale.toFixed(4)})`
        );
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [speed, maxRotateX, maxTranslateZ]);

  return { scrollY, transformStyle };
}

export default use3DScrollParallax;
