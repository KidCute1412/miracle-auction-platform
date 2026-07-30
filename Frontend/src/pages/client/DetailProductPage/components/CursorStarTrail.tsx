import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rotation: number;
  rotationSpeed: number;
  alpha: number;
  decay: number;
  color: string;
}

export default function CursorStarTrail() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    const particles: Particle[] = [];
    let lastSpawn = 0;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Exact Vanguard Elite Champagne Gold palette using OKLCH & curated metallic tones
    const vanguardGoldPalette = [
      "oklch(0.78 0.09 75)",        // Primary Vanguard Champagne Gold
      "oklch(0.84 0.08 80)",        // Bright Champagne Glow
      "oklch(0.72 0.09 70)",        // Deep Metallic Gold
      "rgba(245, 212, 120, 0.95)",   // Titanium Ivory Gold
      "rgba(229, 193, 88, 0.9)",     // Prestige VIP Gold
    ];

    const drawStar = (
      context: CanvasRenderingContext2D,
      cx: number,
      cy: number,
      spikes: number,
      outerRadius: number,
      innerRadius: number,
      rotation: number
    ) => {
      let rot = (Math.PI / 2) * 3 + rotation;
      let x = cx;
      let y = cy;
      const step = Math.PI / spikes;

      context.beginPath();
      context.moveTo(cx + Math.cos(rot) * outerRadius, cy + Math.sin(rot) * outerRadius);

      for (let i = 0; i < spikes; i++) {
        x = cx + Math.cos(rot) * outerRadius;
        y = cy + Math.sin(rot) * outerRadius;
        context.lineTo(x, y);
        rot += step;

        x = cx + Math.cos(rot) * innerRadius;
        y = cy + Math.sin(rot) * innerRadius;
        context.lineTo(x, y);
        rot += step;
      }
      context.lineTo(cx + Math.cos(rot) * outerRadius, cy + Math.sin(rot) * outerRadius);
      context.closePath();
    };

    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      // Throttle spawn to maintain high performance and elegant density
      if (now - lastSpawn < 30) return;
      lastSpawn = now;

      // Spawn 1-2 particles per move event for rich natural trail
      const count = Math.random() > 0.6 ? 2 : 1;
      for (let i = 0; i < count; i++) {
        particles.push({
          x: e.clientX + (Math.random() * 8 - 4),
          y: e.clientY + (Math.random() * 8 - 4),
          vx: (Math.random() - 0.5) * 1.2,
          vy: Math.random() * 1.5 + 0.8, // Initial downward gravity speed
          size: Math.random() * 6 + 5,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.08,
          alpha: 1,
          decay: Math.random() * 0.02 + 0.022, // Smooth fade duration (~600ms)
          color: vanguardGoldPalette[Math.floor(Math.random() * vanguardGoldPalette.length)],
        });
      }
    };

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.06; // Smooth gravity acceleration for natural downward drop
        p.rotation += p.rotationSpeed;
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.shadowColor = "rgba(229, 193, 88, 0.8)";
        ctx.shadowBlur = 10;

        drawStar(ctx, p.x, p.y, 4, p.size, p.size * 0.4, p.rotation);
        ctx.fill();
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    window.addEventListener("mousemove", handleMouseMove);
    render();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[9999]"
      style={{ pointerEvents: "none" }}
    />
  );
}
