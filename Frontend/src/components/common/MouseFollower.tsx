import React, { useEffect, useRef } from "react";
import { useTheme } from "@/contexts/ThemeContext";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  decay: number;
  color: string;
  isStar: boolean;
  rotation: number;
  rotationSpeed: number;
  gravity: number;
  history?: { x: number; y: number }[];
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
    // Disable on mobile/touch devices
    const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;
    if (isTouchDevice) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let isLoopActive = true;
    const particles: Particle[] = [];

    const isDark = theme === "dark";
    const shadowColor = isDark ? "rgba(230, 194, 91, 0.6)" : "rgba(180, 130, 30, 0.45)";

    // Elegant luxury cosmic Gold & Stardust palette
    const darkColors = [
      "rgba(230, 194, 91, 1)",    // Champagne Gold Accent
      "rgba(255, 235, 170, 1)",   // Radiant Light Gold
      "rgba(255, 190, 150, 1)",   // Celestial Rose Gold
      "rgba(224, 180, 255, 1)",   // Dreamy Violet Stardust
      "rgba(255, 255, 255, 0.95)" // Sparkle Diamond White
    ];

    const lightColors = [
      "rgba(197, 150, 60, 1)",    // Warm Honey Gold
      "rgba(139, 90, 43, 1)",     // Deep Bronze
      "rgba(110, 85, 200, 1)",    // Royal Indigo
      "rgba(220, 105, 75, 1)",    // Sunrise Amber Gold
      "rgba(255, 255, 255, 0.95)" // Pure Contrast White
    ];

    const goldColors = isDark ? darkColors : lightColors;

    // Resize handler
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    let lastSpawnTime = 0;
    let lastMouseMoveTime = 0;

    // Mouse movement handler
    const handleMouseMove = (e: MouseEvent) => {
      const mouse = mouseRef.current;
      const state = stateRef.current;

      mouse.x = e.clientX;
      mouse.y = e.clientY;
      lastMouseMoveTime = performance.now();

      if (state.isOffScreen) {
        state.isOffScreen = false;
        mouse.lastX = e.clientX;
        mouse.lastY = e.clientY;
      }

      startLoopIfNeeded();
    };

    // Helper to create particles
    const createParticle = (x: number, y: number, isBurst = false, extraVx = 0, extraVy = 0): Particle => {
      const angle = Math.random() * Math.PI * 2;
      const speed = isBurst 
        ? Math.random() * 3.5 + 1.5 
        : Math.random() * 0.9 + 0.3;
      
      // Star ratio (28% stars during motion)
      const isStar = Math.random() > 0.72;
      
      const color = goldColors[Math.floor(Math.random() * goldColors.length)];

      // Clamp extra velocity for smooth motion
      const clampVal = 4;
      const vxCarry = Math.max(-clampVal, Math.min(clampVal, extraVx * 0.12));
      const vyCarry = Math.max(-clampVal, Math.min(clampVal, extraVy * 0.12));

      return {
        x,
        y,
        vx: Math.cos(angle) * speed + (Math.random() - 0.5) * 0.6 + vxCarry,
        vy: Math.sin(angle) * speed + (Math.random() - 0.5) * 0.6 + vyCarry,
        size: isStar ? Math.random() * 3.5 + 2.8 : Math.random() * 1.5 + 0.4,
        alpha: 1,
        decay: Math.random() * 0.022 + 0.014,
        color,
        isStar,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.09,
        gravity: 0.008,
        history: isStar ? [] : undefined,
      };
    };

    const handleMouseLeave = () => {
      stateRef.current.isOffScreen = true;
    };

    const handleMouseEnter = () => {
      stateRef.current.isOffScreen = false;
      const mouse = mouseRef.current;
      mouse.lastX = undefined;
      mouse.lastY = undefined;
      lastMouseMoveTime = performance.now();
      startLoopIfNeeded();
    };

    // Attach listeners
    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);

    // Draw diamond luxury lens flare helper
    const drawDiamondFlare = (
      c: CanvasRenderingContext2D,
      cx: number,
      cy: number,
      size: number,
      color: string,
      alpha: number,
      rotation: number
    ) => {
      c.save();
      c.translate(cx, cy);
      c.rotate(rotation);
      c.globalAlpha = alpha;

      // Glow backing
      const glow = c.createRadialGradient(0, 0, 0, 0, 0, size * 1.6);
      glow.addColorStop(0, color);
      const translucentColor = color.replace(/[\d.]+\)$/, "0.32)");
      glow.addColorStop(0.3, translucentColor);
      glow.addColorStop(1, "rgba(0, 0, 0, 0)");
      c.fillStyle = glow;
      c.beginPath();
      c.arc(0, 0, size * 1.6, 0, Math.PI * 2);
      c.fill();

      // Vertical lens flare spike
      c.fillStyle = color;
      c.beginPath();
      c.moveTo(0, -size * 1.8);
      c.quadraticCurveTo(size * 0.15, 0, 0, size * 1.8);
      c.quadraticCurveTo(-size * 0.15, 0, 0, -size * 1.8);
      c.fill();

      // Horizontal lens flare spike
      c.beginPath();
      c.moveTo(-size * 1.8, 0);
      c.quadraticCurveTo(0, size * 0.15, size * 1.8, 0);
      c.quadraticCurveTo(0, -size * 0.15, -size * 1.8, 0);
      c.fill();

      // Diamond core center
      c.fillStyle = "#ffffff";
      c.beginPath();
      c.arc(0, 0, size * 0.42, 0, Math.PI * 2);
      c.fill();

      c.restore();
    };

    // Main animation loop (optimized and using arrow function so TS respects outer scope null-narrowing of canvas/ctx)
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const mouse = mouseRef.current;
      const state = stateRef.current;
      const now = performance.now();

      // Continuous spawning with interpolation for fast movements
      if (!state.isOffScreen) {
        if (mouse.lastX === undefined) mouse.lastX = mouse.x;
        if (mouse.lastY === undefined) mouse.lastY = mouse.y;

        const dx = mouse.x - mouse.lastX;
        const dy = mouse.y - mouse.lastY;
        const dist = Math.hypot(dx, dy);

        if (dist > 1) {
          // Spawn particles along the path of movement
          // Spawn one particle per 14px of movement
          const steps = Math.min(5, Math.floor(dist / 14));
          if (steps > 0) {
            const vx = dx / steps;
            const vy = dy / steps;

            for (let k = 1; k <= steps; k++) {
              const ratio = k / steps;
              const ix = mouse.lastX + dx * ratio;
              const iy = mouse.lastY + dy * ratio;
              
              particles.push(createParticle(ix, iy, false, vx, vy));
            }
            mouse.lastX = mouse.x;
            mouse.lastY = mouse.y;
            lastSpawnTime = now;
          }
        }
        
        // Steady idle spawn: only if mouse has moved very recently (within 200ms) but is moving slow,
        // spawn a beautiful sparkle every 70ms to keep the trail fluid and alive
        if (now - lastMouseMoveTime < 200 && now - lastSpawnTime > 70) {
          particles.push(createParticle(mouse.x, mouse.y, false));
          lastSpawnTime = now;
        }
      }

      // Handle visibility fade
      if (state.isOffScreen) {
        state.opacity = Math.max(0, state.opacity - 0.08);
      } else {
        state.opacity = Math.min(1, state.opacity + 0.08);
      }
      // Ensure state properties are valid numbers (resilient to HMR / NaN)
      if (state.opacity === undefined || isNaN(state.opacity)) {
        state.opacity = 0;
      }

      // 1. Draw particle trail (iterated backward to avoid splice indexing skip bugs)
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        
        // Update trajectory history for starry comet/shooting star trail effect
        if (p.isStar) {
          if (!p.history) p.history = [];
          p.history.unshift({ x: p.x, y: p.y });
          if (p.history.length > 7) {
            p.history.pop();
          }
          // Organic floating wave wind drift
          p.vx += Math.sin(p.y * 0.016 + p.rotation) * 0.04;
        }

        p.x += p.vx;
        p.y += p.vy + p.gravity;
        p.rotation += p.rotationSpeed;
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        if (p.isStar) {
          // Draw comet tail trail with custom linear gradient
          if (p.history && p.history.length > 1) {
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            for (let j = 0; j < p.history.length; j++) {
              ctx.lineTo(p.history[j].x, p.history[j].y);
            }
            
            const tailGlow = ctx.createLinearGradient(
              p.x, p.y, 
              p.history[p.history.length - 1].x, 
              p.history[p.history.length - 1].y
            );
            tailGlow.addColorStop(0, p.color);
            tailGlow.addColorStop(1, "rgba(255, 255, 255, 0)");
            
            ctx.strokeStyle = tailGlow;
            ctx.lineWidth = p.size * 0.55;
            ctx.lineCap = "round";
            ctx.lineJoin = "round";
            ctx.globalAlpha = p.alpha * state.opacity * 0.42;
            
            ctx.shadowBlur = isDark ? 6 : 3;
            ctx.shadowColor = shadowColor;
            ctx.stroke();
            ctx.restore();
          }

          // Twinkle effect (oscillate size dynamically based on rotation)
          const twinkle = 0.82 + 0.32 * Math.sin(p.rotation * 3.5);
          const drawSize = p.size * twinkle;

          // Draw sharper diamond lens flare
          drawDiamondFlare(ctx, p.x, p.y, drawSize, p.color, p.alpha * state.opacity, p.rotation);
        } else {
          // Optimized circle rendering: avoided slow ctx.save() & ctx.restore() inside loop
          ctx.globalAlpha = p.alpha * state.opacity;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1.0; // Reset global alpha after the batch

      // Performance optimization: Pause the animation loop when off-screen and elements are fully decayed
      if (state.isOffScreen && state.opacity === 0 && particles.length === 0) {
        isLoopActive = false;
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Make sure canvas is fully cleared
        return;
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    const startLoopIfNeeded = () => {
      if (!isLoopActive) {
        isLoopActive = true;
        animate();
      }
    };

    // Start the animation loop initially
    animate();

    // Clean up on component unmount
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
