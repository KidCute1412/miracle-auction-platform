import { useEffect, useState, useRef } from "react";

interface Sparkle {
  id: number;
  x: number;
  y: number;
  size: number;
  rotation: number;
  color: string;
}

export default function CursorStarTrail() {
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);
  const lastSpawnRef = useRef<number>(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      // Throttle spawn to once every 45ms for optimal performance & elegant density
      if (now - lastSpawnRef.current < 45) return;
      lastSpawnRef.current = now;

      const colors = ["#F59E0B", "#FBBF24", "#FCD34D", "#34D399", "#E0E7FF"];
      const newSparkle: Sparkle = {
        id: now + Math.random(),
        x: e.clientX,
        y: e.clientY,
        size: 10 + Math.random() * 14,
        rotation: Math.random() * 90,
        color: colors[Math.floor(Math.random() * colors.length)],
      };

      setSparkles((prev) => [...prev.slice(-15), newSparkle]);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    if (sparkles.length === 0) return;
    const timer = setTimeout(() => {
      setSparkles((prev) => prev.filter((s) => Date.now() - s.id < 600));
    }, 100);
    return () => clearTimeout(timer);
  }, [sparkles]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      {sparkles.map((s) => (
        <span
          key={s.id}
          className="fixed pointer-events-none animate-sparkle-float select-none"
          style={{
            left: `${s.x}px`,
            top: `${s.y}px`,
            fontSize: `${s.size}px`,
            color: s.color,
            transform: `translate(-50%, -50%) rotate(${s.rotation}deg)`,
            textShadow: `0 0 10px ${s.color}, 0 0 20px rgba(245, 158, 11, 0.6)`,
          }}
        >
          ✦
        </span>
      ))}
    </div>
  );
}
