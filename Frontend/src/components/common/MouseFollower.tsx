import React, { useEffect, useRef } from "react";
import { useTheme } from "@/contexts/ThemeContext";

interface StardustParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  decay: number;
  color: string;
}

export const MouseFollower: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { theme } = useTheme();

  // Track mouse coordinates
  const mouseRef = useRef<{ x: number; y: number; lastX?: number; lastY?: number }>({ x: 0, y: 0 });
  const stateRef = useRef({
    isOffScreen: true,
    opacity: 0,
  });

  useEffect(() => {
    // Disable on mobile / touch devices for maximum battery and performance
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let isLoopActive = false;
    const particles: StardustParticle[] = [];

    const isDark = theme === "dark";

    // Refined, subtle Champagne Gold & Luminous Stardust palette
    const darkColors = [
      "rgba(226, 184, 59, 0.75)",   // Champagne Gold
      "rgba(245, 218, 140, 0.8)",   // Soft Light Gold
      "rgba(255, 255, 255, 0.85)",  // Pure Diamond Glow
      "rgba(215, 175, 240, 0.65)",  // Subtle Violet Tint
    ];

    const lightColors = [
      "rgba(197, 145, 45, 0.7)",    // Warm Amber Gold
      "rgba(160, 110, 30, 0.65)",   // Deep Classic Bronze
      "rgba(110, 85, 190, 0.6)",    // Soft Royal Indigo
      "rgba(240, 180, 60, 0.75)",   // Honey Gold
    ];

    const palette = isDark ? darkColors : lightColors;

    // Resize handler
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Create a subtle stardust particle
    const createParticle = (x: number, y: number, vxOffset = 0, vyOffset = 0): StardustParticle => {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 0.55 + 0.2; // Gentle float speed
      const color = palette[Math.floor(Math.random() * palette.length)];

      return {
        x,
        y,
        vx: Math.cos(angle) * speed + vxOffset * 0.06,
        vy: Math.sin(angle) * speed + vyOffset * 0.06 - 0.1, // Slight upward air drift
        size: Math.random() * 1.3 + 0.7, // Subtle size: 0.7px to 2.0px
        alpha: Math.random() * 0.25 + 0.65,
        decay: Math.random() * 0.03 + 0.045, // Fast, crisp fade in ~0.25s
        color,
      };
    };

    // Main animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const state = stateRef.current;

      // Handle visibility fade
      if (state.isOffScreen) {
        state.opacity = Math.max(0, state.opacity - 0.1);
      } else {
        state.opacity = Math.min(1, state.opacity + 0.1);
      }

      // Draw stardust particles (iterated backward for safe splicing)
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];

        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        const renderAlpha = p.alpha * state.opacity;
        if (renderAlpha <= 0) continue;

        ctx.globalAlpha = renderAlpha;
        ctx.fillStyle = p.color;

        // Draw soft stardust dot
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1.0;

      // Pause loop when all particles have faded and mouse is idle/off-screen
      if (particles.length === 0) {
        isLoopActive = false;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    const startLoopIfNeeded = () => {
      if (!isLoopActive) {
        isLoopActive = true;
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    // Mouse movement handler
    const handleMouseMove = (e: MouseEvent) => {
      const mouse = mouseRef.current;
      const state = stateRef.current;

      mouse.x = e.clientX;
      mouse.y = e.clientY;

      if (state.isOffScreen) {
        state.isOffScreen = false;
        mouse.lastX = e.clientX;
        mouse.lastY = e.clientY;
      }

      if (mouse.lastX === undefined) mouse.lastX = mouse.x;
      if (mouse.lastY === undefined) mouse.lastY = mouse.y;

      const dx = mouse.x - mouse.lastX;
      const dy = mouse.y - mouse.lastY;
      const dist = Math.hypot(dx, dy);

      // Spawn a gentle particle every 16px of travel
      if (dist >= 16) {
        const steps = Math.min(4, Math.floor(dist / 16));
        const vx = dx / steps;
        const vy = dy / steps;

        for (let k = 1; k <= steps; k++) {
          const ratio = k / steps;
          const ix = mouse.lastX + dx * ratio;
          const iy = mouse.lastY + dy * ratio;
          particles.push(createParticle(ix, iy, vx, vy));
        }

        mouse.lastX = mouse.x;
        mouse.lastY = mouse.y;
        startLoopIfNeeded();
      }
    };

    const handleMouseLeave = () => {
      stateRef.current.isOffScreen = true;
    };

    const handleMouseEnter = () => {
      stateRef.current.isOffScreen = false;
      const mouse = mouseRef.current;
      mouse.lastX = undefined;
      mouse.lastY = undefined;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{
        mixBlendMode: theme === "dark" ? "screen" : "normal",
        zIndex: 2147483647,
      }}
    />
  );
};

export default MouseFollower;
