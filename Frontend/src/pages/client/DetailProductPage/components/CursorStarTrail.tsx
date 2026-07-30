import { useEffect, useState, useRef } from "react";

interface Sparkle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  char: string;
}

export default function CursorStarTrail() {
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);
  const lastSpawnRef = useRef<number>(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      // Throttle spawn to once every 40ms for smooth fluid trail
      if (now - lastSpawnRef.current < 40) return;
      lastSpawnRef.current = now;

      // Vanguard Elite Champagne Gold color palette
      const vanguardGoldColors = [
        "#E6C25B", // Champagne Gold Primary
        "#F0CD6D", // Bright Champagne Glow
        "#D4AF37", // Metallic Gold Accent
        "#F59E0B", // Amber Gold Light
        "#FFF4B8", // Ivory Gold Sparkle
      ];

      const chars = ["✦", "★", "✦", "✧"];

      const newSparkle: Sparkle = {
        id: now + Math.random(),
        x: e.clientX,
        y: e.clientY,
        size: 10 + Math.random() * 12,
        color: vanguardGoldColors[Math.floor(Math.random() * vanguardGoldColors.length)],
        char: chars[Math.floor(Math.random() * chars.length)],
      };

      setSparkles((prev) => [...prev.slice(-18), newSparkle]);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    if (sparkles.length === 0) return;
    const timer = setTimeout(() => {
      setSparkles((prev) => prev.filter((s) => Date.now() - s.id < 650));
    }, 100);
    return () => clearTimeout(timer);
  }, [sparkles]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      {sparkles.map((s) => (
        <span
          key={s.id}
          className="fixed pointer-events-none animate-vanguard-star-drop select-none font-bold"
          style={{
            left: `${s.x}px`,
            top: `${s.y}px`,
            fontSize: `${s.size}px`,
            color: s.color,
          }}
        >
          {s.char}
        </span>
      ))}
    </div>
  );
}
