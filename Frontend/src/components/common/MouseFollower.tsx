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
}

interface ClickRipple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  decay: number;
}

export const MouseFollower: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { theme } = useTheme();
  
  // Track mouse coordinates
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const stateRef = useRef({
    isHovered: false,
    isTextInput: false,
    isOffScreen: true,
    opacity: 0,
    hoverProgress: 0, // Smooth transition for hover effects
  });

  useEffect(() => {
    // Disable on mobile/touch devices
    const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;
    if (isTouchDevice) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Inject global style to hide the default browser cursor completely on desktop
    const styleElement = document.createElement("style");
    styleElement.innerHTML = `
      *, *::before, *::after {
        cursor: none !important;
      }
    `;
    document.head.appendChild(styleElement);

    let animationFrameId: number;
    let isLoopActive = true;
    const particles: Particle[] = [];
    const ripples: ClickRipple[] = [];

    const isDark = theme === "dark";
    const shadowColor = isDark ? "rgba(230, 194, 91, 0.6)" : "rgba(180, 130, 30, 0.45)";

    const darkColors = [
      "rgba(230, 194, 91, 1)",   // Champagne Gold Accent
      "rgba(255, 239, 186, 1)",  // Light glow gold
      "rgba(212, 175, 55, 1)",    // Premium Gold
      "rgba(255, 255, 255, 0.9)"  // Sparkling white
    ];

    const lightColors = [
      "rgba(197, 150, 60, 1)",   // Rich Gold/Amber
      "rgba(139, 90, 43, 1)",    // Deep Bronze
      "rgba(218, 165, 32, 1)",   // Goldenrod
      "rgba(180, 130, 30, 0.95)" // Darker Gold for visibility
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

    // Mouse movement handler
    const handleMouseMove = (e: MouseEvent) => {
      const mouse = mouseRef.current;
      const state = stateRef.current;

      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;

      if (state.isOffScreen) {
        state.isOffScreen = false;
      }

      startLoopIfNeeded();

      // Spawn dust trail with performance throttle (e.g. max once every 24ms)
      const now = performance.now();
      if (now - lastSpawnTime > 24) {
        const dist = Math.hypot(e.clientX - mouse.x, e.clientY - mouse.y);
        if (dist > 10) {
          // Spawn 1-2 trail particles
          const particleCount = dist > 25 ? 2 : 1;
          for (let i = 0; i < particleCount; i++) {
            particles.push(createParticle(e.clientX, e.clientY, false));
          }
          mouse.x = e.clientX;
          mouse.y = e.clientY;
          lastSpawnTime = now;
        }
      }
    };

    // Helper to create particles
    const createParticle = (x: number, y: number, isBurst = false): Particle => {
      const angle = Math.random() * Math.PI * 2;
      const speed = isBurst 
        ? Math.random() * 3 + 1.5 
        : Math.random() * 0.8 + 0.2;
      // Reduce star ratio (only ~12% stars, 88% dust) to avoid cluttering
      const isStar = Math.random() > 0.88;
      
      const color = goldColors[Math.floor(Math.random() * goldColors.length)];

      return {
        x,
        y,
        vx: Math.cos(angle) * speed + (isBurst ? 0 : (Math.random() - 0.5) * 0.5),
        vy: Math.sin(angle) * speed + (isBurst ? -1 : (Math.random() - 0.5) * 0.5),
        // Make particles slightly smaller and more elegant
        size: isStar ? Math.random() * 3 + 2 : Math.random() * 1.5 + 0.5,
        alpha: 1,
        decay: isBurst ? Math.random() * 0.02 + 0.015 : Math.random() * 0.025 + 0.015,
        color,
        isStar,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.05,
        gravity: isBurst ? 0.05 : 0.01,
      };
    };

    // Handle clicks for burst effect & shockwave ripple
    const handleMouseDown = (e: MouseEvent) => {
      const state = stateRef.current;
      if (state.isOffScreen) return;

      startLoopIfNeeded();

      // Add a shockwave ripple
      ripples.push({
        x: e.clientX,
        y: e.clientY,
        radius: 0,
        maxRadius: state.isHovered ? 40 : 28,
        alpha: 0.8,
        decay: 0.04,
      });

      // Add golden star burst particles (reduced count for cleaner burst)
      const burstCount = 8 + Math.floor(Math.random() * 6);
      for (let i = 0; i < burstCount; i++) {
        particles.push(createParticle(e.clientX, e.clientY, true));
      }
    };

    // Handle element hovers
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const interactive = target.closest(
        "a, button, input, select, textarea, [role='button'], .cursor-pointer, .interactive-card"
      );
      
      if (interactive) {
        stateRef.current.isHovered = true;
        // Check if it's a text input or textarea
        stateRef.current.isTextInput = !!interactive.closest("input, textarea");
        startLoopIfNeeded();
      }
    };

    const handleMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const interactive = target.closest(
        "a, button, input, select, textarea, [role='button'], .cursor-pointer, .interactive-card"
      );

      if (interactive) {
        stateRef.current.isHovered = false;
        stateRef.current.isTextInput = false;
        startLoopIfNeeded();
      }
    };

    const handleMouseLeave = () => {
      stateRef.current.isOffScreen = true;
    };

    const handleMouseEnter = () => {
      stateRef.current.isOffScreen = false;
      startLoopIfNeeded();
    };

    // Attach listeners
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseover", handleMouseOver);
    window.addEventListener("mouseout", handleMouseOut);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);

    // Draw star helper
    const drawStarShape = (
      c: CanvasRenderingContext2D,
      cx: number,
      cy: number,
      spikes: number,
      outerRadius: number,
      innerRadius: number,
      color: string,
      alpha: number,
      rotation: number
    ) => {
      let rot = (Math.PI / 2) * 3 + rotation;
      let x = cx;
      let y = cy;
      const step = Math.PI / spikes;

      c.save();
      c.globalAlpha = alpha;
      c.fillStyle = color;
      
      c.shadowBlur = isDark ? 4 : 2;
      c.shadowColor = shadowColor;

      c.beginPath();
      c.moveTo(cx, cy - outerRadius);
      for (let i = 0; i < spikes; i++) {
        x = cx + Math.cos(rot) * outerRadius;
        y = cy + Math.sin(rot) * outerRadius;
        c.lineTo(x, y);
        rot += step;

        x = cx + Math.cos(rot) * innerRadius;
        y = cy + Math.sin(rot) * innerRadius;
        c.lineTo(x, y);
        rot += step;
      }
      c.lineTo(cx, cy - outerRadius);
      c.closePath();
      c.fill();
      c.restore();
    };



    // Draw custom luxury cursor chevron (improved light mode and angle rotation)
    const drawCustomCursor = (c: CanvasRenderingContext2D, x: number, y: number, hoverProgress: number) => {
      // Scale: very subtle growth (max 4%) to keep click precision perfect
      const scale = 1.0 + hoverProgress * 0.04;

      c.save();
      
      // Translate to cursor tip
      c.translate(x, y);
      
      // Set premium drop shadow
      if (isDark) {
        c.shadowBlur = 8 + hoverProgress * 3;
        c.shadowColor = shadowColor;
      } else {
        // High-end dark drop shadow for Light Mode (Titanium Alabaster White background contrast)
        c.shadowBlur = 4 + hoverProgress * 1.5;
        c.shadowColor = "rgba(0, 0, 0, 0.18)";
        c.shadowOffsetX = 1.2;
        c.shadowOffsetY = 2.0;
      }
      
      // Draw Chevron Arrow Path (Adjusted to point more upright, matching standard OS cursor angle)
      c.beginPath();
      c.moveTo(0, 0);
      c.lineTo(18 * scale, 9 * scale);
      c.lineTo(7 * scale, 9 * scale);
      c.lineTo(3 * scale, 20 * scale);
      c.closePath();

      // Configure beautiful premium theme colors with smooth transitions
      if (isDark) {
        // Dark Mode: Solid golden fill, white border outline
        // Gold transition: (230, 194, 91) -> (255, 235, 160)
        const r = Math.round(230 + 25 * hoverProgress);
        const g = Math.round(194 + 41 * hoverProgress);
        const b = Math.round(91 + 69 * hoverProgress);
        c.fillStyle = `rgba(${r}, ${g}, ${b}, 1)`;
        c.fill();
        c.strokeStyle = "rgba(255, 255, 255, 0.95)";
      } else {
        // Light Mode: Premium Ivory/Alabaster white fill, golden border outline
        // Ivory transition: (253, 248, 235, 0.98) -> (255, 255, 255, 1.0)
        const r = Math.round(253 + 2 * hoverProgress);
        const g = Math.round(248 + 7 * hoverProgress);
        const b = Math.round(235 + 20 * hoverProgress);
        const a = 0.98 + 0.02 * hoverProgress;
        c.fillStyle = `rgba(${r}, ${g}, ${b}, ${a})`;
        c.fill();
        
        // Gold outline transition: (197, 150, 60, 0.95) -> (180, 130, 30, 1.0)
        const or = Math.round(197 - 17 * hoverProgress);
        const og = Math.round(150 - 20 * hoverProgress);
        const ob = Math.round(60 - 30 * hoverProgress);
        const oa = 0.95 + 0.05 * hoverProgress;
        c.strokeStyle = `rgba(${or}, ${og}, ${ob}, ${oa})`;
      }

      c.lineWidth = 1.35 * scale;
      c.stroke();

      // Draw a sleek target halo ring around the cursor tip when hovering (Vanguard design accent)
      if (hoverProgress > 0.01) {
        c.beginPath();
        // Ring expands from radius 10 to 14
        c.arc(0, 0, 10 + 4 * hoverProgress, 0, Math.PI * 2);
        c.strokeStyle = isDark 
          ? `rgba(230, 194, 91, ${hoverProgress * 0.55})` 
          : `rgba(180, 130, 30, ${hoverProgress * 0.45})`;
        c.lineWidth = 1.0;
        
        // Disable shadow temporarily for the ring to keep it sharp and clean
        c.shadowBlur = 0;
        c.shadowOffsetX = 0;
        c.shadowOffsetY = 0;
        c.stroke();
      }

      c.restore();
    };

    // Draw custom luxury I-Beam for text input elements
    const drawIBeamCursor = (c: CanvasRenderingContext2D, x: number, y: number) => {
      c.save();
      
      if (isDark) {
        c.strokeStyle = "rgba(255, 235, 160, 1)";
        c.shadowBlur = 6;
        c.shadowColor = shadowColor;
      } else {
        c.strokeStyle = "rgba(139, 90, 43, 1)"; // Warm dark bronze for high light-mode contrast
        c.shadowBlur = 3;
        c.shadowColor = "rgba(0, 0, 0, 0.15)";
        c.shadowOffsetX = 0.5;
        c.shadowOffsetY = 1.0;
      }

      c.lineWidth = 1.8;
      c.beginPath();
      // Top horizontal cap
      c.moveTo(x - 4, y - 8);
      c.lineTo(x + 4, y - 8);
      // Center vertical bar
      c.moveTo(x, y - 8);
      c.lineTo(x, y + 8);
      // Bottom horizontal cap
      c.moveTo(x - 4, y + 8);
      c.lineTo(x + 4, y + 8);
      
      c.stroke();
      c.restore();
    };

    // Main animation loop (optimized and using arrow function so TS respects outer scope null-narrowing of canvas/ctx)
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const mouse = mouseRef.current;
      const state = stateRef.current;

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
      if (state.hoverProgress === undefined || isNaN(state.hoverProgress)) {
        state.hoverProgress = 0;
      }

      // Smooth interpolation for hover progress
      if (state.isHovered) {
        state.hoverProgress += (1 - state.hoverProgress) * 0.15;
      } else {
        state.hoverProgress += (0 - state.hoverProgress) * 0.15;
      }

      // 1. Draw click shockwave ripples (iterated backward to avoid splice indexing skip bugs)
      for (let i = ripples.length - 1; i >= 0; i--) {
        const ripple = ripples[i];
        ripple.radius += (ripple.maxRadius - ripple.radius) * 0.12;
        ripple.alpha -= ripple.decay;

        if (ripple.alpha <= 0) {
          ripples.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
        ctx.strokeStyle = isDark 
          ? `rgba(230, 194, 91, ${ripple.alpha})` 
          : `rgba(180, 130, 30, ${ripple.alpha})`;
        ctx.lineWidth = 1.8;
        
        ctx.shadowBlur = isDark ? 8 : 4;
        ctx.shadowColor = shadowColor;
        ctx.stroke();
        ctx.restore();
      }

      // 2. Draw particle trail (iterated backward to avoid splice indexing skip bugs)
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy + p.gravity;
        p.rotation += p.rotationSpeed;
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        if (p.isStar) {
          drawStarShape(ctx, p.x, p.y, 4, p.size, p.size / 2.5, p.color, p.alpha * state.opacity, p.rotation);
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

      // 3. Draw custom cursor at exact mouse position
      if (state.opacity > 0) {
        ctx.save();
        ctx.globalAlpha = state.opacity;
        
        if (state.isTextInput) {
          // If hovering over an input/textarea, render the custom gold I-Beam
          drawIBeamCursor(ctx, mouse.targetX, mouse.targetY);
        } else {
          // Render the chevron cursor with smooth transitions
          drawCustomCursor(ctx, mouse.targetX, mouse.targetY, state.hoverProgress);
        }
        
        ctx.restore();
      }

      // Performance optimization: Pause the animation loop when off-screen and elements are fully decayed
      if (state.isOffScreen && state.opacity === 0 && particles.length === 0 && ripples.length === 0) {
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
      document.head.removeChild(styleElement);
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseover", handleMouseOver);
      window.removeEventListener("mouseout", handleMouseOut);
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
